import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePitchDeckSchema, validateBusinessIdeaSchema } from "@shared/schema";

// Simple session store for demo purposes
const sessions = new Map<string, { userId: number; username: string }>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function callOpenRouter(messages: any[], model: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages
    })
  });
  if (!response.ok) throw new Error('OpenRouter API error');
  return response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = sessions.get(sessionId);
    next();
  };

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Create user (in production, hash the password!)
      const user = await storage.createUser({ username, password });
      
      // Create session
      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id, username: user.username });

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          tier: user.tier,
          validationsUsed: user.validationsUsed,
          pitchDecksUsed: user.pitchDecksUsed 
        }, 
        sessionId 
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Create session
      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id, username: user.username });

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          tier: user.tier,
          validationsUsed: user.validationsUsed,
          pitchDecksUsed: user.pitchDecksUsed 
        }, 
        sessionId 
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Failed to sign in' });
    }
  });

  app.post('/api/auth/signout', (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ success: true });
  });

  // OAuth preparation routes (to be implemented with actual OAuth providers)
  app.get('/api/auth/google', (req, res) => {
    res.status(501).json({ error: 'OAuth integration coming soon' });
  });

  app.get('/api/auth/github', (req, res) => {
    res.status(501).json({ error: 'OAuth integration coming soon' });
  });

  app.get('/api/auth/twitter', (req, res) => {
    res.status(501).json({ error: 'OAuth integration coming soon' });
  });

  app.get('/api/auth/me', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        tier: user.tier,
        validationsUsed: user.validationsUsed,
        pitchDecksUsed: user.pitchDecksUsed
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // Generate pitch deck endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, model } = generatePitchDeckSchema.parse(req.body);
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
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a startup pitch deck for: ${prompt}` }
      ];
      const openrouterModel = model || process.env.OPENROUTER_MODEL || "deepseek-chat";
      const response = await callOpenRouter(messages, openrouterModel);
      let content = response.choices?.[0]?.message?.content?.trim() || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) content = jsonMatch[0];
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

  // Business idea validation endpoint
  app.post("/api/validate", async (req, res) => {
    try {
      const { idea, model, includesPitchDeck } = validateBusinessIdeaSchema.parse(req.body);
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
      const messages = [
        { role: "user", content: validationPrompt }
      ];
      const openrouterModel = model || process.env.OPENROUTER_MODEL || "deepseek-chat";
      const response = await callOpenRouter(messages, openrouterModel);
      let content = response.choices?.[0]?.message?.content?.trim() || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) content = jsonMatch[0];
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
        const pitchMessages = [
          { role: "user", content: pitchDeckPrompt }
        ];
        try {
          const pitchResponse = await callOpenRouter(pitchMessages, openrouterModel);
          let pitchContent = pitchResponse.choices?.[0]?.message?.content?.trim() || "";
          const pitchJsonMatch = pitchContent.match(/\{[\s\S]*\}/);
          if (pitchJsonMatch) pitchContent = pitchJsonMatch[0];
          const pitchDeckData = JSON.parse(pitchContent);
          businessValidation.pitchDeck = {
            id: Date.now().toString(),
            ...pitchDeckData,
            originalPrompt: idea,
            generatedAt: new Date().toISOString(),
          };
        } catch (pitchError) {
          console.error("Failed to parse pitch deck response:", pitchError);
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

  const httpServer = createServer(app);
  return httpServer;
}
