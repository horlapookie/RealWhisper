import { 
  users, messages, messageReactions, announcements, sessions,
  type User, type InsertUser, type UpdateUser, type Message, type InsertMessage, 
  type MessageReaction, type Announcement, type Session 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import fs from 'fs';
import path from 'path';

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  getOnlineUsers(): Promise<User[]>;
  setUserOnline(id: number, online: boolean): Promise<void>;
  
  // Messages
  getMessages(limit?: number): Promise<(Message & { user: User; replyTo?: Message & { user: User } })[]>;
  createMessage(userId: number, content: string, replyToId?: number, mentionedUsers?: string[]): Promise<Message>;
  
  // Reactions
  toggleReaction(messageId: number, userId: number, type: string): Promise<void>;
  getMessageReactions(messageId: number): Promise<{ likes: number; hearts: number; fires: number }>;
  
  // Announcements
  getLatestAnnouncement(): Promise<Announcement | undefined>;
  updateAnnouncement(content: string): Promise<Announcement>;
  
  // Sessions
  recordVisit(ipAddress: string, userAgent?: string): Promise<void>;
  getVisitorCount(): Promise<number>;
}

interface StorageData {
  users: [number, User][];
  messages: [number, Message][];
  reactions: [number, MessageReaction][];
  announcements: [number, Announcement][];
  sessions: [string, Session][];
  counters: {
    currentUserId: number;
    currentMessageId: number;
    currentReactionId: number;
    currentAnnouncementId: number;
    currentSessionId: number;
  };
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private reactions: Map<number, MessageReaction>;
  private announcements: Map<number, Announcement>;
  private sessions: Map<string, Session>;
  private currentUserId: number;
  private currentMessageId: number;
  private currentReactionId: number;
  private currentAnnouncementId: number;
  private currentSessionId: number;
  private readonly dataFile = path.join(process.cwd(), 'storage', 'data.json');

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.reactions = new Map();
    this.announcements = new Map();
    this.sessions = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.currentReactionId = 1;
    this.currentAnnouncementId = 1;
    this.currentSessionId = 1;
    
    this.loadFromFile();
    
    // Create default announcement if none exists
    if (this.announcements.size === 0) {
      this.announcements.set(1, {
        id: 1,
        content: "Welcome to the Royal Hacker Kingdom! 🏰 Join our WhatsApp channel for exclusive updates and connect with fellow hackers. Let's build something amazing together! 👑",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf-8');
        const parsed: StorageData = JSON.parse(data);
        
        this.users = new Map(parsed.users.map(([k, v]) => [k, {
          ...v,
          lastSeen: v.lastSeen ? new Date(v.lastSeen) : null,
          createdAt: v.createdAt ? new Date(v.createdAt) : null,
        }]));
        
        this.messages = new Map(parsed.messages.map(([k, v]) => [k, {
          ...v,
          createdAt: v.createdAt ? new Date(v.createdAt) : new Date(),
        }]));
        
        this.reactions = new Map(parsed.reactions);
        
        this.announcements = new Map(parsed.announcements.map(([k, v]) => [k, {
          ...v,
          createdAt: v.createdAt ? new Date(v.createdAt) : new Date(),
          updatedAt: v.updatedAt ? new Date(v.updatedAt) : new Date(),
        }]));
        
        this.sessions = new Map(parsed.sessions.map(([k, v]) => [k, {
          ...v,
          lastVisit: v.lastVisit ? new Date(v.lastVisit) : new Date(),
        }]));
        
        const counters = parsed.counters;
        this.currentUserId = counters.currentUserId;
        this.currentMessageId = counters.currentMessageId;
        this.currentReactionId = counters.currentReactionId;
        this.currentAnnouncementId = counters.currentAnnouncementId;
        this.currentSessionId = counters.currentSessionId;
      }
    } catch (error) {
      console.warn('Failed to load storage data, starting fresh:', error);
    }
  }

