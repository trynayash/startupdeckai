import { pitchDecks, users, type PitchDeck, type InsertPitchDeck, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Pitch deck operations
  getPitchDeck(id: number): Promise<PitchDeck | undefined>;
  createPitchDeck(pitchDeck: InsertPitchDeck): Promise<PitchDeck>;
  getAllPitchDecks(): Promise<PitchDeck[]>;
  deletePitchDeck(id: number): Promise<void>;
  
  // User operations
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserUsage(id: number, validationsUsed?: number, pitchDecksUsed?: number): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Pitch deck operations
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

  // User operations
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserUsage(id: number, validationsUsed?: number, pitchDecksUsed?: number): Promise<User> {
    const updateData: any = {};
    if (validationsUsed !== undefined) {
      updateData.validationsUsed = validationsUsed;
    }
    if (pitchDecksUsed !== undefined) {
      updateData.pitchDecksUsed = pitchDecksUsed;
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
}

export class MemStorage implements IStorage {
  private pitchDecks: Map<number, PitchDeck>;
  private users: Map<number, User>;
  private currentPitchDeckId: number;
  private currentUserId: number;

  constructor() {
    this.pitchDecks = new Map();
    this.users = new Map();
    this.currentPitchDeckId = 1;
    this.currentUserId = 1;
  }

  // Pitch deck operations
  async getPitchDeck(id: number): Promise<PitchDeck | undefined> {
    return this.pitchDecks.get(id);
  }

  async createPitchDeck(insertPitchDeck: InsertPitchDeck): Promise<PitchDeck> {
    const id = this.currentPitchDeckId++;
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

  // User operations
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      tier: "free",
      validationsUsed: 0,
      pitchDecksUsed: 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserUsage(id: number, validationsUsed?: number, pitchDecksUsed?: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = {
      ...user,
      validationsUsed: validationsUsed ?? user.validationsUsed,
      pitchDecksUsed: pitchDecksUsed ?? user.pitchDecksUsed,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
}

export const storage = new DatabaseStorage();
