// schema.ts adaptado para MySQL con drizzle-orm
import { mysqlTable, text, serial, int, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Support Requests Table
export const supportRequests = mysqlTable("support_requests", {
  id: serial("id").primaryKey(),
  serialNumber: text("serial_number").notNull(),
  priority: text("priority").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  contactNumber: text("contact_number"),
  status: text("status").notNull().default("open"),
  assignedTechnician: text("assigned_technician"),
  submittedBy: text("submitted_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Technicians Table
export const technicians = mysqlTable("technicians", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  specialty: text("specialty").notNull(),
  status: text("status").notNull().default("available"),
  activeRequests: int("active_requests").default(0),
});

// Knowledge Base Articles Table
export const knowledgeBaseArticles = mysqlTable("knowledge_base_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  readTime: int("read_time").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// System Notifications Table
export const systemNotifications = mysqlTable("system_notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  lastActivity: timestamp("last_activity").defaultNow(),
});

// Users Table
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin', 'technician', 'user'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create insert schemas
export const insertSupportRequestSchema = createInsertSchema(supportRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
}).extend({
  priority: z.enum(["low", "medium", "high"]),
  location: z.string().min(1, "Location is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const insertTechnicianSchema = createInsertSchema(technicians).omit({
  id: true,
  activeRequests: true,
}).extend({
  status: z.enum(["available", "busy", "off_duty"]),
});

export const insertKnowledgeBaseArticleSchema = createInsertSchema(knowledgeBaseArticles).omit({
  id: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Export types
export type InsertSupportRequest = z.infer<typeof insertSupportRequestSchema>;
export type SupportRequest = typeof supportRequests.$inferSelect;

export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type Technician = typeof technicians.$inferSelect;

export type InsertKnowledgeBaseArticle = z.infer<typeof insertKnowledgeBaseArticleSchema>;
export type KnowledgeBaseArticle = typeof knowledgeBaseArticles.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type SystemNotification = typeof systemNotifications.$inferSelect;
