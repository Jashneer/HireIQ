import type { Express } from "express";
import { storage } from "./storage";
import { aiService } from "./services/ai-service";
import { pdfService } from "./services/pdf-service";
import { authService } from "./services/auth-service";
import { stripeService } from "./services/stripe-service";
import { authenticateToken, type AuthenticatedRequest } from "./middleware/auth";
import { 
  registerSchema, 
  loginSchema, 
  analysisRequestSchema,
  type AnalysisRequest 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<void> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const result = await authService.register(userData);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const result = await authService.login(credentials);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { password, ...user } = req.user;
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/analyze", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const usageCheck = authService.checkUsageLimit(user);
      if (!usageCheck.canUse) {
        return res.status(429).json({ message: usageCheck.message });
      }

      const analysisData: AnalysisRequest = analysisRequestSchema.parse(req.body);
      const skillAnalysis = await aiService.analyzeSkills(
        analysisData.resumeText,
        analysisData.jobDescription
      );

      const outreachResult = await aiService.generateOutreach(
        analysisData.candidateName || "Candidate",
        analysisData.jobTitle,
        analysisData.companyName,
        skillAnalysis.matchingSkills,
        analysisData.outreachTone,
        skillAnalysis.overallScore
      );

      const analysis = await storage.createAnalysis({
        userId: user.id,
        candidateName: analysisData.candidateName,
        candidateEmail: analysisData.candidateEmail,
        jobTitle: analysisData.jobTitle,
        companyName: analysisData.companyName,
        jobDescription: analysisData.jobDescription,
        resumeText: analysisData.resumeText,
        outreachTone: analysisData.outreachTone,
        matchScore: skillAnalysis.overallScore,
        technicalScore: skillAnalysis.technicalScore,
        experienceScore: skillAnalysis.experienceScore,
        domainScore: skillAnalysis.domainScore,
        matchingSkills: skillAnalysis.matchingSkills,
        missingSkills: skillAnalysis.missingSkills,
        outreachMessage: outreachResult.message,
        improvementSuggestions: outreachResult.improvementSuggestions,
      });

      await storage.incrementUsageCount(user.id);

      res.json({
        success: true,
        analysis: {
          id: analysis.id,
          overallScore: skillAnalysis.overallScore,
          technicalScore: skillAnalysis.technicalScore,
          experienceScore: skillAnalysis.experienceScore,
          domainScore: skillAnalysis.domainScore,
          matchingSkills: skillAnalysis.matchingSkills,
          missingSkills: skillAnalysis.missingSkills,
          outreachMessage: outreachResult.message,
          improvementSuggestions: outreachResult.improvementSuggestions,
          timestamp: analysis.createdAt.toISOString(),
        },
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ message: "Analysis failed. Please try again." });
    }
  });

  app.get("/api/analyses", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const limit = parseInt(req.query.limit as string) || 10;
      const analyses = await storage.getAnalysesByUserId(user.id, limit);
      res.json({ analyses });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analyses/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const analysisId = parseInt(req.params.id);
      const analysis = await storage.getAnalysisById(analysisId);
      if (!analysis || analysis.userId !== user.id) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      res.json({ analysis });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/stats", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const stats = await storage.getUserStats(user.id);
      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/upload-pdf", authenticateToken, async (_req, res) => {
    res.status(501).json({ message: "PDF upload not implemented yet. Please paste the resume text manually in the form." });
  });

  app.post("/api/stripe/create-checkout-session", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      const { priceId, successUrl, cancelUrl } = req.body;
      const checkoutUrl = await stripeService.createCheckoutSession(
        user.id,
        priceId,
        successUrl,
        cancelUrl
      );
      res.json({ checkoutUrl });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/stripe/webhook", async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const body = req.body;
      await stripeService.handleWebhook(body, signature);
      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
}
