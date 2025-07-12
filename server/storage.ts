import { users, analyses, type User, type InsertUser, type Analysis, type InsertAnalysis } from "@shared/schema";

export interface IStorage {
  // User management
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Analysis management
  createAnalysis(analysis: InsertAnalysis & { userId: number }): Promise<Analysis>;
  getAnalysesByUserId(userId: number, limit?: number): Promise<Analysis[]>;
  getAnalysisById(id: number): Promise<Analysis | undefined>;
  
  // Usage tracking
  incrementUsageCount(userId: number): Promise<void>;
  resetUsageCount(userId: number): Promise<void>;
  
  // Stats
  getUserStats(userId: number): Promise<{
    monthlyAnalyses: number;
    avgMatchScore: number;
    messagesGenerated: number;
    activeCandidates: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private analyses: Map<number, Analysis> = new Map();
  private currentUserId = 1;
  private currentAnalysisId = 1;

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      plan: insertUser.plan || 'free',
      stripeCustomerId: insertUser.stripeCustomerId || null,
      subscriptionStatus: insertUser.subscriptionStatus || 'inactive',
      usageCount: 0,
      usageResetDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createAnalysis(analysisData: InsertAnalysis & { userId: number }): Promise<Analysis> {
    const id = this.currentAnalysisId++;
    const analysis: Analysis = {
      ...analysisData,
      id,
      candidateName: analysisData.candidateName || null,
      candidateEmail: analysisData.candidateEmail || null,
      matchingSkills: analysisData.matchingSkills || [],
      missingSkills: analysisData.missingSkills || [],
      improvementSuggestions: analysisData.improvementSuggestions || [],
      createdAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysesByUserId(userId: number, limit = 10): Promise<Analysis[]> {
    return Array.from(this.analyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getAnalysisById(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async incrementUsageCount(userId: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      const now = new Date();
      const resetDate = new Date(user.usageResetDate);
      
      // Reset usage count if it's a new day
      if (now.getDate() !== resetDate.getDate()) {
        user.usageCount = 1;
        user.usageResetDate = now;
      } else {
        user.usageCount++;
      }
      
      user.updatedAt = now;
      this.users.set(userId, user);
    }
  }

  async resetUsageCount(userId: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.usageCount = 0;
      user.usageResetDate = new Date();
      user.updatedAt = new Date();
      this.users.set(userId, user);
    }
  }

  async getUserStats(userId: number): Promise<{
    monthlyAnalyses: number;
    avgMatchScore: number;
    messagesGenerated: number;
    activeCandidates: number;
  }> {
    const userAnalyses = await this.getAnalysesByUserId(userId, 1000);
    const currentMonth = new Date().getMonth();
    const monthlyAnalyses = userAnalyses.filter(
      analysis => analysis.createdAt.getMonth() === currentMonth
    );
    
    const avgMatchScore = monthlyAnalyses.length > 0
      ? Math.round(monthlyAnalyses.reduce((sum, analysis) => sum + analysis.matchScore, 0) / monthlyAnalyses.length)
      : 0;
    
    return {
      monthlyAnalyses: monthlyAnalyses.length,
      avgMatchScore,
      messagesGenerated: monthlyAnalyses.length,
      activeCandidates: new Set(monthlyAnalyses.map(a => a.candidateEmail).filter(Boolean)).size,
    };
  }
}

export const storage = new MemStorage();
