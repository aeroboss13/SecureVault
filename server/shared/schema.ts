import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const passwordEntries = pgTable("password_entries", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull(),
  serviceName: text("service_name").notNull(),
  serviceUrl: text("service_url"),
  username: text("username").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordShares = pgTable("password_shares", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull(), // ID of the password entry shared
  adminId: integer("admin_id").notNull(),
  recipientEmail: text("recipient_email"),
  shareToken: text("share_token").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  viewed: boolean("viewed").notNull().default(false),
  viewedAt: timestamp("viewed_at"),
  active: boolean("active").notNull().default(true),
  openedOnce: boolean("opened_once").notNull().default(false),
  comment: text("comment")
});

export const shareEntries = pgTable("share_entries", {
  id: serial("id").primaryKey(),
  shareId: integer("share_id").notNull(),
  entryId: integer("entry_id").notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id"),
  action: text("action").notNull(),
  serviceName: text("service_name"),
  recipientEmail: text("recipient_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status"),
  viewedAt: timestamp("viewed_at"),
  expiresAt: timestamp("expires_at"),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertPasswordEntrySchema = createInsertSchema(passwordEntries).pick({
  adminId: true,
  serviceName: true,
  serviceUrl: true,
  username: true,
  password: true,
});

export const insertPasswordShareSchema = createInsertSchema(passwordShares).pick({
  entryId: true,
  adminId: true,
  recipientEmail: true,
  shareToken: true,
  expiresAt: true,
  comment: true
});

export const insertShareEntrySchema = createInsertSchema(shareEntries).pick({
  shareId: true,
  entryId: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  adminId: true,
  action: true,
  serviceName: true,
  recipientEmail: true,
  status: true,
  viewedAt: true,
  expiresAt: true,
});

// Generated types
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

// Extended schemas for frontend validation
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const serviceSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  serviceUrl: z.string().optional(),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const createPasswordSchema = z.object({
  services: z.array(serviceSchema),
  recipientEmail: z.string().email("Invalid email address").optional(),
  comment: z.string().optional()
});

// Password generator schema removed - using only special format now

export const backupDataSchema = z.object({
  version: z.string(),
  createdAt: z.string(),
  entries: z.array(z.object({
    serviceName: z.string(),
    serviceUrl: z.string().nullable().optional(),
    username: z.string(),
    password: z.string(),
  })),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type ServiceData = z.infer<typeof serviceSchema>;
export type CreatePasswordForm = z.infer<typeof createPasswordSchema>;
// PasswordGeneratorOptions type removed - using only special format now
export type BackupData = z.infer<typeof backupDataSchema>;
