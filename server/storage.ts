import { 
  type RwaProject, type InsertRwaProject,
  type RiskAnalysis, type InsertRiskAnalysis,
  type RiskAlert, type InsertRiskAlert,
  type InvestmentRecommendation, type InsertInvestmentRecommendation,
  type MarketData, type InsertMarketData,
  type User, type InsertUser,
  type RwaProjectWithAnalysis, type ProjectFilters,
  rwaProjects, riskAnalyses, riskAlerts, investmentRecommendations, marketData, users
} from "@shared/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
    "Please configure your PostgreSQL database connection in the Secrets tab."
  );
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllProjects(filters?: ProjectFilters): Promise<RwaProjectWithAnalysis[]>;
  getProject(id: string): Promise<RwaProjectWithAnalysis | undefined>;
  createProject(project: InsertRwaProject): Promise<RwaProject>;
  updateProject(id: string, updates: Partial<RwaProject>): Promise<RwaProject | undefined>;
  getRiskAnalysis(projectId: string): Promise<RiskAnalysis | undefined>;
  createRiskAnalysis(analysis: InsertRiskAnalysis): Promise<RiskAnalysis>;
  updateRiskAnalysis(id: string, updates: Partial<RiskAnalysis>): Promise<RiskAnalysis | undefined>;
  getAlerts(projectId?: string): Promise<RiskAlert[]>;
  createAlert(alert: InsertRiskAlert): Promise<RiskAlert>;
  markAlertRead(id: string): Promise<void>;
  getRecommendations(projectId?: string): Promise<InvestmentRecommendation[]>;
  createRecommendation(recommendation: InsertInvestmentRecommendation): Promise<InvestmentRecommendation>;
  getMarketData(assetType?: string): Promise<MarketData[]>;
  upsertMarketData(data: InsertMarketData): Promise<MarketData>;
  getStats(): Promise<{ projectCount: number; totalValue: number; analysisCount: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      walletAddress: null,
    }).returning();
    return result[0];
  }

  async getAllProjects(filters?: ProjectFilters): Promise<RwaProjectWithAnalysis[]> {
    const projects = await db.select().from(rwaProjects).orderBy(desc(rwaProjects.createdAt));
    
    if (projects.length === 0) {
      return [];
    }
    
    const projectIds = projects.map(p => p.id);
    
    const allAnalyses = await db.select().from(riskAnalyses)
      .where(inArray(riskAnalyses.projectId, projectIds));
    
    const analysisMap = new Map<string, RiskAnalysis>();
    for (const analysis of allAnalyses) {
      const existing = analysisMap.get(analysis.projectId);
      if (!existing) {
        analysisMap.set(analysis.projectId, analysis);
      } else {
        const existingTime = existing.analyzedAt ? new Date(existing.analyzedAt).getTime() : 0;
        const currentTime = analysis.analyzedAt ? new Date(analysis.analyzedAt).getTime() : 0;
        if (currentTime > existingTime) {
          analysisMap.set(analysis.projectId, analysis);
        }
      }
    }
    
    const allRecommendations = await db.select().from(investmentRecommendations)
      .where(inArray(investmentRecommendations.projectId, projectIds));
    
    const recommendationsMap = new Map<string, InvestmentRecommendation[]>();
    for (const rec of allRecommendations) {
      const existing = recommendationsMap.get(rec.projectId) || [];
      existing.push(rec);
      recommendationsMap.set(rec.projectId, existing);
    }
    
    const projectsWithAnalysis: RwaProjectWithAnalysis[] = [];
    
    for (const project of projects) {
      if (filters?.assetType && project.assetType !== filters.assetType) {
        continue;
      }
      if (filters?.minYield !== undefined && project.yieldPercentage < filters.minYield) {
        continue;
      }
      if (filters?.maxYield !== undefined && project.yieldPercentage > filters.maxYield) {
        continue;
      }
      
      const analysis = analysisMap.get(project.id);
      
      if (filters?.riskLevel && analysis?.riskLevel !== filters.riskLevel) {
        continue;
      }
      if (filters?.minScore !== undefined && (analysis?.overallScore || 0) < filters.minScore) {
        continue;
      }
      
      const recommendations = recommendationsMap.get(project.id) || [];
      
      projectsWithAnalysis.push({
        ...project,
        riskAnalysis: analysis,
        recommendations,
      });
    }
    
    return projectsWithAnalysis;
  }

  async getProject(id: string): Promise<RwaProjectWithAnalysis | undefined> {
    const result = await db.select().from(rwaProjects).where(eq(rwaProjects.id, id));
    const project = result[0];
    if (!project) return undefined;
    
    const analysis = await this.getRiskAnalysis(id);
    const recommendations = await this.getRecommendations(id);
    
    return {
      ...project,
      riskAnalysis: analysis,
      recommendations,
    };
  }

  async createProject(insertProject: InsertRwaProject): Promise<RwaProject> {
    const result = await db.insert(rwaProjects).values({
      ...insertProject,
      status: "pending",
    }).returning();
    return result[0];
  }

  async updateProject(id: string, updates: Partial<RwaProject>): Promise<RwaProject | undefined> {
    const result = await db.update(rwaProjects)
      .set(updates)
      .where(eq(rwaProjects.id, id))
      .returning();
    return result[0];
  }

  async getRiskAnalysis(projectId: string): Promise<RiskAnalysis | undefined> {
    const result = await db.select().from(riskAnalyses)
      .where(eq(riskAnalyses.projectId, projectId))
      .orderBy(desc(riskAnalyses.analyzedAt))
      .limit(1);
    return result[0];
  }

  async createRiskAnalysis(insertAnalysis: InsertRiskAnalysis): Promise<RiskAnalysis> {
    const result = await db.insert(riskAnalyses).values({
      ...insertAnalysis,
    }).returning();
    return result[0];
  }

  async updateRiskAnalysis(id: string, updates: Partial<RiskAnalysis>): Promise<RiskAnalysis | undefined> {
    const result = await db.update(riskAnalyses)
      .set(updates)
      .where(eq(riskAnalyses.id, id))
      .returning();
    return result[0];
  }

  async getAlerts(projectId?: string): Promise<RiskAlert[]> {
    if (projectId) {
      return db.select().from(riskAlerts)
        .where(eq(riskAlerts.projectId, projectId))
        .orderBy(desc(riskAlerts.createdAt));
    }
    return db.select().from(riskAlerts).orderBy(desc(riskAlerts.createdAt));
  }

  async createAlert(insertAlert: InsertRiskAlert): Promise<RiskAlert> {
    const result = await db.insert(riskAlerts).values({
      ...insertAlert,
      isRead: false,
    }).returning();
    return result[0];
  }

  async markAlertRead(id: string): Promise<void> {
    await db.update(riskAlerts)
      .set({ isRead: true })
      .where(eq(riskAlerts.id, id));
  }

  async getRecommendations(projectId?: string): Promise<InvestmentRecommendation[]> {
    if (projectId) {
      return db.select().from(investmentRecommendations)
        .where(eq(investmentRecommendations.projectId, projectId));
    }
    return db.select().from(investmentRecommendations);
  }

  async createRecommendation(insertRecommendation: InsertInvestmentRecommendation): Promise<InvestmentRecommendation> {
    const result = await db.insert(investmentRecommendations).values({
      ...insertRecommendation,
    }).returning();
    return result[0];
  }

  async getMarketData(assetType?: string): Promise<MarketData[]> {
    if (assetType) {
      return db.select().from(marketData).where(eq(marketData.assetType, assetType));
    }
    return db.select().from(marketData);
  }

  async upsertMarketData(insertData: InsertMarketData): Promise<MarketData> {
    const existing = await db.select().from(marketData)
      .where(and(
        eq(marketData.assetType, insertData.assetType),
        eq(marketData.symbol, insertData.symbol)
      ));
    
    if (existing.length > 0) {
      const result = await db.update(marketData)
        .set({ ...insertData, lastUpdated: new Date() })
        .where(eq(marketData.id, existing[0].id))
        .returning();
      return result[0];
    }
    
    const result = await db.insert(marketData).values({
      ...insertData,
    }).returning();
    return result[0];
  }

  async getStats(): Promise<{ projectCount: number; totalValue: number; analysisCount: number }> {
    const projectResult = await db.select({
      count: sql<number>`count(*)::int`,
      totalValue: sql<number>`coalesce(sum(total_value), 0)::real`
    }).from(rwaProjects);
    
    const analysisResult = await db.select({
      count: sql<number>`count(*)::int`
    }).from(riskAnalyses);
    
    return {
      projectCount: projectResult[0]?.count || 0,
      totalValue: projectResult[0]?.totalValue || 0,
      analysisCount: analysisResult[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
