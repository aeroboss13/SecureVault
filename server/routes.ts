import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import { 
  insertPasswordEntrySchema,
  insertPasswordShareSchema,
  insertActivityLogSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  const { adminRequired } = setupAuth(app);

  // Password entries
  app.post("/api/passwords", adminRequired, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const validatedData = insertPasswordEntrySchema.parse({
        ...req.body,
        adminId: req.user.id
      });
      
      const entry = await storage.createPasswordEntry(validatedData);
      
      // Log activity
      await storage.createActivityLog({
        adminId: req.user.id,
        action: "Created Password",
        serviceName: entry.serviceName,
        status: "Success"
      });
      
      res.status(201).json(entry);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(400).json({ error: errorMessage });
    }
  });
  
  app.get("/api/passwords", adminRequired, async (req, res) => {
    try {
      const entries = await storage.getPasswordEntriesByAdmin(req.user.id);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Password shares
  app.post("/api/shares", adminRequired, async (req, res) => {
    try {
      const { entryId, recipientEmail } = req.body;
      
      // Check if entry exists and belongs to admin
      const entry = await storage.getPasswordEntry(entryId);
      if (!entry || entry.adminId !== req.user.id) {
        return res.status(404).json({ error: "Password entry not found" });
      }
      
      // Generate unique token
      const shareToken = nanoid(24);
      
      // Set expiration (1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      const share = await storage.createPasswordShare({
        entryId,
        adminId: req.user.id,
        recipientEmail,
        shareToken,
        expiresAt
      });
      
      // Log activity with expiry time
      await storage.createActivityLog({
        adminId: req.user.id,
        action: "Created Share",
        serviceName: entry.serviceName,
        recipientEmail: recipientEmail.split('@')[0], // Используем имя пользователя без домена
        status: "Active",
        expiresAt: expiresAt
      });
      
      res.status(201).json(share);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  app.get("/api/shares", adminRequired, async (req, res) => {
    try {
      const shares = await storage.getPasswordSharesByAdmin(req.user.id);
      res.json(shares);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Revoke a share
  app.delete("/api/shares/:id", adminRequired, async (req, res) => {
    try {
      const shareId = parseInt(req.params.id);
      
      // Check if share exists and belongs to admin
      const share = await storage.getPasswordShare(shareId);
      if (!share || share.adminId !== req.user.id) {
        return res.status(404).json({ error: "Share not found" });
      }
      
      const entry = await storage.getPasswordEntry(share.entryId);
      await storage.revokePasswordShare(shareId);
      
      // Log activity
      await storage.createActivityLog({
        adminId: req.user.id,
        action: "Revoked Share",
        serviceName: entry.serviceName,
        recipientEmail: share.recipientEmail.split('@')[0], // Используем имя пользователя без домена
        status: "Revoked"
      });
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Public endpoint to access a shared password
  app.get("/api/shared/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      // Get share by token
      const share = await storage.getPasswordShareByToken(token);
      if (!share) {
        return res.status(404).json({ error: "Share not found" });
      }
      
      // Check if expired or inactive
      const now = new Date();
      if (now > share.expiresAt || !share.active) {
        return res.status(410).json({ error: "This link has expired or been revoked" });
      }
      
      // Get all password entries for this admin
      const allEntries = await storage.getPasswordEntriesByAdmin(share.adminId);
      if (!allEntries || allEntries.length === 0) {
        return res.status(404).json({ error: "Password entries not found" });
      }
      
      // Make sure the original entry is included
      const originalEntry = allEntries.find(entry => entry.id === share.entryId);
      if (!originalEntry) {
        return res.status(404).json({ error: "Original password entry not found" });
      }
      
      // If not viewed yet, mark as viewed
      if (!share.viewed) {
        // Get current time as viewed time
        const viewedAt = new Date();
        
        // Calculate expiry time (60 minutes from now)
        const expiresAt = new Date(viewedAt);
        expiresAt.setMinutes(expiresAt.getMinutes() + 60);
        
        await storage.markShareAsViewed(share.id);
        
        // Log activity with viewed and expiry times
        await storage.createActivityLog({
          adminId: share.adminId,
          action: "Password Viewed",
          serviceName: originalEntry.serviceName,
          recipientEmail: share.recipientEmail.split('@')[0], // Используем имя пользователя без домена
          status: "Viewed",
          viewedAt,
          expiresAt
        });
      }
      
      // Return password data for all entries
      const services = allEntries.map(entry => ({
        id: entry.id,
        serviceName: entry.serviceName,
        serviceUrl: entry.serviceUrl,
        username: entry.username,
        password: entry.password
      }));
      
      res.json({
        services,
        expires: share.expiresAt,
        viewed: true,
      });
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Activity logs
  app.get("/api/logs", adminRequired, async (req, res) => {
    try {
      const logs = await storage.getActivityLogsByAdmin(req.user.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Stats
  app.get("/api/stats", adminRequired, async (req, res) => {
    try {
      const activeShares = await storage.getActiveSharesCount(req.user.id);
      const sharedToday = await storage.getSharesCreatedTodayCount(req.user.id);
      const expiringShares = await storage.getExpiringSharesCount(req.user.id);
      const viewedShares = await storage.getViewedSharesCount(req.user.id);
      
      res.json({
        activeShares,
        sharedToday,
        expiringShares,
        viewedShares
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
