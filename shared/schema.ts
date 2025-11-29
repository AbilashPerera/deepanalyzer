import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// RWA Project - Core entity for tokenized real-world assets
export const rwaProjects = pgTable("rwa_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  assetType: text("asset_type").notNull(), // real_estate, bonds, invoices, commodities
  totalValue: real("total_value").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  tokenSupply: integer("token_supply").notNull(),
  yieldPercentage: real("yield_percentage").notNull(),
  contractAddress: text("contract_address"),
  websiteUrl: text("website_url"),
  whitepaperUrl: text("whitepaper_url"),
  teamInfo: text("team_info").notNull(),
  tokenomics: text("tokenomics").notNull(),
  complianceInfo: text("compliance_info").notNull(),
  status: text("status").notNull().default("pending"), // pending, analyzing, analyzed
  createdAt: timestamp("created_at").defaultNow(),
});

// Risk Analysis - AI-generated risk assessment for each project
export const riskAnalyses = pgTable("risk_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => rwaProjects.id),
  overallScore: integer("overall_score").notNull(), // 0-100
  financialHealthScore: integer("financial_health_score").notNull(),
  teamCredibilityScore: integer("team_credibility_score").notNull(),
  marketViabilityScore: integer("market_viability_score").notNull(),
  regulatoryComplianceScore: integer("regulatory_compliance_score").notNull(),
  technicalImplementationScore: integer("technical_implementation_score").notNull(),
  riskLevel: text("risk_level").notNull(), // low, medium, high, critical
  summary: text("summary").notNull(),
  strengths: jsonb("strengths").notNull().$type<string[]>(),
  weaknesses: jsonb("weaknesses").notNull().$type<string[]>(),
  recommendations: jsonb("recommendations").notNull().$type<string[]>(),
  aiModel: text("ai_model").notNull(),
  analyzedAt: timestamp("analyzed_at").defaultNow(),
});

// Risk Alerts - Notifications for significant risk changes
export const riskAlerts = pgTable("risk_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => rwaProjects.id),
  alertType: text("alert_type").notNull(), // risk_increase, risk_decrease, yield_change, market_event
  severity: text("severity").notNull(), // info, warning, critical
  title: text("title").notNull(),
  message: text("message").notNull(),
  previousValue: real("previous_value"),
  newValue: real("new_value"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Investment Recommendations - Personalized recommendations based on risk tolerance
export const investmentRecommendations = pgTable("investment_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => rwaProjects.id),
  riskTolerance: text("risk_tolerance").notNull(), // conservative, moderate, aggressive
  recommendation: text("recommendation").notNull(), // strong_buy, buy, hold, sell, strong_sell
  reasoning: text("reasoning").notNull(),
  suggestedAllocation: real("suggested_allocation").notNull(), // percentage
  createdAt: timestamp("created_at").defaultNow(),
});

// Market Data - Cached oracle/market data for assets
export const marketData = pgTable("market_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assetType: text("asset_type").notNull(),
  symbol: text("symbol").notNull(),
  price: real("price").notNull(),
  priceChange24h: real("price_change_24h").notNull(),
  volume24h: real("volume_24h").notNull(),
  marketCap: real("market_cap"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Users table for basic user management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
});

// Insert schemas
export const insertRwaProjectSchema = createInsertSchema(rwaProjects).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertRiskAnalysisSchema = createInsertSchema(riskAnalyses).omit({
  id: true,
  analyzedAt: true,
});

export const insertRiskAlertSchema = createInsertSchema(riskAlerts).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export const insertInvestmentRecommendationSchema = createInsertSchema(investmentRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
  lastUpdated: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type RwaProject = typeof rwaProjects.$inferSelect;
export type InsertRwaProject = z.infer<typeof insertRwaProjectSchema>;

export type RiskAnalysis = typeof riskAnalyses.$inferSelect;
export type InsertRiskAnalysis = z.infer<typeof insertRiskAnalysisSchema>;

export type RiskAlert = typeof riskAlerts.$inferSelect;
export type InsertRiskAlert = z.infer<typeof insertRiskAlertSchema>;

export type InvestmentRecommendation = typeof investmentRecommendations.$inferSelect;
export type InsertInvestmentRecommendation = z.infer<typeof insertInvestmentRecommendationSchema>;

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Extended types for frontend
export type RwaProjectWithAnalysis = RwaProject & {
  riskAnalysis?: RiskAnalysis;
  recommendations?: InvestmentRecommendation[];
};

export type ProjectFilters = {
  assetType?: string;
  riskLevel?: string;
  minYield?: number;
  maxYield?: number;
  minScore?: number;
  maxScore?: number;
};

export type RiskTolerance = "conservative" | "moderate" | "aggressive";

export type RecommendationType = "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
