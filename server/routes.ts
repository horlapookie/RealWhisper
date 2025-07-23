import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertMessageSchema, updateUserSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Track visitor
  app.use((req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    storage.recordVisit(ipAddress, req.get("User-Agent"));
    next();
  });

  // Auth middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user;
      next();
    });
  };

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, displayName, bio, profilePicture, whatsappNumber } = registerSchema.parse(req.body);
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        displayName,
        bio,
        profilePicture,
        whatsappNumber,
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ token, user: userWithoutPassword });
    } catch (error: any) {
      if (error.message === "Email already registered") {
        return res.status(400).json({ message: "This email is already registered. Please use a different email or try logging in." });
      }
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      await storage.setUserOnline(user.id, true);
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Logout
  app.post("/api/auth/logout", authenticateToken, async (req: any, res) => {
    await storage.setUserOnline(req.user.userId, false);
    res.json({ message: "Logged out successfully" });
  });

  // Get messages
  app.get("/api/messages", async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  // Create message
  app.post("/api/messages", authenticateToken, async (req: any, res) => {
    try {
      const { content, replyToId, mentionedUsers } = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(req.user.userId, content, replyToId, mentionedUsers);
      
      // Get the message with user info
      const messages = await storage.getMessages(1);
      const messageWithUser = messages[0];
      
      res.json(messageWithUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid message content" });
    }
  });

  // Toggle reaction
  app.post("/api/messages/:id/react", authenticateToken, async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const { type } = req.body;
      
      if (!["like", "heart", "fire"].includes(type)) {
        return res.status(400).json({ message: "Invalid reaction type" });
      }
      
      await storage.toggleReaction(messageId, req.user.userId, type);
      const reactions = await storage.getMessageReactions(messageId);
      
      res.json(reactions);
    } catch (error) {
      res.status(400).json({ message: "Failed to toggle reaction" });
    }
  });

  // Get online users
  app.get("/api/users/online", async (req, res) => {
    const users = await storage.getOnlineUsers();
    const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);
    res.json(usersWithoutPasswords);
  });

  // Get all users (for mentions)
  app.get("/api/users", async (req, res) => {
    // Get all users from storage (this works for both memory and database storage)
    const limit = 100; // reasonable limit
    const messages = await storage.getMessages(limit);
    const uniqueUsers = new Map();
    
    messages.forEach(message => {
      if (!uniqueUsers.has(message.user.id)) {
        const { password: _, ...userWithoutPassword } = message.user as any;
        uniqueUsers.set(message.user.id, userWithoutPassword);
      }
    });
    
    res.json(Array.from(uniqueUsers.values()));
  });

  // Get announcement
  app.get("/api/announcement", async (req, res) => {
    const announcement = await storage.getLatestAnnouncement();
    res.json(announcement);
  });

  // Update announcement (admin only)
  app.put("/api/announcement", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { content } = req.body;
      const announcement = await storage.updateAnnouncement(content);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Failed to update announcement" });
    }
  });

  // Get stats
  app.get("/api/stats", async (req, res) => {
    const onlineUsers = await storage.getOnlineUsers();
    const visitorCount = await storage.getVisitorCount();
    
    res.json({
      onlineUsers: onlineUsers.length,
      visitorCount,
    });
  });

  // Update user profile
  app.put("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const updates = updateUserSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.user.userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid profile data" });
    }
  });

  // Delete user account
  app.delete("/api/user/account", authenticateToken, async (req: any, res) => {
    try {
      await storage.deleteUser(req.user.userId);
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Get available avatars
  app.get("/api/avatars", (req, res) => {
    const avatars = [
      "👑", "💻", "🚀", "⚡", "🔥", "💎", "🎯", "🛡️",
      "🗡️", "🏰", "🎭", "🎨", "🎮", "🎪", "🎸", "🎺",
      "🦄", "🐲", "🦅", "🦁", "🐺", "🦊", "🐯", "🐸",
      "🌟", "⭐", "✨", "💫", "🌙", "☀️", "🌈", "🌊"
    ];
    res.json(avatars);
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          try {
            const decoded = jwt.verify(message.token, JWT_SECRET) as any;
            ws.userId = decoded.userId;
            await storage.setUserOnline(decoded.userId, true);
            
            // Broadcast updated online users
            broadcastOnlineUsers();
          } catch (error) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
          }
        } else if (message.type === 'new_message' && ws.userId) {
          // Message creation is handled via HTTP API, this is for real-time broadcast
          broadcastToAll({ type: 'new_message', data: message.data });
        } else if (message.type === 'reaction' && ws.userId) {
          broadcastToAll({ type: 'reaction_update', data: message.data });
        } else if (message.type === 'profile_update' && ws.userId) {
          broadcastToAll({ type: 'profile_update', data: message.data });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      if (ws.userId) {
        await storage.setUserOnline(ws.userId, false);
        broadcastOnlineUsers();
      }
    });
  });

  function broadcastToAll(message: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  async function broadcastOnlineUsers() {
    const onlineUsers = await storage.getOnlineUsers();
    const usersWithoutPasswords = onlineUsers.map(({ password: _, ...user }) => user);
    
    broadcastToAll({
      type: 'online_users_update',
      data: usersWithoutPasswords
    });
  }

  return httpServer;
}
