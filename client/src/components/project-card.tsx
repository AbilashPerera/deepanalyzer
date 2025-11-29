import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiskGauge } from "@/components/risk-gauge";
import { Building2, FileText, Coins, TrendingUp, ExternalLink, ArrowRight } from "lucide-react";
import type { RwaProjectWithAnalysis } from "@shared/schema";
import { motion } from "framer-motion";

interface ProjectCardProps {
  project: RwaProjectWithAnalysis;
  index?: number;
}

const assetTypeIcons: Record<string, typeof Building2> = {
  real_estate: Building2,
  bonds: FileText,
  invoices: FileText,
  commodities: Coins,
};

const assetTypeLabels: Record<string, string> = {
  real_estate: "Real Estate",
  bonds: "Bonds",
  invoices: "Invoices",
  commodities: "Commodities",
};

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const Icon = assetTypeIcons[project.assetType] || FileText;
  const riskScore = project.riskAnalysis?.overallScore || 0;
  const riskLevel = project.riskAnalysis?.riskLevel || "pending";

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "low": return "default";
      case "medium": return "secondary";
      case "high": return "destructive";
      case "critical": return "destructive";
      default: return "outline";
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="group hover-elevate overflow-visible border-card-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-purple-500" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base truncate" data-testid={`text-project-name-${project.id}`}>
                  {project.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {assetTypeLabels[project.assetType] || project.assetType}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {project.tokenSymbol}
                  </span>
                </div>
              </div>
            </div>
            {project.riskAnalysis && (
              <RiskGauge score={riskScore} size="sm" showLabel={false} />
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {project.description}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-0.5">Total Value</p>
              <p className="font-semibold text-sm" data-testid={`text-total-value-${project.id}`}>
                {formatValue(project.totalValue)}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-0.5">Est. Yield</p>
              <p className="font-semibold text-sm flex items-center gap-1 text-emerald-500">
                <TrendingUp className="w-3 h-3" />
                {project.yieldPercentage.toFixed(1)}%
              </p>
            </div>
          </div>

          {project.riskAnalysis && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Risk Level</span>
                <Badge 
                  variant={getRiskBadgeVariant(riskLevel)}
                  className={`capitalize ${
                    riskLevel === "low" ? "risk-bg-low text-emerald-500" :
                    riskLevel === "medium" ? "risk-bg-medium text-amber-500" :
                    riskLevel === "high" ? "risk-bg-high text-orange-500" :
                    "risk-bg-critical text-red-500"
                  }`}
                >
                  {riskLevel}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0 gap-2">
          <Link href={`/project/${project.id}`} className="flex-1">
            <Button variant="default" className="w-full gap-2" size="sm" data-testid={`button-view-project-${project.id}`}>
              View Analysis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          {project.contractAddress && (
            <Button variant="outline" size="icon" asChild className="shrink-0">
              <a 
                href={`https://explorer.mantle.xyz/address/${project.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`link-explorer-${project.id}`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
            <div>
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded mt-2 animate-pulse" />
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="h-10 bg-muted rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 bg-muted rounded animate-pulse" />
          <div className="h-14 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="h-9 w-full bg-muted rounded animate-pulse" />
      </CardFooter>
    </Card>
  );
}
