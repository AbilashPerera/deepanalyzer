import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/navbar";
import { RiskGauge, RiskScoreBar } from "@/components/risk-gauge";
import { RecommendationCard } from "@/components/recommendation-card";
import { AlertItem, EmptyAlerts } from "@/components/alert-item";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Building2,
  FileText,
  Coins,
  TrendingUp,
  ExternalLink,
  Globe,
  Users,
  Shield,
  Zap,
  Target,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Brain,
  BarChart3,
  Pencil
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { RwaProjectWithAnalysis, RiskAlert, InvestmentRecommendation, RiskTolerance } from "@shared/schema";
import { insertRwaProjectSchema } from "@shared/schema";
import { motion } from "framer-motion";

const editProjectSchema = insertRwaProjectSchema.extend({
  totalValue: z.coerce.number().min(0),
  tokenSupply: z.coerce.number().int().min(1),
  yieldPercentage: z.coerce.number().min(0).max(100),
  contractAddress: z.string().optional().or(z.literal("")),
  websiteUrl: z.string().optional().or(z.literal("")),
  whitepaperUrl: z.string().optional().or(z.literal("")),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

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

export default function ProjectDetailPage() {
  const [, params] = useRoute("/project/:id");
  const projectId = params?.id;
  const { toast } = useToast();
  const [selectedTolerance, setSelectedTolerance] = useState<RiskTolerance>("moderate");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const editForm = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      assetType: "real_estate",
      totalValue: 0,
      tokenSymbol: "",
      tokenSupply: 0,
      yieldPercentage: 0,
      contractAddress: "",
      websiteUrl: "",
      whitepaperUrl: "",
      teamInfo: "",
      tokenomics: "",
      complianceInfo: "",
    },
  });

  const { data: project, isLoading: projectLoading } = useQuery<RwaProjectWithAnalysis>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const { data: alerts } = useQuery<RiskAlert[]>({
    queryKey: ["/api/alerts", projectId],
    enabled: !!projectId,
  });

  const { data: recommendations } = useQuery<InvestmentRecommendation[]>({
    queryKey: ["/api/recommendations", projectId],
    enabled: !!projectId,
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/analyze`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations", projectId] });
      toast({
        title: "Analysis complete",
        description: "Risk analysis has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: EditProjectFormData) => {
      const response = await apiRequest("PATCH", `/api/projects/${projectId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditDialogOpen(false);
      toast({
        title: "Project updated",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const openEditDialog = () => {
    if (project) {
      editForm.reset({
        name: project.name,
        description: project.description,
        assetType: project.assetType,
        totalValue: project.totalValue,
        tokenSymbol: project.tokenSymbol,
        tokenSupply: project.tokenSupply,
        yieldPercentage: project.yieldPercentage,
        contractAddress: project.contractAddress || "",
        websiteUrl: project.websiteUrl || "",
        whitepaperUrl: project.whitepaperUrl || "",
        teamInfo: project.teamInfo,
        tokenomics: project.tokenomics,
        complianceInfo: project.complianceInfo,
      });
      setEditDialogOpen(true);
    }
  };

  const handleEditSubmit = (data: EditProjectFormData) => {
    editMutation.mutate(data);
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-96" />
              </div>
              <Skeleton className="h-96" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist.</p>
          <Link href="/explore">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Explore
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const Icon = assetTypeIcons[project.assetType] || FileText;
  const analysis = project.riskAnalysis;
  const projectAlerts = alerts?.filter(a => a.projectId === projectId) || [];
  const projectRecommendations = recommendations?.filter(r => r.projectId === projectId) || [];

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "text-emerald-500";
      case "medium": return "text-amber-500";
      case "high": return "text-orange-500";
      case "critical": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/explore">
          <Button variant="ghost" className="mb-4" data-testid="button-back-to-explore">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center shrink-0">
                <Icon className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display" data-testid="text-project-title">
                  {project.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline">
                    {assetTypeLabels[project.assetType] || project.assetType}
                  </Badge>
                  <span className="text-sm font-mono text-muted-foreground">{project.tokenSymbol}</span>
                  {analysis && (
                    <Badge className={`capitalize ${
                      analysis.riskLevel === "low" ? "risk-bg-low text-emerald-500" :
                      analysis.riskLevel === "medium" ? "risk-bg-medium text-amber-500" :
                      analysis.riskLevel === "high" ? "risk-bg-high text-orange-500" :
                      "risk-bg-critical text-red-500"
                    }`}>
                      {analysis.riskLevel} Risk
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {project.websiteUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {project.contractAddress && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://explorer.mantle.xyz/address/${project.contractAddress}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contract
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={openEditDialog}
                data-testid="button-edit-project"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => analyzeMutation.mutate()}
                disabled={analyzeMutation.isPending}
                data-testid="button-reanalyze"
              >
                {analyzeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                {analysis ? "Re-analyze" : "Analyze"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                    <p className="text-xl font-bold">{formatValue(project.totalValue)}</p>
                  </CardContent>
                </Card>
                <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Token Supply</p>
                    <p className="text-xl font-bold">{project.tokenSupply.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Est. Yield</p>
                    <p className="text-xl font-bold text-emerald-500 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {project.yieldPercentage.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
                    <p className={`text-xl font-bold ${analysis ? getRiskColor(analysis.riskLevel) : ""}`}>
                      {analysis ? analysis.overallScore : "Pending"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Analysis Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{project.description}</p>
                      
                      {analysis && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-3">AI Analysis Summary</h4>
                            <p className="text-muted-foreground">{analysis.summary}</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analysis">
                  <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Risk Analysis</CardTitle>
                      <CardDescription>
                        Detailed breakdown of risk factors
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analysis ? (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <RiskScoreBar label="Financial Health" score={analysis.financialHealthScore} />
                            <RiskScoreBar label="Team Credibility" score={analysis.teamCredibilityScore} />
                            <RiskScoreBar label="Market Viability" score={analysis.marketViabilityScore} />
                            <RiskScoreBar label="Regulatory Compliance" score={analysis.regulatoryComplianceScore} />
                            <RiskScoreBar label="Technical Implementation" score={analysis.technicalImplementationScore} />
                          </div>

                          <Separator />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Strengths
                              </h4>
                              <ul className="space-y-2">
                                {analysis.strengths.map((strength, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-emerald-500 mt-1">+</span>
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Weaknesses
                              </h4>
                              <ul className="space-y-2">
                                {analysis.weaknesses.map((weakness, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-amber-500 mt-1">-</span>
                                    {weakness}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">
                            This project hasn't been analyzed yet.
                          </p>
                          <Button onClick={() => analyzeMutation.mutate()}>
                            <Brain className="w-4 h-4 mr-2" />
                            Start Analysis
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="team">
                  <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        Team Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{project.teamInfo}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="compliance">
                  <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" />
                        Compliance & Tokenomics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Tokenomics</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{project.tokenomics}</p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Compliance Information</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{project.complianceInfo}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Recommendations */}
            {projectRecommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                      Investment Recommendations
                    </CardTitle>
                    <CardDescription>
                      Personalized recommendations based on risk tolerance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      {(["conservative", "moderate", "aggressive"] as RiskTolerance[]).map((tolerance) => (
                        <Button
                          key={tolerance}
                          variant={selectedTolerance === tolerance ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTolerance(tolerance)}
                          className="capitalize"
                        >
                          {tolerance === "conservative" && <Shield className="w-4 h-4 mr-2" />}
                          {tolerance === "moderate" && <Target className="w-4 h-4 mr-2" />}
                          {tolerance === "aggressive" && <Zap className="w-4 h-4 mr-2" />}
                          {tolerance}
                        </Button>
                      ))}
                    </div>
                    
                    {projectRecommendations
                      .filter(r => r.riskTolerance === selectedTolerance)
                      .map((rec) => (
                        <RecommendationCard key={rec.id} recommendation={rec} />
                      ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Risk Gauge */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Overall Risk Score</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center py-4">
                    <RiskGauge score={analysis.overallScore} size="lg" />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Project Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {projectAlerts.length > 0 ? (
                    <div className="space-y-3">
                      {projectAlerts.map((alert, index) => (
                        <AlertItem key={alert.id} alert={alert} index={index} />
                      ))}
                    </div>
                  ) : (
                    <EmptyAlerts />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {project.websiteUrl && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Project Website
                      </a>
                    </Button>
                  )}
                  {project.whitepaperUrl && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={project.whitepaperUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4 mr-2" />
                        Whitepaper
                      </a>
                    </Button>
                  )}
                  {project.contractAddress && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a 
                        href={`https://explorer.mantle.xyz/address/${project.contractAddress}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)}>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4 pb-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} data-testid="input-edit-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="assetType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-assetType">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="real_estate">Real Estate</SelectItem>
                              <SelectItem value="bonds">Bonds</SelectItem>
                              <SelectItem value="invoices">Invoices</SelectItem>
                              <SelectItem value="commodities">Commodities</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="tokenSymbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Symbol</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-edit-tokenSymbol" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
                      name="totalValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Value ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-edit-totalValue" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="tokenSupply"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Supply</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-edit-tokenSupply" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="yieldPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yield (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} data-testid="input-edit-yieldPercentage" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="contractAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Address (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-contractAddress" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-edit-websiteUrl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="whitepaperUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Whitepaper URL (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-edit-whitepaperUrl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="teamInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Information</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} data-testid="input-edit-teamInfo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="tokenomics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tokenomics</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} data-testid="input-edit-tokenomics" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="complianceInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compliance Information</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} data-testid="input-edit-complianceInfo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  data-testid="button-edit-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editMutation.isPending}
                  data-testid="button-edit-save"
                >
                  {editMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
