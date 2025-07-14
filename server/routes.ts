import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePitchDeckSchema, validateBusinessIdeaSchema } from "@shared/schema";
import { Ollama } from "ollama";

export async function registerRoutes(app: Express): Promise<Server> {
  const ollama = new Ollama({
    host: process.env.OLLAMA_HOST || "http://localhost:11434",
  });

  // Generate pitch deck endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, model } = generatePitchDeckSchema.parse(req.body);
      
      // Check if Ollama is available
      try {
        await ollama.list();
      } catch (error) {
        return res.status(503).json({
          error: "Ollama service is not available. Please ensure Ollama is running on your system.",
          details: "Visit https://ollama.com for installation instructions."
        });
      }

      const systemPrompt = `You are an expert startup consultant and pitch deck generator. Given a problem or keyword, generate a comprehensive startup pitch deck with the following structure. Return ONLY a valid JSON object with these exact fields:

{
  "startupName": "Creative, memorable startup name",
  "problem": "Clear problem statement (2-3 sentences)",
  "solution": "Compelling solution description (2-3 sentences)",
  "marketSize": {
    "tam": "Total Addressable Market (e.g., $240B)",
    "sam": "Serviceable Addressable Market (e.g., $45B)",
    "som": "Serviceable Obtainable Market (e.g., $2.8B)",
    "description": "Brief market context (1-2 sentences)"
  },
  "businessModel": [
    {
      "name": "Revenue Stream 1",
      "description": "Description of revenue stream",
      "revenue": "Expected revenue range"
    },
    {
      "name": "Revenue Stream 2", 
      "description": "Description of revenue stream",
      "revenue": "Expected revenue range"
    }
  ],
  "techStack": [
    {"name": "Technology 1", "category": "Frontend/Backend/Database/AI/etc"},
    {"name": "Technology 2", "category": "Frontend/Backend/Database/AI/etc"}
  ],
  "team": [
    {
      "role": "CEO/CTO/VP Product/etc",
      "description": "Background and expertise",
      "initials": "AA"
    }
  ],
  "summary": "Executive summary (3-4 sentences covering problem, solution, market opportunity, and ask)"
}

Make the startup realistic, innovative, and investible. Base all content on the provided prompt but be creative and specific.`;

      const response = await ollama.chat({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a startup pitch deck for: ${prompt}` }
        ],
        stream: false,
      });

      let content = response.message.content.trim();
      
      // Extract JSON from response if it contains extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }

      let pitchDeckData;
      try {
        pitchDeckData = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse LLM response:", content);
        return res.status(500).json({
          error: "Failed to parse AI response. Please try again.",
          details: "The AI response was not in the expected format."
        });
      }

      // Validate required fields
      const requiredFields = ['startupName', 'problem', 'solution', 'marketSize', 'businessModel', 'techStack', 'team', 'summary'];
      for (const field of requiredFields) {
        if (!pitchDeckData[field]) {
          return res.status(500).json({
            error: `AI response missing required field: ${field}`,
            details: "Please try regenerating the pitch deck."
          });
        }
      }

      // Store the generated pitch deck
      const savedDeck = await storage.createPitchDeck({
        ...pitchDeckData,
        originalPrompt: prompt,
      });

      res.json({
        success: true,
        pitchDeck: {
          id: savedDeck.id.toString(),
          ...pitchDeckData,
          originalPrompt: prompt,
          generatedAt: savedDeck.createdAt.toISOString(),
        }
      });

    } catch (error) {
      console.error("Error generating pitch deck:", error);
      res.status(500).json({
        error: "Failed to generate pitch deck",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Check Ollama status
  app.get("/api/status", async (req, res) => {
    try {
      const models = await ollama.list();
      res.json({
        status: "connected",
        models: models.models.map(m => ({
          name: m.name,
          size: m.size
        }))
      });
    } catch (error) {
      res.status(503).json({
        status: "disconnected",
        error: "Ollama service is not available"
      });
    }
  });

  // Get all saved pitch decks
  app.get("/api/decks", async (req, res) => {
    try {
      const decks = await storage.getAllPitchDecks();
      res.json(decks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pitch decks" });
    }
  });

  // Delete a pitch deck
  app.delete("/api/decks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePitchDeck(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete pitch deck" });
    }
  });

  // Business idea validation endpoint
  app.post("/api/validate", async (req, res) => {
    try {
      const { idea, model, includesPitchDeck } = validateBusinessIdeaSchema.parse(req.body);
      
      // Check if Ollama is available
      try {
        await ollama.list();
      } catch (error) {
        return res.status(503).json({
          error: "Ollama service is not available. Please ensure Ollama is running on your system.",
          details: "Visit https://ollama.com for installation instructions."
        });
      }

      const validationPrompt = `You are an expert business analyst and startup consultant. Analyze the following business idea comprehensively and return ONLY a valid JSON object with detailed validation data.

Business Idea: "${idea}"

Return this exact JSON structure:
{
  "startupName": "Creative, memorable name for this startup",
  "validationScore": 85,
  "confidence": 78,
  "stage": "idea",
  "recommendation": "go",
  "analysis": {
    "problemSolutionFit": {
      "score": 82,
      "insights": ["Key insight 1", "Key insight 2", "Key insight 3"],
      "concerns": ["Concern 1", "Concern 2"]
    },
    "marketSize": {
      "tam": "$50B",
      "sam": "$8B", 
      "som": "$400M",
      "score": 75,
      "description": "Brief market context and growth potential"
    },
    "targetAudience": {
      "primary": "Primary customer segment",
      "secondary": "Secondary customer segment", 
      "demographics": "Age, income, location details",
      "psychographics": "Behavior, values, pain points",
      "score": 88
    },
    "competitors": [
      {
        "name": "Competitor 1",
        "type": "direct",
        "strengths": ["Strength 1", "Strength 2"],
        "weaknesses": ["Weakness 1", "Weakness 2"]
      },
      {
        "name": "Competitor 2", 
        "type": "indirect",
        "strengths": ["Strength 1"],
        "weaknesses": ["Weakness 1", "Weakness 2"]
      }
    ],
    "businessModel": {
      "primaryRevenue": "Main revenue stream description",
      "secondaryRevenue": ["Secondary stream 1", "Secondary stream 2"],
      "scalability": 85,
      "feasibility": 78
    },
    "techStack": [
      {"name": "Technology 1", "category": "Frontend", "complexity": "medium", "cost": "low"},
      {"name": "Technology 2", "category": "Backend", "complexity": "high", "cost": "medium"},
      {"name": "Technology 3", "category": "Database", "complexity": "low", "cost": "low"}
    ],
    "strengths": ["Major strength 1", "Major strength 2", "Major strength 3"],
    "weaknesses": ["Key weakness 1", "Key weakness 2"],
    "risks": ["Risk 1", "Risk 2", "Risk 3"],
    "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
  }
}

Rules:
- validationScore: 0-100 overall business viability
- confidence: 0-100 how confident the analysis is
- stage: "idea", "mvp", or "growth" 
- recommendation: "go", "wait", or "pivot"
- All scores should be realistic numbers between 0-100
- Make insights specific and actionable
- Consider real market conditions and competition
- Be honest about weaknesses and risks`;

      const response = await ollama.chat({
        model: model,
        messages: [
          { role: "user", content: validationPrompt }
        ],
        stream: false,
      });

      let content = response.message.content.trim();
      
      // Extract JSON from response if it contains extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }

      let validationData;
      try {
        validationData = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse validation response:", content);
        return res.status(500).json({
          error: "Failed to parse AI response. Please try again.",
          details: "The AI response was not in the expected format."
        });
      }

      // Create the business validation object
      const businessValidation = {
        id: Date.now().toString(),
        originalIdea: idea,
        ...validationData,
        createdAt: new Date().toISOString(),
      };

      // If pitch deck is requested, generate it too
      if (includesPitchDeck) {
        const pitchDeckPrompt = `Based on this validated business idea, create a professional pitch deck. Return ONLY valid JSON:

Business: ${validationData.startupName}
Problem/Solution: Based on the analysis provided
Market: ${validationData.analysis.marketSize.description}

{
  "startupName": "${validationData.startupName}",
  "problem": "Clear problem statement based on analysis",
  "solution": "Compelling solution description", 
  "marketSize": {
    "tam": "${validationData.analysis.marketSize.tam}",
    "sam": "${validationData.analysis.marketSize.sam}",
    "som": "${validationData.analysis.marketSize.som}",
    "description": "${validationData.analysis.marketSize.description}"
  },
  "businessModel": [
    {"name": "Revenue Stream 1", "description": "Description", "revenue": "Amount"},
    {"name": "Revenue Stream 2", "description": "Description", "revenue": "Amount"}
  ],
  "techStack": [
    {"name": "Tech 1", "category": "Category"},
    {"name": "Tech 2", "category": "Category"}
  ],
  "team": [
    {"role": "CEO", "description": "Background needed", "initials": "AA"},
    {"role": "CTO", "description": "Technical background", "initials": "BB"}
  ],
  "summary": "Executive summary covering problem, solution, market, and ask"
}`;

        const pitchResponse = await ollama.chat({
          model: model,
          messages: [{ role: "user", content: pitchDeckPrompt }],
          stream: false,
        });

        let pitchContent = pitchResponse.message.content.trim();
        const pitchJsonMatch = pitchContent.match(/\{[\s\S]*\}/);
        if (pitchJsonMatch) {
          pitchContent = pitchJsonMatch[0];
        }

        try {
          const pitchDeckData = JSON.parse(pitchContent);
          businessValidation.pitchDeck = {
            id: Date.now().toString(),
            ...pitchDeckData,
            originalPrompt: idea,
            generatedAt: new Date().toISOString(),
          };
        } catch (pitchError) {
          console.error("Failed to parse pitch deck response:", pitchContent);
          // Continue without pitch deck if it fails
        }
      }

      res.json({
        success: true,
        validation: businessValidation
      });

    } catch (error) {
      console.error("Error validating business idea:", error);
      res.status(500).json({
        error: "Failed to validate business idea",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
