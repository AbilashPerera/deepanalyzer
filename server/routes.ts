import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeRwaProject } from "./openai";
import { insertRwaProjectSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all projects with optional filters
  app.get("/api/projects", async (req, res) => {
    try {
      const filters = {
        assetType: req.query.assetType as string | undefined,
        riskLevel: req.query.riskLevel as string | undefined,
        minYield: req.query.minYield ? parseFloat(req.query.minYield as string) : undefined,
        maxYield: req.query.maxYield ? parseFloat(req.query.maxYield as string) : undefined,
        minScore: req.query.minScore ? parseInt(req.query.minScore as string) : undefined,
        maxScore: req.query.maxScore ? parseInt(req.query.maxScore as string) : undefined,
      };
      
      const projects = await storage.getAllProjects(filters);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get single project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Create new project
  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertRwaProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      
      // Start async analysis (don't wait for it)
      analyzeProjectAsync(project.id);
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Trigger project analysis
  app.post("/api/projects/:id/analyze", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Update status to analyzing
      await storage.updateProject(project.id, { status: "analyzing" });

      // Perform analysis
      const { analysis, recommendations } = await analyzeRwaProject(project);

      // Save analysis
      const savedAnalysis = await storage.createRiskAnalysis({
        ...analysis,
        projectId: project.id,
      });

      // Save recommendations
      for (const rec of recommendations) {
        await storage.createRecommendation({
          ...rec,
          projectId: project.id,
        });
      }

      // Update project status
      await storage.updateProject(project.id, { status: "analyzed" });

      // Create alert for significant findings
      if (analysis.riskLevel === "high" || analysis.riskLevel === "critical") {
        await storage.createAlert({
          projectId: project.id,
          alertType: "risk_increase",
          severity: analysis.riskLevel === "critical" ? "critical" : "warning",
          title: `${analysis.riskLevel === "critical" ? "Critical" : "High"} Risk Identified`,
          message: `Analysis complete. Overall score: ${analysis.overallScore}/100. ${analysis.summary}`,
          previousValue: null,
          newValue: analysis.overallScore,
        });
      }

      const updatedProject = await storage.getProject(project.id);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error analyzing project:", error);
      res.status(500).json({ error: "Failed to analyze project" });
    }
  });

  // Get all alerts (optionally filtered by project)
  app.get("/api/alerts", async (req, res) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const alerts = await storage.getAlerts(projectId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Mark alert as read
  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      await storage.markAlertRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ error: "Failed to update alert" });
    }
  });

  // Get recommendations (optionally filtered by project)
  app.get("/api/recommendations", async (req, res) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const recommendations = await storage.getRecommendations(projectId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Get market data
  app.get("/api/market-data", async (req, res) => {
    try {
      const assetType = req.query.assetType as string | undefined;
      const marketData = await storage.getMarketData(assetType);
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  return httpServer;
}

// Helper function to run analysis asynchronously
async function analyzeProjectAsync(projectId: string) {
  try {
    const project = await storage.getProject(projectId);
    if (!project) return;

    await storage.updateProject(projectId, { status: "analyzing" });

    const { analysis, recommendations } = await analyzeRwaProject(project);

    await storage.createRiskAnalysis({
      ...analysis,
      projectId,
    });

    for (const rec of recommendations) {
      await storage.createRecommendation({
        ...rec,
        projectId,
      });
    }

    await storage.updateProject(projectId, { status: "analyzed" });

    // Create alert for new analysis
    await storage.createAlert({
      projectId,
      alertType: analysis.overallScore >= 60 ? "risk_decrease" : "risk_increase",
      severity: analysis.riskLevel === "critical" ? "critical" : analysis.riskLevel === "high" ? "warning" : "info",
      title: "Analysis Complete",
      message: `Risk analysis completed with score ${analysis.overallScore}/100. ${analysis.riskLevel} risk level detected.`,
      previousValue: null,
      newValue: analysis.overallScore,
    });
  } catch (error) {
    console.error("Async analysis error:", error);
    await storage.updateProject(projectId, { status: "pending" });
  }
}
