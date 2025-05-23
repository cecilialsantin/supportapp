import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Support Requests Table
export const supportRequests = pgTable("support_requests", {
  id: serial("id").primaryKey(),
  serialNumber: text("serial_number").notNull(),
  priority: text("priority").notNull(), // 'low', 'medium', 'high'
  description: text("description").notNull(),
  location: text("location").notNull(),
  contactNumber: text("contact_number"),
  status: text("status").notNull().default("open"), // 'open', 'in_progress', 'resolved', 'closed'
  assignedTechnician: text("assigned_technician"),
  submittedBy: text("submitted_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Technicians Table
export const technicians = pgTable("technicians", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  specialty: text("specialty").notNull(),
  status: text("status").notNull().default("available"), // 'available', 'busy', 'off_duty'
  activeRequests: integer("active_requests").default(0),
});

// Knowledge Base Articles Table
export const knowledgeBaseArticles = pgTable("knowledge_base_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  readTime: integer("read_time").notNull(), // in minutes
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// System Notifications Table
export const systemNotifications = pgTable("system_notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'email', 'sms', 'system'
  status: text("status").notNull(), // 'active', 'inactive'
  lastActivity: timestamp("last_activity").defaultNow(),
});

// Create insert schemas
export const insertSupportRequestSchema = createInsertSchema(supportRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
}).extend({
  priority: z.enum(['low', 'medium', 'high']),
  location: z.string().min(1, "Location is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const insertTechnicianSchema = createInsertSchema(technicians).omit({
  id: true,
  activeRequests: true,
}).extend({
  status: z.enum(['available', 'busy', 'off_duty']),
});

export const insertKnowledgeBaseArticleSchema = createInsertSchema(knowledgeBaseArticles).omit({
  id: true,
  updatedAt: true,
});

// Export types
export type InsertSupportRequest = z.infer<typeof insertSupportRequestSchema>;
export type SupportRequest = typeof supportRequests.$inferSelect;

export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type Technician = typeof technicians.$inferSelect;

export type InsertKnowledgeBaseArticle = z.infer<typeof insertKnowledgeBaseArticleSchema>;
export type KnowledgeBaseArticle = typeof knowledgeBaseArticles.$inferSelect;

export type SystemNotification = typeof systemNotifications.$inferSelect;
