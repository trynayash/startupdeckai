import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

export interface OllamaSettings {
  endpoint: string;
  model: string;
  autoSave: boolean;
}
