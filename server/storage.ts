import { 
  User, 
  InsertUser, 
  PasswordEntry, 
  InsertPasswordEntry,
  PasswordShare,
  InsertPasswordShare,
  ActivityLog,
  InsertActivityLog,
  ShareEntry,
  InsertShareEntry
} from "../shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserCount(): Promise<number>;
  createUser(user: InsertUser): Promise<User>;
  
  // Password entries
  createPasswordEntry(entry: InsertPasswordEntry): Promise<PasswordEntry>;
  getPasswordEntry(id: number): Promise<PasswordEntry | undefined>;
  getPasswordEntriesByAdmin(adminId: number): Promise<PasswordEntry[]>;
  
  // Password shares
  createPasswordShare(share: InsertPasswordShare): Promise<PasswordShare>;
  createShareEntry(shareEntry: InsertShareEntry): Promise<ShareEntry>;
  getPasswordShare(id: number): Promise<PasswordShare | undefined>;
  getPasswordShareByToken(token: string): Promise<PasswordShare | undefined>;
  getPasswordSharesByAdmin(adminId: number): Promise<PasswordShare[]>;
  getShareEntriesByShareId(shareId: number): Promise<ShareEntry[]>;
  getEntriesByShareToken(token: string): Promise<PasswordEntry[]>;
  markShareAsViewed(id: number): Promise<void>;
  markShareAsOpened(id: number): Promise<void>;
  isShareOpenedOnce(id: number): Promise<boolean>;
  revokePasswordShare(id: number): Promise<void>;
  
  // Activity logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogsByAdmin(adminId: number): Promise<ActivityLog[]>;
  
  // Stats
  getActiveSharesCount(adminId: number): Promise<number>;
  getSharesCreatedTodayCount(adminId: number): Promise<number>;
  getExpiringSharesCount(adminId: number): Promise<number>;
  getViewedSharesCount(adminId: number): Promise<number>;
  
  // Session store
  sessionStore: session.SessionStore;
}

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private passwordEntries: Map<number, PasswordEntry>;
  private passwordShares: Map<number, PasswordShare>;
  private shareEntries: Map<number, ShareEntry>;
  private activityLogs: Map<number, ActivityLog>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private entryIdCounter: number;
  private shareIdCounter: number;
  private shareEntryIdCounter: number;
  private logIdCounter: number;

  constructor() {
    this.users = new Map();
    this.passwordEntries = new Map();
    this.passwordShares = new Map();
    this.shareEntries = new Map();
    this.activityLogs = new Map();
    
    this.userIdCounter = 1;
    this.entryIdCounter = 1;
    this.shareIdCounter = 1;
    this.shareEntryIdCounter = 1;
    this.logIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserCount(): Promise<number> {
    return this.users.size;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Password entries
  async createPasswordEntry(insertEntry: InsertPasswordEntry): Promise<PasswordEntry> {
    const id = this.entryIdCounter++;
    const createdAt = new Date();
    const entry: PasswordEntry = { ...insertEntry, id, createdAt };
    this.passwordEntries.set(id, entry);
    return entry;
  }
  
  async getPasswordEntry(id: number): Promise<PasswordEntry | undefined> {
    return this.passwordEntries.get(id);
  }
  
  async getPasswordEntriesByAdmin(adminId: number): Promise<PasswordEntry[]> {
    return Array.from(this.passwordEntries.values()).filter(
      (entry) => entry.adminId === adminId
    );
  }
  
  // Password shares
  async createPasswordShare(insertShare: InsertPasswordShare): Promise<PasswordShare> {
    const id = this.shareIdCounter++;
    const createdAt = new Date();
    const share: PasswordShare = { 
      ...insertShare, 
      id, 
      createdAt, 
      viewed: false, 
      viewedAt: null,
      active: true,
      openedOnce: false 
    };
    this.passwordShares.set(id, share);
    return share;
  }
  
  async getPasswordShare(id: number): Promise<PasswordShare | undefined> {
    return this.passwordShares.get(id);
  }
  
  async getPasswordShareByToken(token: string): Promise<PasswordShare | undefined> {
    return Array.from(this.passwordShares.values()).find(
      (share) => share.shareToken === token
    );
  }
  
  async getPasswordSharesByAdmin(adminId: number): Promise<PasswordShare[]> {
    return Array.from(this.passwordShares.values()).filter(
      (share) => share.adminId === adminId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async markShareAsViewed(id: number): Promise<void> {
    const share = this.passwordShares.get(id);
    if (share) {
      share.viewed = true;
      share.viewedAt = new Date();
      this.passwordShares.set(id, share);
    }
  }
  
  async markShareAsOpened(id: number): Promise<void> {
    const share = this.passwordShares.get(id);
    if (share) {
      share.openedOnce = true;
      this.passwordShares.set(id, share);
    }
  }
  
  async isShareOpenedOnce(id: number): Promise<boolean> {
    const share = this.passwordShares.get(id);
    return share ? share.openedOnce : false;
  }
  
  async revokePasswordShare(id: number): Promise<void> {
    const share = this.passwordShares.get(id);
    if (share) {
      share.active = false;
      this.passwordShares.set(id, share);
    }
  }
  
  async createShareEntry(insertShareEntry: InsertShareEntry): Promise<ShareEntry> {
    const id = this.shareEntryIdCounter++;
    const shareEntry: ShareEntry = { ...insertShareEntry, id };
    this.shareEntries.set(id, shareEntry);
    return shareEntry;
  }
  
  async getShareEntriesByShareId(shareId: number): Promise<ShareEntry[]> {
    return Array.from(this.shareEntries.values()).filter(
      (entry) => entry.shareId === shareId
    );
  }
  
  async getEntriesByShareToken(token: string): Promise<PasswordEntry[]> {
    const share = await this.getPasswordShareByToken(token);
    if (!share) {
      return [];
    }
    
    const shareEntries = await this.getShareEntriesByShareId(share.id);
    if (shareEntries.length === 0) {
      return [];
    }
    
    const entryIds = shareEntries.map(se => se.entryId);
    return Array.from(this.passwordEntries.values()).filter(
      (entry) => entryIds.includes(entry.id)
    );
  }
  
  // Activity logs
  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.logIdCounter++;
    const createdAt = new Date();
    const log: ActivityLog = { ...insertLog, id, createdAt };
    this.activityLogs.set(id, log);
    return log;
  }
  
  async getActivityLogsByAdmin(adminId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter((log) => log.adminId === adminId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Stats
  async getActiveSharesCount(adminId: number): Promise<number> {
    const now = new Date();
    return Array.from(this.passwordShares.values()).filter(
      (share) => 
        share.adminId === adminId && 
        share.active === true && 
        share.expiresAt > now
    ).length;
  }
  
  async getSharesCreatedTodayCount(adminId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.passwordShares.values()).filter(
      (share) => 
        share.adminId === adminId && 
        share.createdAt >= today
    ).length;
  }
  
  async getExpiringSharesCount(adminId: number): Promise<number> {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    return Array.from(this.passwordShares.values()).filter(
      (share) => 
        share.adminId === adminId && 
        share.active === true && 
        share.expiresAt > now && 
        share.expiresAt < thirtyMinutesFromNow
    ).length;
  }
  
  async getViewedSharesCount(adminId: number): Promise<number> {
    return Array.from(this.passwordShares.values()).filter(
      (share) => share.adminId === adminId && share.viewed === true
    ).length;
  }
}

export const storage = new MemStorage();
