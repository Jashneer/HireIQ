import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  plan: text("plan").notNull().default("free"), // free, starter, pro
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: text("subscription_status").default("inactive"),
  usageCount: integer("usage_count").notNull().default(0),
  usageResetDate: timestamp("usage_reset_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  candidateName: text("candidate_name"),
  candidateEmail: text("candidate_email"),
  jobTitle: text("job_title").notNull(),
  companyName: text("company_name").notNull(),
  jobDescription: text("job_description").notNull(),
  resumeText: text("resume_text").notNull(),
  outreachTone: text("outreach_tone").notNull(),
  matchScore: integer("match_score").notNull(),
  technicalScore: integer("technical_score").notNull(),
  experienceScore: integer("experience_score").notNull(),
  domainScore: integer("domain_score").notNull(),
  matchingSkills: text("matching_skills").array(),
  missingSkills: text("missing_skills").array(),
  outreachMessage: text("outreach_message").notNull(),
  improvementSuggestions: text("improvement_suggestions").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageResetDate: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const analysisRequestSchema = z.object({
  companyName: z.string().min(1),
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(10),
  resumeText: z.string().min(10),
  outreachTone: z.enum(["professional", "casual", "enthusiastic", "direct"]),
  candidateName: z.string().optional(),
  candidateEmail: z.string().email().optional(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
