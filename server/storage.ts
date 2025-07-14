import { pitchDecks, type PitchDeck, type InsertPitchDeck } from "@shared/schema";

export interface IStorage {
  getPitchDeck(id: number): Promise<PitchDeck | undefined>;
  createPitchDeck(pitchDeck: InsertPitchDeck): Promise<PitchDeck>;
  getAllPitchDecks(): Promise<PitchDeck[]>;
  deletePitchDeck(id: number): Promise<void>;
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

export const storage = new MemStorage();
