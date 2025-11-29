import { 
  type RwaProject, type InsertRwaProject,
  type RiskAnalysis, type InsertRiskAnalysis,
  type RiskAlert, type InsertRiskAlert,
  type InvestmentRecommendation, type InsertInvestmentRecommendation,
  type MarketData, type InsertMarketData,
  type User, type InsertUser,
  type RwaProjectWithAnalysis, type ProjectFilters
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // RWA Projects
  getAllProjects(filters?: ProjectFilters): Promise<RwaProjectWithAnalysis[]>;
  getProject(id: string): Promise<RwaProjectWithAnalysis | undefined>;
  createProject(project: InsertRwaProject): Promise<RwaProject>;
  updateProject(id: string, updates: Partial<RwaProject>): Promise<RwaProject | undefined>;

  // Risk Analysis
  getRiskAnalysis(projectId: string): Promise<RiskAnalysis | undefined>;
  createRiskAnalysis(analysis: InsertRiskAnalysis): Promise<RiskAnalysis>;
  updateRiskAnalysis(id: string, updates: Partial<RiskAnalysis>): Promise<RiskAnalysis | undefined>;

  // Risk Alerts
  getAlerts(projectId?: string): Promise<RiskAlert[]>;
  createAlert(alert: InsertRiskAlert): Promise<RiskAlert>;
  markAlertRead(id: string): Promise<void>;

  // Investment Recommendations
  getRecommendations(projectId?: string): Promise<InvestmentRecommendation[]>;
  createRecommendation(recommendation: InsertInvestmentRecommendation): Promise<InvestmentRecommendation>;

  // Market Data
  getMarketData(assetType?: string): Promise<MarketData[]>;
  upsertMarketData(data: InsertMarketData): Promise<MarketData>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, RwaProject>;
  private riskAnalyses: Map<string, RiskAnalysis>;
  private alerts: Map<string, RiskAlert>;
  private recommendations: Map<string, InvestmentRecommendation>;
  private marketData: Map<string, MarketData>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.riskAnalyses = new Map();
    this.alerts = new Map();
    this.recommendations = new Map();
    this.marketData = new Map();

    // Initialize with sample market data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample market data for different asset types
    const sampleMarketData: InsertMarketData[] = [
      { assetType: "real_estate", symbol: "RE-INDEX", price: 245.67, priceChange24h: 1.23, volume24h: 15600000, marketCap: 2450000000 },
      { assetType: "bonds", symbol: "BOND-ETF", price: 98.45, priceChange24h: -0.15, volume24h: 8900000, marketCap: 985000000 },
      { assetType: "invoices", symbol: "INV-POOL", price: 1.02, priceChange24h: 0.05, volume24h: 2300000, marketCap: 120000000 },
      { assetType: "commodities", symbol: "GOLD-TKN", price: 1945.30, priceChange24h: 0.82, volume24h: 45000000, marketCap: 9800000000 },
    ];

    sampleMarketData.forEach(data => {
      const id = randomUUID();
      this.marketData.set(id, { ...data, id, lastUpdated: new Date() });
    });

    // Sample RWA projects with analyses for demo
    const sampleProjects: { project: InsertRwaProject; analysis?: Omit<InsertRiskAnalysis, 'projectId'> }[] = [
      {
        project: {
          name: "Manhattan Prime Real Estate Token",
          description: "Tokenized ownership of premium commercial real estate in Manhattan's financial district. The property includes a 45-story office building with Fortune 500 tenants on long-term leases.",
          assetType: "real_estate",
          totalValue: 125000000,
          tokenSymbol: "MPRE",
          tokenSupply: 12500000,
          yieldPercentage: 7.5,
          contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
          websiteUrl: "https://example.com",
          whitepaperUrl: "https://example.com/whitepaper.pdf",
          teamInfo: "Led by John Smith, former Goldman Sachs real estate executive with 20+ years of experience. Team includes licensed real estate professionals and blockchain developers.",
          tokenomics: "12.5M tokens at $10 each. 70% public sale, 15% team (4-year vesting), 10% reserve, 5% advisors. Quarterly dividend distributions from rental income.",
          complianceInfo: "SEC Regulation D 506(c) compliant. KYC/AML required. Accredited investors only in US. Property fully insured and audited annually.",
        },
        analysis: {
          overallScore: 82,
          financialHealthScore: 88,
          teamCredibilityScore: 85,
          marketViabilityScore: 78,
          regulatoryComplianceScore: 90,
          technicalImplementationScore: 70,
          riskLevel: "low",
          summary: "Strong fundamentals with experienced team and solid compliance framework. The Manhattan prime location provides stability, though yield may compress in a rising rate environment.",
          strengths: ["Prime Manhattan location with Fortune 500 tenants", "Experienced team with proven track record", "Strong regulatory compliance framework", "Long-term lease agreements providing stable income"],
          weaknesses: ["High entry barrier limits retail participation", "Interest rate sensitivity may affect valuations", "Single property concentration risk"],
          recommendations: ["Consider diversifying across multiple properties", "Monitor interest rate environment closely", "Establish secondary market liquidity provisions"],
          aiModel: "gpt-5",
        }
      },
      {
        project: {
          name: "Green Energy Bond Portfolio",
          description: "A diversified portfolio of investment-grade green bonds from renewable energy projects across Europe and North America. Includes solar, wind, and hydroelectric projects.",
          assetType: "bonds",
          totalValue: 50000000,
          tokenSymbol: "GEBO",
          tokenSupply: 5000000,
          yieldPercentage: 5.2,
          contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
          websiteUrl: "https://example.com",
          teamInfo: "Founded by Sarah Chen, former fixed-income portfolio manager at BlackRock. Advisory board includes climate finance experts and ESG specialists.",
          tokenomics: "5M tokens at $10 each. 80% public, 10% team, 5% liquidity, 5% operations. Monthly yield distributions.",
          complianceInfo: "EU Green Bond Standard compliant. Third-party ESG verification. Open to global investors with basic KYC.",
        },
        analysis: {
          overallScore: 75,
          financialHealthScore: 78,
          teamCredibilityScore: 80,
          marketViabilityScore: 72,
          regulatoryComplianceScore: 85,
          technicalImplementationScore: 65,
          riskLevel: "medium",
          summary: "Well-structured green bond portfolio with experienced management. ESG focus attracts institutional interest. Technical implementation could be more robust.",
          strengths: ["Diversified across multiple projects and geographies", "Strong ESG credentials", "Experienced fixed-income management team", "Growing institutional demand for green assets"],
          weaknesses: ["Lower yield compared to traditional bonds", "Currency exposure across multiple jurisdictions", "Smart contract audit pending"],
          recommendations: ["Complete smart contract security audit", "Implement currency hedging strategy", "Consider expanding to emerging market green bonds"],
          aiModel: "gpt-5",
        }
      },
      {
        project: {
          name: "Trade Finance Invoice Pool",
          description: "Tokenized pool of verified trade finance invoices from SMEs in Southeast Asia. Provides working capital financing to businesses with established trade relationships.",
          assetType: "invoices",
          totalValue: 15000000,
          tokenSymbol: "TFIP",
          tokenSupply: 15000000,
          yieldPercentage: 12.8,
          teamInfo: "Operating team based in Singapore with backgrounds in trade finance and fintech. Partnerships with major banks for invoice verification.",
          tokenomics: "15M tokens at $1 each. 75% public, 15% reserve for bad debt, 10% operations. Weekly yield distributions.",
          complianceInfo: "Licensed by MAS Singapore. Anti-fraud measures include blockchain verification and bank confirmations.",
        },
        analysis: {
          overallScore: 58,
          financialHealthScore: 55,
          teamCredibilityScore: 60,
          marketViabilityScore: 65,
          regulatoryComplianceScore: 70,
          technicalImplementationScore: 45,
          riskLevel: "high",
          summary: "High yield reflects higher risk profile. Invoice fraud and default risk require careful monitoring. Early stage platform with limited track record.",
          strengths: ["High yield potential attractive to risk-tolerant investors", "Growing SME financing gap in target markets", "Strong regulatory environment in Singapore"],
          weaknesses: ["Limited operating history", "Invoice fraud risk in emerging markets", "Concentration in single region", "Technical infrastructure needs improvement"],
          recommendations: ["Expand invoice verification processes", "Diversify geography to reduce concentration", "Implement real-time monitoring dashboard", "Increase bad debt reserve ratio"],
          aiModel: "gpt-5",
        }
      }
    ];

    sampleProjects.forEach(({ project, analysis }) => {
      const projectId = randomUUID();
      const createdProject: RwaProject = {
        ...project,
        id: projectId,
        status: analysis ? "analyzed" : "pending",
        createdAt: new Date(),
      };
      this.projects.set(projectId, createdProject);

      if (analysis) {
        const analysisId = randomUUID();
        const createdAnalysis: RiskAnalysis = {
          ...analysis,
          id: analysisId,
          projectId,
          analyzedAt: new Date(),
        };
        this.riskAnalyses.set(analysisId, createdAnalysis);

        // Create sample recommendations for this project
        const tolerances = ["conservative", "moderate", "aggressive"] as const;
        tolerances.forEach(tolerance => {
          const recId = randomUUID();
          let recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
          let allocation: number;
          let reasoning: string;

          if (analysis.overallScore >= 75) {
            recommendation = tolerance === "conservative" ? "buy" : tolerance === "moderate" ? "strong_buy" : "strong_buy";
            allocation = tolerance === "conservative" ? 5 : tolerance === "moderate" ? 10 : 15;
            reasoning = `Strong risk profile with score of ${analysis.overallScore}. Suitable for ${tolerance} portfolios with ${allocation}% allocation.`;
          } else if (analysis.overallScore >= 60) {
            recommendation = tolerance === "conservative" ? "hold" : tolerance === "moderate" ? "buy" : "buy";
            allocation = tolerance === "conservative" ? 2 : tolerance === "moderate" ? 7 : 12;
            reasoning = `Moderate risk profile with score of ${analysis.overallScore}. Consider ${allocation}% allocation for ${tolerance} investors.`;
          } else {
            recommendation = tolerance === "conservative" ? "sell" : tolerance === "moderate" ? "hold" : "buy";
            allocation = tolerance === "conservative" ? 0 : tolerance === "moderate" ? 3 : 8;
            reasoning = `Higher risk profile with score of ${analysis.overallScore}. ${tolerance === "conservative" ? "Not recommended" : `Limited ${allocation}% allocation`} for ${tolerance} portfolios.`;
          }

          const rec: InvestmentRecommendation = {
            id: recId,
            projectId,
            riskTolerance: tolerance,
            recommendation,
            reasoning,
            suggestedAllocation: allocation,
            createdAt: new Date(),
          };
          this.recommendations.set(recId, rec);
        });
      }
    });

    // Sample alerts
    const sampleAlerts: InsertRiskAlert[] = [
      {
        projectId: Array.from(this.projects.keys())[0],
        alertType: "risk_increase",
        severity: "warning",
        title: "Market Volatility Detected",
        message: "Real estate sector showing increased volatility. Monitor closely for potential impact on asset valuation.",
        previousValue: 82,
        newValue: 78,
      },
      {
        projectId: Array.from(this.projects.keys())[1],
        alertType: "yield_change",
        severity: "info",
        title: "Yield Update",
        message: "Monthly yield distribution processed. Current APY remains stable at 5.2%.",
        previousValue: 5.2,
        newValue: 5.2,
      },
      {
        projectId: Array.from(this.projects.keys())[2],
        alertType: "risk_increase",
        severity: "critical",
        title: "Default Risk Elevated",
        message: "Invoice default rate increased in Q4. Bad debt reserve may need adjustment.",
        previousValue: 2.1,
        newValue: 3.8,
      },
    ];

    sampleAlerts.forEach(alert => {
      const id = randomUUID();
      this.alerts.set(id, { ...alert, id, isRead: false, createdAt: new Date() });
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, walletAddress: null };
    this.users.set(id, user);
    return user;
  }

  // RWA Projects
  async getAllProjects(filters?: ProjectFilters): Promise<RwaProjectWithAnalysis[]> {
    let projects = Array.from(this.projects.values());

    if (filters) {
      if (filters.assetType) {
        projects = projects.filter(p => p.assetType === filters.assetType);
      }
      if (filters.riskLevel) {
        projects = projects.filter(p => {
          const analysis = Array.from(this.riskAnalyses.values()).find(a => a.projectId === p.id);
          return analysis?.riskLevel === filters.riskLevel;
        });
      }
      if (filters.minYield !== undefined) {
        projects = projects.filter(p => p.yieldPercentage >= filters.minYield!);
      }
      if (filters.maxYield !== undefined) {
        projects = projects.filter(p => p.yieldPercentage <= filters.maxYield!);
      }
      if (filters.minScore !== undefined) {
        projects = projects.filter(p => {
          const analysis = Array.from(this.riskAnalyses.values()).find(a => a.projectId === p.id);
          return (analysis?.overallScore || 0) >= filters.minScore!;
        });
      }
    }

    return projects.map(project => {
      const riskAnalysis = Array.from(this.riskAnalyses.values()).find(a => a.projectId === project.id);
      const recommendations = Array.from(this.recommendations.values()).filter(r => r.projectId === project.id);
      return { ...project, riskAnalysis, recommendations };
    });
  }

  async getProject(id: string): Promise<RwaProjectWithAnalysis | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const riskAnalysis = Array.from(this.riskAnalyses.values()).find(a => a.projectId === id);
    const recommendations = Array.from(this.recommendations.values()).filter(r => r.projectId === id);
    return { ...project, riskAnalysis, recommendations };
  }

  async createProject(insertProject: InsertRwaProject): Promise<RwaProject> {
    const id = randomUUID();
    const project: RwaProject = {
      ...insertProject,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<RwaProject>): Promise<RwaProject | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    const updated = { ...project, ...updates };
    this.projects.set(id, updated);
    return updated;
  }

  // Risk Analysis
  async getRiskAnalysis(projectId: string): Promise<RiskAnalysis | undefined> {
    return Array.from(this.riskAnalyses.values()).find(a => a.projectId === projectId);
  }

  async createRiskAnalysis(insertAnalysis: InsertRiskAnalysis): Promise<RiskAnalysis> {
    const id = randomUUID();
    const analysis: RiskAnalysis = {
      ...insertAnalysis,
      id,
      analyzedAt: new Date(),
    };
    this.riskAnalyses.set(id, analysis);
    return analysis;
  }

  async updateRiskAnalysis(id: string, updates: Partial<RiskAnalysis>): Promise<RiskAnalysis | undefined> {
    const analysis = this.riskAnalyses.get(id);
    if (!analysis) return undefined;
    const updated = { ...analysis, ...updates };
    this.riskAnalyses.set(id, updated);
    return updated;
  }

  // Risk Alerts
  async getAlerts(projectId?: string): Promise<RiskAlert[]> {
    let alerts = Array.from(this.alerts.values());
    if (projectId) {
      alerts = alerts.filter(a => a.projectId === projectId);
    }
    return alerts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async createAlert(insertAlert: InsertRiskAlert): Promise<RiskAlert> {
    const id = randomUUID();
    const alert: RiskAlert = {
      ...insertAlert,
      id,
      isRead: false,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertRead(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.isRead = true;
      this.alerts.set(id, alert);
    }
  }

  // Investment Recommendations
  async getRecommendations(projectId?: string): Promise<InvestmentRecommendation[]> {
    let recommendations = Array.from(this.recommendations.values());
    if (projectId) {
      recommendations = recommendations.filter(r => r.projectId === projectId);
    }
    return recommendations;
  }

  async createRecommendation(insertRecommendation: InsertInvestmentRecommendation): Promise<InvestmentRecommendation> {
    const id = randomUUID();
    const recommendation: InvestmentRecommendation = {
      ...insertRecommendation,
      id,
      createdAt: new Date(),
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  // Market Data
  async getMarketData(assetType?: string): Promise<MarketData[]> {
    let data = Array.from(this.marketData.values());
    if (assetType) {
      data = data.filter(d => d.assetType === assetType);
    }
    return data;
  }

  async upsertMarketData(insertData: InsertMarketData): Promise<MarketData> {
    const existing = Array.from(this.marketData.values()).find(
      d => d.assetType === insertData.assetType && d.symbol === insertData.symbol
    );

    if (existing) {
      const updated: MarketData = { ...existing, ...insertData, lastUpdated: new Date() };
      this.marketData.set(existing.id, updated);
      return updated;
    }

    const id = randomUUID();
    const data: MarketData = { ...insertData, id, lastUpdated: new Date() };
    this.marketData.set(id, data);
    return data;
  }
}

export const storage = new MemStorage();
