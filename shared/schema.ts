import { z } from "zod";
import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Define tables
export const users = pgTable("users", {
  id: integer("id").primaryKey().notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false)
});

export const passwordEntries = pgTable("password_entries", {
  id: integer("id").primaryKey().notNull(),
  adminId: integer("admin_id").notNull(),
  serviceName: text("service_name").notNull(),
  serviceUrl: text("service_url"),
  username: text("username").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull()
});

export const passwordShares = pgTable("password_shares", {
  id: integer("id").primaryKey().notNull(),
  adminId: integer("admin_id").notNull(),
  recipientEmail: text("recipient_email"),
  entryId: integer("entry_id").notNull(),
  shareToken: text("share_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  viewed: boolean("viewed").notNull().default(false),
  viewedAt: timestamp("viewed_at"),
  active: boolean("active").notNull().default(true),
  openedOnce: boolean("opened_once").notNull().default(false),
  createdAt: timestamp("created_at").notNull()
});

export const shareEntries = pgTable("share_entries", {
  id: integer("id").primaryKey().notNull(),
  shareId: integer("share_id").notNull(),
  entryId: integer("entry_id").notNull()
});

export const activityLogs = pgTable("activity_logs", {
  id: integer("id").primaryKey().notNull(),
  adminId: integer("admin_id"),
  action: text("action").notNull(),
  serviceName: text("service_name"),
  recipientEmail: text("recipient_email"),
  status: text("status"),
  viewedAt: timestamp("viewed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull()
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true
});

export const insertPasswordEntrySchema = createInsertSchema(passwordEntries).pick({
  adminId: true,
  serviceName: true,
  serviceUrl: true,
  username: true,
  password: true
});

export const insertPasswordShareSchema = createInsertSchema(passwordShares).pick({
  adminId: true,
  recipientEmail: true,
  entryId: true,
  shareToken: true,
  expiresAt: true
});

export const insertShareEntrySchema = createInsertSchema(shareEntries).pick({
  shareId: true,
  entryId: true
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  adminId: true,
  action: true,
  serviceName: true,
  recipientEmail: true,
  status: true,
  viewedAt: true,
  expiresAt: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PasswordEntry = typeof passwordEntries.$inferSelect;
export type InsertPasswordEntry = z.infer<typeof insertPasswordEntrySchema>;

export type PasswordShare = typeof passwordShares.$inferSelect;
export type InsertPasswordShare = z.infer<typeof insertPasswordShareSchema>;

export type ShareEntry = typeof shareEntries.$inferSelect;
export type InsertShareEntry = z.infer<typeof insertShareEntrySchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Additional schemas for form validation
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

export const serviceSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  serviceUrl: z.string().optional().nullable(),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

export const createPasswordSchema = z.object({
  services: z.array(serviceSchema).min(1, "At least one service is required")
});

export const passwordGeneratorSchema = z.object({
  length: z.number().min(8).max(100).default(16),
  includeUppercase: z.boolean().default(true),
  includeLowercase: z.boolean().default(true),
  includeNumbers: z.boolean().default(true),
  includeSymbols: z.boolean().default(true)
});

// Export form types
export type LoginForm = z.infer<typeof loginSchema>;
export type ServiceData = z.infer<typeof serviceSchema>;
export type CreatePasswordForm = z.infer<typeof createPasswordSchema>;
export type PasswordGeneratorOptions = z.infer<typeof passwordGeneratorSchema>;