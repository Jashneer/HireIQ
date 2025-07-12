import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import type { User, RegisterRequest, LoginRequest } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export class AuthService {
  async register(userData: RegisterRequest): Promise<{ user: Omit<User, 'password'>, token: string }> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
      plan: 'free',
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async login(credentials: LoginRequest): Promise<{ user: Omit<User, 'password'>, token: string }> {
    // Find user
    const user = await storage.getUserByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await storage.getUserById(decoded.userId);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  checkUsageLimit(user: User): { canUse: boolean; message?: string } {
    const limits = {
      free: 3,
      starter: 50,
      pro: Infinity,
    };

    const limit = limits[user.plan as keyof typeof limits] || limits.free;
    
    if (user.usageCount >= limit) {
      return {
        canUse: false,
        message: `You have reached your ${user.plan} plan limit of ${limit === Infinity ? 'unlimited' : limit} analyses per day. Please upgrade to continue.`,
      };
    }

    return { canUse: true };
  }
}

export const authService = new AuthService();
