import bcrypt from "bcryptjs";
import { getStorage } from "./storage";

export async function seedAdminUser() {
  try {
    const storage = getStorage();
    
    // Check if admin user already exists 
    const existingUser = await storage.getUserByEmail('allainacol@gmail.com');
    
    if (!existingUser) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('omotoyosi', 10);
      
      const adminUser = {
        email: 'allainacol@gmail.com',
        password: hashedPassword,
        displayName: 'Creator',
        profilePicture: '👑',
        bio: 'App Creator & Administrator',
        whatsappNumber: undefined
      };
      
      const createdUser = await storage.createUser(adminUser);
      // Update user to have royal status and admin privileges
      await storage.updateUser(createdUser.id, {
        status: 'royal',
        isAdmin: true
      });
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
}