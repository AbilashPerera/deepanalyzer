import OpenAI from "openai";
import type { RwaProject, InsertRiskAnalysis, InsertInvestmentRecommendation } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface RiskAnalysisResult {
  overallScore: number;
  financialHealthScore: number;
  teamCredibilityScore: number;
  marketViabilityScore: number;
  regulatoryComplianceScore: number;
  technicalImplementationScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface InvestmentRecommendationResult {
  conservative: {
    recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
    suggestedAllocation: number;
    reasoning: string;
  };
  moderate: {
    recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
    suggestedAllocation: number;
    reasoning: string;
  };
  aggressive: {
    recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
    suggestedAllocation: number;
    reasoning: string;
  };
}

export async function analyzeRwaProject(project: RwaProject): Promise<{
  analysis: Omit<InsertRiskAnalysis, "projectId">;
  recommendations: Omit<InsertInvestmentRecommendation, "projectId">[];
}> {
  const prompt = `You are an expert RWA (Real World Asset) analyst specializing in tokenized assets. Analyze the following RWA project and provide a comprehensive risk assessment.

PROJECT DETAILS:
Name: ${project.name}
Asset Type: ${project.assetType}
Description: ${project.description}
Total Value: $${project.totalValue.toLocaleString()}
Token Symbol: ${project.tokenSymbol}
Token Supply: ${project.tokenSupply.toLocaleString()}
Expected Yield: ${project.yieldPercentage}%
Contract Address: ${project.contractAddress || "Not deployed yet"}
Website: ${project.websiteUrl || "Not provided"}
Whitepaper: ${project.whitepaperUrl || "Not provided"}

TEAM INFORMATION:
${project.teamInfo}

TOKENOMICS:
${project.tokenomics}

COMPLIANCE INFORMATION:
${project.complianceInfo}

Provide your analysis in the following JSON format:
{
  "riskAnalysis": {
    "overallScore": <number 0-100, higher is safer>,
    "financialHealthScore": <number 0-100>,
    "teamCredibilityScore": <number 0-100>,
    "marketViabilityScore": <number 0-100>,
    "regulatoryComplianceScore": <number 0-100>,
    "technicalImplementationScore": <number 0-100>,
    "riskLevel": "<low|medium|high|critical>",
    "summary": "<2-3 sentence summary of the overall assessment>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
    "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
  },
  "investmentRecommendations": {
    "conservative": {
      "recommendation": "<strong_buy|buy|hold|sell|strong_sell>",
      "suggestedAllocation": <percentage 0-20>,
      "reasoning": "<brief reasoning>"
    },
    "moderate": {
      "recommendation": "<strong_buy|buy|hold|sell|strong_sell>",
      "suggestedAllocation": <percentage 0-30>,
      "reasoning": "<brief reasoning>"
    },
    "aggressive": {
      "recommendation": "<strong_buy|buy|hold|sell|strong_sell>",
      "suggestedAllocation": <percentage 0-40>,
      "reasoning": "<brief reasoning>"
    }
  }
}

Scoring Guidelines:
- 75-100: Low Risk (solid fundamentals, experienced team, strong compliance)
- 50-74: Medium Risk (some concerns but manageable)
- 25-49: High Risk (significant concerns, limited track record)
- 0-24: Critical Risk (major red flags, avoid)

Consider these factors:
1. Financial Health: Asset valuation, yield sustainability, liquidity
2. Team Credibility: Experience, track record, transparency
3. Market Viability: Market size, competition, growth potential
4. Regulatory Compliance: Licenses, KYC/AML, jurisdiction risks
5. Technical Implementation: Smart contract security, infrastructure

Respond ONLY with valid JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);
    const riskAnalysis: RiskAnalysisResult = result.riskAnalysis;
    const investmentRecs: InvestmentRecommendationResult = result.investmentRecommendations;

    const analysis: Omit<InsertRiskAnalysis, "projectId"> = {
      overallScore: Math.max(0, Math.min(100, riskAnalysis.overallScore)),
      financialHealthScore: Math.max(0, Math.min(100, riskAnalysis.financialHealthScore)),
      teamCredibilityScore: Math.max(0, Math.min(100, riskAnalysis.teamCredibilityScore)),
      marketViabilityScore: Math.max(0, Math.min(100, riskAnalysis.marketViabilityScore)),
      regulatoryComplianceScore: Math.max(0, Math.min(100, riskAnalysis.regulatoryComplianceScore)),
      technicalImplementationScore: Math.max(0, Math.min(100, riskAnalysis.technicalImplementationScore)),
      riskLevel: riskAnalysis.riskLevel,
      summary: riskAnalysis.summary,
      strengths: riskAnalysis.strengths,
      weaknesses: riskAnalysis.weaknesses,
      recommendations: riskAnalysis.recommendations,
      aiModel: "gpt-5",
    };

    const recommendations: Omit<InsertInvestmentRecommendation, "projectId">[] = [
      {
        riskTolerance: "conservative",
        recommendation: investmentRecs.conservative.recommendation,
        suggestedAllocation: investmentRecs.conservative.suggestedAllocation,
        reasoning: investmentRecs.conservative.reasoning,
      },
      {
        riskTolerance: "moderate",
        recommendation: investmentRecs.moderate.recommendation,
        suggestedAllocation: investmentRecs.moderate.suggestedAllocation,
        reasoning: investmentRecs.moderate.reasoning,
      },
      {
        riskTolerance: "aggressive",
        recommendation: investmentRecs.aggressive.recommendation,
        suggestedAllocation: investmentRecs.aggressive.suggestedAllocation,
        reasoning: investmentRecs.aggressive.reasoning,
      },
    ];

    return { analysis, recommendations };
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    
    // Return a default analysis if OpenAI fails
    const fallbackAnalysis: Omit<InsertRiskAnalysis, "projectId"> = {
      overallScore: 50,
      financialHealthScore: 50,
      teamCredibilityScore: 50,
      marketViabilityScore: 50,
      regulatoryComplianceScore: 50,
      technicalImplementationScore: 50,
      riskLevel: "medium",
      summary: "Unable to complete full AI analysis. Please review project details manually and try again later.",
      strengths: ["Project submitted for analysis", "Basic information provided"],
      weaknesses: ["Full AI analysis could not be completed", "Manual review recommended"],
      recommendations: ["Retry analysis when service is available", "Consider providing more detailed documentation"],
      aiModel: "fallback",
    };

    const fallbackRecommendations: Omit<InsertInvestmentRecommendation, "projectId">[] = [
      { riskTolerance: "conservative", recommendation: "hold", suggestedAllocation: 0, reasoning: "Pending full analysis" },
      { riskTolerance: "moderate", recommendation: "hold", suggestedAllocation: 2, reasoning: "Pending full analysis" },
      { riskTolerance: "aggressive", recommendation: "hold", suggestedAllocation: 5, reasoning: "Pending full analysis" },
    ];

    return { analysis: fallbackAnalysis, recommendations: fallbackRecommendations };
  }
}
