import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Shield, Zap, Target } from "lucide-react";
import type { InvestmentRecommendation, RiskTolerance, RecommendationType } from "@shared/schema";
import { motion } from "framer-motion";

interface RecommendationCardProps {
  recommendation: InvestmentRecommendation;
  projectName?: string;
}

const recommendationStyles: Record<RecommendationType, { 
  label: string; 
  color: string; 
  bg: string; 
  icon: typeof TrendingUp 
}> = {
  strong_buy: { label: "Strong Buy", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: TrendingUp },
  buy: { label: "Buy", color: "text-green-500", bg: "bg-green-500/10", icon: TrendingUp },
  hold: { label: "Hold", color: "text-amber-500", bg: "bg-amber-500/10", icon: Minus },
  sell: { label: "Sell", color: "text-orange-500", bg: "bg-orange-500/10", icon: TrendingDown },
  strong_sell: { label: "Strong Sell", color: "text-red-500", bg: "bg-red-500/10", icon: TrendingDown },
};

const toleranceIcons: Record<RiskTolerance, typeof Shield> = {
  conservative: Shield,
  moderate: Target,
  aggressive: Zap,
};

const toleranceLabels: Record<RiskTolerance, string> = {
  conservative: "Conservative",
  moderate: "Moderate",
  aggressive: "Aggressive",
};

export function RecommendationCard({ recommendation, projectName }: RecommendationCardProps) {
  const style = recommendationStyles[recommendation.recommendation as RecommendationType] || recommendationStyles.hold;
  const ToleranceIcon = toleranceIcons[recommendation.riskTolerance as RiskTolerance] || Target;
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ToleranceIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {toleranceLabels[recommendation.riskTolerance as RiskTolerance]} Profile
              </span>
            </div>
            <Badge className={`${style.bg} ${style.color} border-0`}>
              <Icon className="w-3 h-3 mr-1" />
              {style.label}
            </Badge>
          </div>
          {projectName && (
            <CardTitle className="text-lg mt-2">{projectName}</CardTitle>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Suggested Allocation</span>
              <span className="font-semibold">{recommendation.suggestedAllocation.toFixed(1)}%</span>
            </div>
            <Progress value={recommendation.suggestedAllocation} className="h-2" />
          </div>
          
          <p className="text-sm text-muted-foreground">
            {recommendation.reasoning}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface RecommendationSummaryProps {
  recommendations: InvestmentRecommendation[];
  riskTolerance: RiskTolerance;
}

export function RecommendationSummary({ recommendations, riskTolerance }: RecommendationSummaryProps) {
  const filtered = recommendations.filter(r => r.riskTolerance === riskTolerance);
  const ToleranceIcon = toleranceIcons[riskTolerance];

  const summary = filtered.reduce((acc, r) => {
    const type = r.recommendation as RecommendationType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<RecommendationType, number>);

  return (
    <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ToleranceIcon className="w-5 h-5 text-purple-500" />
          <CardTitle className="text-lg">
            {toleranceLabels[riskTolerance]} Recommendations
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(recommendationStyles) as RecommendationType[]).map((type) => {
            const style = recommendationStyles[type];
            const count = summary[type] || 0;
            return (
              <div 
                key={type} 
                className={`p-2 rounded-lg text-center ${style.bg}`}
              >
                <p className={`text-lg font-bold ${style.color}`}>{count}</p>
                <p className="text-xs text-muted-foreground">{style.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
