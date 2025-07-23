import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  whatsappNumber: text("whatsapp_number"),
  status: text("status").notNull().default("member"), // "royal", "hacker", "member"
  isAdmin: boolean("is_admin").notNull().default(false),
  isOnline: boolean("is_online").notNull().default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  replyToId: integer("reply_to_id"), // For message replies
  mentionedUsers: text("mentioned_users").array(), // Array of mentioned user IDs
  likes: integer("likes").notNull().default(0),
  hearts: integer("hearts").notNull().default(0),
  fires: integer("fires").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageReactions = pgTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "like", "heart", "fire"
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  visitCount: integer("visit_count").notNull().default(1),
  lastVisit: timestamp("last_visit").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  displayName: true,
  bio: true,
  profilePicture: true,
  whatsappNumber: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  displayName: true,
  bio: true,
  profilePicture: true,
  whatsappNumber: true,
}).partial();

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  replyToId: true,
  mentionedUsers: true,
}).extend({
  replyToId: z.number().optional(),
  mentionedUsers: z.array(z.string()).optional(),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).pick({
  content: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6),
  displayName: z.string().min(2),
  whatsappNumber: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type MessageReaction = typeof messageReactions.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  reactions: many(messageReactions),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
  }),
  reactions: many(messageReactions),
}));

export const messageReactionsRelations = relations(messageReactions, ({ one }) => ({
  message: one(messages, {
    fields: [messageReactions.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageReactions.userId],
    references: [users.id],
  }),
}));
