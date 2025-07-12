import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import multer from "multer";
import { 
  insertPasswordEntrySchema,
  insertPasswordShareSchema,
  insertActivityLogSchema,
  backupDataSchema
} from "../shared/schema";

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
  
  // Create multiple password entries and optionally share them
  app.post("/api/passwords/batch", adminRequired, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { services, recipientEmail, comment } = req.body;
      
      if (!Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ error: "At least one service is required" });
      }
      
      const createdEntries = [];
      
      // Create entry for each service
      for (const service of services) {
        const entryData = insertPasswordEntrySchema.parse({
          adminId: req.user.id,
          serviceName: service.serviceName,
          serviceUrl: service.serviceUrl || null,
          username: service.username,
          password: service.password
        });
        
        const entry = await storage.createPasswordEntry(entryData);
        createdEntries.push(entry);
        
        // Log creation of each password
        await storage.createActivityLog({
          adminId: req.user.id,
          action: "Created Password",
          serviceName: entry.serviceName,
          status: "Success"
        });
      }
      
      // If recipient email is provided, create a share link for the first entry
      let share = null;
      if (recipientEmail && createdEntries.length > 0) {
        // Generate unique token
        const shareToken = nanoid(24);
        
        // Set initial access expiration to 2 weeks from now (before first view)
        const initialExpiresAt = new Date();
        initialExpiresAt.setDate(initialExpiresAt.getDate() + 14); // 2 недели для доступа к ссылке
        
        // Use the first entry as the main entry for the share
        const mainEntry = createdEntries[0];
        
        share = await storage.createPasswordShare({
          entryId: mainEntry.id, // Используем первую запись как основную для ссылки
          adminId: req.user.id,
          recipientEmail,
          shareToken,
          expiresAt: initialExpiresAt,
          comment
        });
        
        // Создаем связи между ссылкой и всеми записями паролей
        for (const entry of createdEntries) {
          await storage.createShareEntry({
            shareId: share.id,
            entryId: entry.id
          });
        }
        
        // Log the creation of a share with expiry time
        await storage.createActivityLog({
          adminId: req.user.id,
          action: "Created Share",
          serviceName: mainEntry.serviceName,
          recipientEmail: mainEntry.username,
          status: "Active",
          expiresAt: initialExpiresAt
        });
      }
      
      res.status(201).json({ entries: createdEntries, share });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(400).json({ error: errorMessage });
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
      
      // Set initial access expiration to 2 weeks from now (before first view)
      const initialExpiresAt = new Date();
      initialExpiresAt.setDate(initialExpiresAt.getDate() + 14); // 2 недели для доступа к ссылке
      
      const share = await storage.createPasswordShare({
        entryId, // Используем entryId как основной (первый) пароль для ссылки
        adminId: req.user.id,
        recipientEmail,
        shareToken,
        expiresAt: initialExpiresAt
      });
      
      // Создаем связь между ссылкой и паролем
      await storage.createShareEntry({
        shareId: share.id,
        entryId
      });
      
      // Log activity with expiry time
      await storage.createActivityLog({
        adminId: req.user.id,
        action: "Created Share",
        serviceName: entry.serviceName,
        recipientEmail: entry.username, // Используем имя пользователя из записи пароля
        status: "Active",
        expiresAt: initialExpiresAt
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
        recipientEmail: entry.username, // Используем имя пользователя из записи пароля
        status: "Revoked"
      });
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Endpoint to confirm and deactivate a shared link
  app.post("/api/shared/:token/confirm", async (req, res) => {
    try {
      const { token } = req.params;
      
      // Get share by token
      const share = await storage.getPasswordShareByToken(token);
      if (!share) {
        return res.status(404).json({ error: "Share not found" });
      }
      
      // Check if already inactive
      if (!share.active) {
        return res.status(400).json({ error: "This link is already inactive" });
      }
      
      // Deactivate the share
      await storage.revokePasswordShare(share.id);
      
      // Get related password entry for logging
      const entry = await storage.getPasswordEntry(share.entryId);
      
      // Log the confirmation
      await storage.createActivityLog({
        adminId: share.adminId,
        action: "Confirmed Access",
        serviceName: entry ? entry.serviceName : null,
        recipientEmail: entry ? entry.username : null,
        status: "Confirmed"
      });
      
      res.status(200).json({ success: true, message: "Link has been deactivated" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ error: errorMessage });
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
      
      // Check if inactive
      if (!share.active) {
        return res.status(410).json({ error: "This link has been revoked" });
      }
      
      // Check if expired - different logic for viewed vs unviewed links
      const now = new Date();
      if (share.expiresAt && now > share.expiresAt) {
        if (share.viewed) {
          // Link was viewed and 1-hour timer expired
          return res.status(410).json({ error: "This link has expired after viewing" });
        } else {
          // 2-week initial access period expired without viewing
          return res.status(410).json({ error: "This link has expired - initial access period (2 weeks) has ended" });
        }
      }
      
      // Проверка на одноразовую ссылку
      if (share.openedOnce) {
        return res.status(410).json({ error: "This link has already been used and can only be accessed once" });
      }
      
      // Получаем все записи паролей, связанные с этой ссылкой
      const entries = await storage.getEntriesByShareToken(token);
      if (!entries || entries.length === 0) {
        return res.status(404).json({ error: "Password entries not found" });
      }
      
      // Получаем основную запись (для отметки о просмотре и логирования)
      const mainEntry = entries[0];
      
      // Отмечаем, что ссылка была открыта один раз
      await storage.markShareAsOpened(share.id);
      
      // If not viewed yet, mark as viewed and set 1-hour expiration from now
      if (!share.viewed) {
        // Get current time as viewed time
        const viewedAt = new Date();
        
        // Calculate new expiry time (60 minutes from now)
        const hourExpiresAt = new Date(viewedAt);
        hourExpiresAt.setMinutes(hourExpiresAt.getMinutes() + 60);
        
        // Mark as viewed and update expiration to 1 hour from now
        await storage.markShareAsViewed(share.id);
        await storage.updateShareExpiration(share.id, hourExpiresAt);
        
        // Log activity with viewed and new expiry times
        await storage.createActivityLog({
          adminId: share.adminId,
          action: "Password Viewed",
          serviceName: mainEntry.serviceName,
          recipientEmail: mainEntry.username, 
          status: "Viewed",
          viewedAt,
          expiresAt: hourExpiresAt
        });
      }
      
      // Get updated share to return correct expiration time
      const updatedShare = await storage.getPasswordShare(share.id);
      
      // Преобразуем все полученные записи в формат для отправки клиенту
      const services = entries.map(entry => ({
        id: entry.id,
        serviceName: entry.serviceName,
        serviceUrl: entry.serviceUrl,
        username: entry.username,
        password: entry.password
      }));
      
      res.json({
        services,
        expires: updatedShare ? updatedShare.expiresAt : share.expiresAt,
        viewed: true,
        oneTimeLink: true,
        comment: updatedShare ? updatedShare.comment : share.comment
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
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
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
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Setup multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  // Export password data as backup file
  app.get("/api/backup/export", adminRequired, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const entries = await storage.exportPasswordEntries(req.user.id);
      
      const backupData = {
        version: "1.0",
        createdAt: new Date().toISOString(),
        entries: entries.map(entry => ({
          serviceName: entry.serviceName,
          serviceUrl: entry.serviceUrl,
          username: entry.username,
          password: entry.password,
        }))
      };

      // Log activity
      await storage.createActivityLog({
        adminId: req.user.id,
        action: "Data Export",
        serviceName: null,
        recipientEmail: null,
        status: "Success"
      });

      // Берем имя пользователя из первой записи для названия файла
      const firstUsername = entries.length > 0 ? entries[0].username : 'backup';
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `${firstUsername}-${currentDate}.json`;

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(backupData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Import password data from backup file
  app.post("/api/backup/import", adminRequired, upload.single('backup'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      let backupData;
      
      try {
        backupData = JSON.parse(fileContent);
      } catch (parseError) {
        return res.status(400).json({ error: "Invalid JSON format" });
      }

      // Validate backup data structure
      const validatedData = backupDataSchema.parse(backupData);

      // Import entries
      await storage.importPasswordEntries(req.user.id, validatedData.entries);

      // Log activity
      await storage.createActivityLog({
        adminId: req.user.id,
        action: "Data Import",
        serviceName: null,
        recipientEmail: null,
        status: "Success"
      });

      res.json({ 
        message: "Data imported successfully", 
        importedCount: validatedData.entries.length 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
