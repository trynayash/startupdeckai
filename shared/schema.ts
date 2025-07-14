import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  tier: text("tier").notNull().default("free"), // 'free', 'pro', 'enterprise'
  validationsUsed: integer("validations_used").notNull().default(0),
  pitchDecksUsed: integer("pitch_decks_used").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pitchDecks = pgTable("pitch_decks", {
  id: serial("id").primaryKey(),
  startupName: text("startup_name").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  marketSize: jsonb("market_size").notNull(), // { tam: string, sam: string, som: string, description: string }
  businessModel: jsonb("business_model").notNull(), // Array of revenue streams
  techStack: jsonb("tech_stack").notNull(), // Array of technologies
  team: jsonb("team").notNull(), // Array of team members
  summary: text("summary").notNull(),
  originalPrompt: text("original_prompt").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPitchDeckSchema = createInsertSchema(pitchDecks).omit({
  id: true,
  createdAt: true,
});

export const generatePitchDeckSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  model: z.string().optional().default("llama3.2"),
});

export const validateBusinessIdeaSchema = z.object({
  idea: z.string().min(1, "Business idea is required"),
  model: z.string().optional().default("llama3.2"),
  includesPitchDeck: z.boolean().optional().default(false),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPitchDeck = z.infer<typeof insertPitchDeckSchema>;
export type PitchDeck = typeof pitchDecks.$inferSelect;
export type GeneratePitchDeckRequest = z.infer<typeof generatePitchDeckSchema>;

// Frontend-only types for local storage
export interface PitchDeckData {
  id: string;
  startupName: string;
  problem: string;
  solution: string;
  marketSize: {
    tam: string;
    sam: string;
    som: string;
    description: string;
  };
  businessModel: Array<{
    name: string;
    description: string;
    revenue?: string;
  }>;
  techStack: Array<{
    name: string;
    category: string;
  }>;
  team: Array<{
    role: string;
    description: string;
    initials: string;
  }>;
  summary: string;
  originalPrompt: string;
  generatedAt: string;
}

// Business validation and analysis types
export interface BusinessValidation {
  id: string;
  originalIdea: string;
  validationScore: number; // 0-100
  confidence: number; // 0-100
  stage: 'idea' | 'mvp' | 'growth';
  recommendation: 'go' | 'wait' | 'pivot';
  analysis: {
    problemSolutionFit: {
      score: number;
      insights: string[];
      concerns: string[];
    };
    marketSize: {
      tam: string;
      sam: string;
      som: string;
      score: number;
      description: string;
    };
    targetAudience: {
      primary: string;
      secondary: string;
      demographics: string;
      psychographics: string;
      score: number;
    };
    competitors: Array<{
      name: string;
      type: 'direct' | 'indirect';
      strengths: string[];
      weaknesses: string[];
    }>;
    businessModel: {
      primaryRevenue: string;
      secondaryRevenue: string[];
      scalability: number;
      feasibility: number;
    };
    techStack: Array<{
      name: string;
      category: string;
      complexity: 'low' | 'medium' | 'high';
      cost: 'low' | 'medium' | 'high';
    }>;
    strengths: string[];
    weaknesses: string[];
    risks: string[];
    opportunities: string[];
  };
  pitchDeck?: PitchDeckData;
  createdAt: string;
}

export interface OllamaSettings {
  endpoint: string;
  model: string;
  autoSave: boolean;
}