  private async saveToFile(): Promise<void> {
    try {
      // Ensure storage directory exists
      const storageDir = path.dirname(this.dataFile);
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      const data: StorageData = {
        users: Array.from(this.users.entries()),
        messages: Array.from(this.messages.entries()),
        reactions: Array.from(this.reactions.entries()),
        announcements: Array.from(this.announcements.entries()),
        sessions: Array.from(this.sessions.entries()),
        counters: {
          currentUserId: this.currentUserId,
          currentMessageId: this.currentMessageId,
          currentReactionId: this.currentReactionId,
          currentAnnouncementId: this.currentAnnouncementId,
          currentSessionId: this.currentSessionId,
        },
      };

      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save storage data:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if email already exists
    const existingUser = Array.from(this.users.values()).find(user => user.email === insertUser.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      bio: insertUser.bio || null,
      profilePicture: insertUser.profilePicture || null,
      whatsappNumber: insertUser.whatsappNumber || null,
      status: "member",
      isAdmin: false,
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date(),
    };
    this.users.set(id, user);
    await this.saveToFile();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    await this.saveToFile();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
    // Also delete user's messages and reactions
    const userMessages = Array.from(this.messages.entries()).filter(([_, msg]) => msg.userId === id);
    userMessages.forEach(([msgId]) => this.messages.delete(msgId));
    
    const userReactions = Array.from(this.reactions.entries()).filter(([_, reaction]) => reaction.userId === id);
    userReactions.forEach(([reactionId]) => this.reactions.delete(reactionId));
    
    await this.saveToFile();
  }

  async getOnlineUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isOnline);
  }

  async setUserOnline(id: number, online: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isOnline = online;
      if (!online) {
        user.lastSeen = new Date();
      }
      this.users.set(id, user);
      await this.saveToFile();
    }
  }

  async getMessages(limit: number = 50): Promise<(Message & { user: User; replyTo?: Message & { user: User } })[]> {
    const messagesList = Array.from(this.messages.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
    
    return messagesList.map(message => {
      const user = this.users.get(message.userId)!;
      let replyTo: (Message & { user: User }) | undefined;
      
      if (message.replyToId) {
        const replyMessage = this.messages.get(message.replyToId);
        if (replyMessage) {
          const replyUser = this.users.get(replyMessage.userId)!;
          replyTo = { ...replyMessage, user: replyUser };
        }
      }
      
      return { ...message, user, replyTo };
    }).reverse();
  }

  async createMessage(userId: number, content: string, replyToId?: number, mentionedUsers?: string[]): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      id,
      userId,
      content,
      replyToId: replyToId || null,
      mentionedUsers: mentionedUsers || null,
      likes: 0,
      hearts: 0,
      fires: 0,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    await this.saveToFile();
    return message;
  }

  async toggleReaction(messageId: number, userId: number, type: string): Promise<void> {
    const existingReaction = Array.from(this.reactions.values())
      .find(r => r.messageId === messageId && r.userId === userId && r.type === type);
    
    if (existingReaction) {
      this.reactions.delete(existingReaction.id);
    } else {
      const id = this.currentReactionId++;
      this.reactions.set(id, { id, messageId, userId, type });
    }
    
    // Update message counts
    const message = this.messages.get(messageId);
    if (message) {
      const reactions = this.getMessageReactionsSync(messageId);
      message.likes = reactions.likes;
      message.hearts = reactions.hearts;
      message.fires = reactions.fires;
      this.messages.set(messageId, message);
    }
    
    await this.saveToFile();
  }

  private getMessageReactionsSync(messageId: number): { likes: number; hearts: number; fires: number } {
    const messageReactions = Array.from(this.reactions.values())
      .filter(r => r.messageId === messageId);
    
    return {
      likes: messageReactions.filter(r => r.type === "like").length,
      hearts: messageReactions.filter(r => r.type === "heart").length,
      fires: messageReactions.filter(r => r.type === "fire").length,
    };
  }

  async getMessageReactions(messageId: number): Promise<{ likes: number; hearts: number; fires: number }> {
    return this.getMessageReactionsSync(messageId);
  }

  async getLatestAnnouncement(): Promise<Announcement | undefined> {
    const announcements = Array.from(this.announcements.values());
    return announcements.sort((a, b) => b.updatedAt!.getTime() - a.updatedAt!.getTime())[0];
  }

  async updateAnnouncement(content: string): Promise<Announcement> {
    const existing = await this.getLatestAnnouncement();
    if (existing) {
      existing.content = content;
      existing.updatedAt = new Date();
      this.announcements.set(existing.id, existing);
      await this.saveToFile();
      return existing;
    } else {
      const id = this.currentAnnouncementId++;
      const announcement: Announcement = {
        id,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.announcements.set(id, announcement);
      await this.saveToFile();
      return announcement;
    }
  }

  async recordVisit(ipAddress: string, userAgent?: string): Promise<void> {
    const existing = this.sessions.get(ipAddress);
    if (existing) {
      existing.visitCount++;
      existing.lastVisit = new Date();
      this.sessions.set(ipAddress, existing);
    } else {
      const id = this.currentSessionId++;
      this.sessions.set(ipAddress, {
        id,
        userId: null,
        ipAddress,
        userAgent: userAgent || null,
        visitCount: 1,
        lastVisit: new Date(),
      });
    }
    await this.saveToFile();
  }

  async getVisitorCount(): Promise<number> {
    return this.sessions.size;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if email already exists
    const existingUser = await this.getUserByEmail(insertUser.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        status: "member",
        isAdmin: false,
        isOnline: true,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<void> {
    // Delete user's reactions first
    await db.delete(messageReactions).where(eq(messageReactions.userId, id));
    // Delete user's messages
    await db.delete(messages).where(eq(messages.userId, id));
    // Delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  async getOnlineUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isOnline, true));
  }

  async setUserOnline(id: number, online: boolean): Promise<void> {
    await db
      .update(users)
      .set({ 
        isOnline: online,
        lastSeen: online ? undefined : new Date()
      })
      .where(eq(users.id, id));
  }

  async getMessages(limit: number = 50): Promise<(Message & { user: User; replyTo?: Message & { user: User } })[]> {
    const results = await db
      .select()
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
    
    const messagesWithUsers = results.map(({ messages: message, users: user }) => ({
      ...message,
      user: user!,
    }));

    // Fetch reply-to messages and their users
    const messagesWithReplies = await Promise.all(
      messagesWithUsers.map(async (message) => {
        if (message.replyToId) {
          const [replyResult] = await db
            .select()
            .from(messages)
            .leftJoin(users, eq(messages.userId, users.id))
            .where(eq(messages.id, message.replyToId));
          
          if (replyResult) {
            return {
              ...message,
              replyTo: {
                ...replyResult.messages,
                user: replyResult.users!,
              },
            };
          }
        }
        return message;
      })
    );
    
    return messagesWithReplies.reverse();
  }

  async createMessage(userId: number, content: string, replyToId?: number, mentionedUsers?: string[]): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({ 
        userId, 
        content, 
        replyToId: replyToId || null,
        mentionedUsers: mentionedUsers || null
      })
      .returning();
    return message;
  }

  async toggleReaction(messageId: number, userId: number, type: string): Promise<void> {
    // Check if reaction exists
    const [existingReaction] = await db
      .select()
      .from(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, userId),
          eq(messageReactions.type, type)
        )
      );

    if (existingReaction) {
      // Remove reaction
      await db
        .delete(messageReactions)
        .where(eq(messageReactions.id, existingReaction.id));
    } else {
      // Add reaction
      await db
        .insert(messageReactions)
        .values({ messageId, userId, type });
    }

    // Update message reaction counts
    const reactions = await this.getMessageReactions(messageId);
    await db
      .update(messages)
      .set({
        likes: reactions.likes,
        hearts: reactions.hearts,
        fires: reactions.fires,
      })
      .where(eq(messages.id, messageId));
  }

  async getMessageReactions(messageId: number): Promise<{ likes: number; hearts: number; fires: number }> {
    const reactionsList = await db
      .select()
      .from(messageReactions)
      .where(eq(messageReactions.messageId, messageId));
    
    return {
      likes: reactionsList.filter(r => r.type === "like").length,
      hearts: reactionsList.filter(r => r.type === "heart").length,
      fires: reactionsList.filter(r => r.type === "fire").length,
    };
  }

  async getLatestAnnouncement(): Promise<Announcement | undefined> {
    const [announcement] = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.updatedAt))
      .limit(1);
    return announcement || undefined;
  }

  async updateAnnouncement(content: string): Promise<Announcement> {
    const existing = await this.getLatestAnnouncement();
    if (existing) {
      const [updated] = await db
        .update(announcements)
        .set({ content, updatedAt: new Date() })
        .where(eq(announcements.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(announcements)
        .values({ content })
        .returning();
      return created;
    }
  }

  async recordVisit(ipAddress: string, userAgent?: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.ipAddress, ipAddress));

    if (existing) {
      await db
        .update(sessions)
        .set({ 
          visitCount: existing.visitCount + 1,
          lastVisit: new Date()
        })
        .where(eq(sessions.id, existing.id));
    } else {
      await db
        .insert(sessions)
        .values({ 
          ipAddress, 
          userAgent,
          visitCount: 1
        });
    }
  }

  async getVisitorCount(): Promise<number> {
    const result = await db.select().from(sessions);
    return result.length;
  }
}

// Use database storage if DATABASE_URL is available, otherwise fall back to memory storage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();

// Export getStorage function for backwards compatibility
export function getStorage(): IStorage {
  return storage;
}
