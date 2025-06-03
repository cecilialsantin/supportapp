import { 
  supportRequests, 
  technicians, 
  knowledgeBaseArticles, 
  systemNotifications, 
  users, 
  type SupportRequest, 
  type InsertSupportRequest, 
  type Technician, 
  type InsertTechnician, 
  type KnowledgeBaseArticle, 
  type InsertKnowledgeBaseArticle, 
  type SystemNotification, 
  type User, 
  type InsertUser 
} from "@shared/schema";

import { db } from "./db";

import { eq } from "drizzle-orm";

export interface IStorage {
  getSupportRequests(): Promise<SupportRequest[]>;
  getSupportRequest(id: number): Promise<SupportRequest | undefined>;
  createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest>;
  updateSupportRequest(id: number, updates: Partial<SupportRequest>): Promise<SupportRequest | undefined>;

  getTechnicians(): Promise<Technician[]>;
  getTechnician(id: number): Promise<Technician | undefined>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined>;

  getKnowledgeBaseArticles(): Promise<KnowledgeBaseArticle[]>;
  getKnowledgeBaseArticle(id: number): Promise<KnowledgeBaseArticle | undefined>;
  createKnowledgeBaseArticle(article: InsertKnowledgeBaseArticle): Promise<KnowledgeBaseArticle>;

  getSystemNotifications(): Promise<SystemNotification[]>;
  updateSystemNotification(id: number, updates: Partial<SystemNotification>): Promise<SystemNotification | undefined>;

  getUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DbStorage implements IStorage {
  async getSupportRequests(): Promise<SupportRequest[]> {
    return await db.select().from(supportRequests);
  }

  async getSupportRequest(id: number): Promise<SupportRequest | undefined> {
    const [request] = await db.select().from(supportRequests).where(eq(supportRequests.id, id));
    return request;
  }

  async createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest> {
    const result = await db.insert(supportRequests).values(request);
    const [created] = await db.select().from(supportRequests).where(eq(supportRequests.serialNumber, request.serialNumber));
    return created;
  }

  async updateSupportRequest(id: number, updates: Partial<SupportRequest>): Promise<SupportRequest | undefined> {
    await db.update(supportRequests).set(updates).where(eq(supportRequests.id, id));
    const [updated] = await db.select().from(supportRequests).where(eq(supportRequests.id, id));
    return updated;
  }

  async getTechnicians(): Promise<Technician[]> {
    return await db.select().from(technicians);
  }

  async getTechnician(id: number): Promise<Technician | undefined> {
    const [tech] = await db.select().from(technicians).where(eq(technicians.id, id));
    return tech;
  }

  async createTechnician(technician: InsertTechnician): Promise<Technician> {
    const result = await db.insert(technicians).values(technician);
    const [created] = await db.select().from(technicians).where(eq(technicians.email, technician.email));
    return created;
  }

  async updateTechnician(id: number, updates: Partial<Technician>): Promise<Technician | undefined> {
    await db.update(technicians).set(updates).where(eq(technicians.id, id));
    const [updated] = await db.select().from(technicians).where(eq(technicians.id, id));
    return updated;
  }

  async getKnowledgeBaseArticles(): Promise<KnowledgeBaseArticle[]> {
    return await db.select().from(knowledgeBaseArticles);
  }

  async getKnowledgeBaseArticle(id: number): Promise<KnowledgeBaseArticle | undefined> {
    const [article] = await db.select().from(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.id, id));
    return article;
  }

  async createKnowledgeBaseArticle(article: InsertKnowledgeBaseArticle): Promise<KnowledgeBaseArticle> {
    const result = await db.insert(knowledgeBaseArticles).values(article);
    const [created] = await db.select().from(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.title, article.title));
    return created;
  }

  async getSystemNotifications(): Promise<SystemNotification[]> {
    return await db.select().from(systemNotifications);
  }

  async updateSystemNotification(id: number, updates: Partial<SystemNotification>): Promise<SystemNotification | undefined> {
    await db.update(systemNotifications).set(updates).where(eq(systemNotifications.id, id));
    const [updated] = await db.select().from(systemNotifications).where(eq(systemNotifications.id, id));
    return updated;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user);
    const [created] = await db.select().from(users).where(eq(users.email, user.email));
    return created;
  }
}

export const storage = new DbStorage();
