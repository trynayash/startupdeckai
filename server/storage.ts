import { pitchDecks, type PitchDeck, type InsertPitchDeck } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getPitchDeck(id: number): Promise<PitchDeck | undefined>;
  createPitchDeck(pitchDeck: InsertPitchDeck): Promise<PitchDeck>;
  getAllPitchDecks(): Promise<PitchDeck[]>;
  deletePitchDeck(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPitchDeck(id: number): Promise<PitchDeck | undefined> {
    const [pitchDeck] = await db.select().from(pitchDecks).where(eq(pitchDecks.id, id));
    return pitchDeck || undefined;
  }

  async createPitchDeck(insertPitchDeck: InsertPitchDeck): Promise<PitchDeck> {
    const [pitchDeck] = await db
      .insert(pitchDecks)
      .values(insertPitchDeck)
      .returning();
    return pitchDeck;
  }

  async getAllPitchDecks(): Promise<PitchDeck[]> {
    return await db
      .select()
      .from(pitchDecks)
      .orderBy(desc(pitchDecks.createdAt));
  }

  async deletePitchDeck(id: number): Promise<void> {
    await db.delete(pitchDecks).where(eq(pitchDecks.id, id));
  }
}

export class MemStorage implements IStorage {
  private pitchDecks: Map<number, PitchDeck>;
  currentId: number;

  constructor() {
    this.pitchDecks = new Map();
    this.currentId = 1;
  }

  async getPitchDeck(id: number): Promise<PitchDeck | undefined> {
    return this.pitchDecks.get(id);
  }

  async createPitchDeck(insertPitchDeck: InsertPitchDeck): Promise<PitchDeck> {
    const id = this.currentId++;
    const pitchDeck: PitchDeck = {
      ...insertPitchDeck,
      id,
      createdAt: new Date(),
    };
    this.pitchDecks.set(id, pitchDeck);
    return pitchDeck;
  }

  async getAllPitchDecks(): Promise<PitchDeck[]> {
    return Array.from(this.pitchDecks.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async deletePitchDeck(id: number): Promise<void> {
    this.pitchDecks.delete(id);
  }
}

export const storage = new DatabaseStorage();
