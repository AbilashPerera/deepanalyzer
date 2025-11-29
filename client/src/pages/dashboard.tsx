import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { StatsCard, StatsCardSkeleton } from "@/components/stats-card";
import { ProjectCard, ProjectCardSkeleton } from "@/components/project-card";
import { AlertItem, AlertItemSkeleton, EmptyAlerts } from "@/components/alert-item";
import { MarketDataCard, MarketDataSkeleton } from "@/components/market-data-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  FileSearch, 
  PlusCircle,
  RefreshCw,
  Activity
} from "lucide-react";
import { Link } from "wouter";
import type { RwaProjectWithAnalysis, RiskAlert, MarketData } from "@shared/schema";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CHART_COLORS = ["#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = useQuery<RwaProjectWithAnalysis[]>({
    queryKey: ["/api/projects"],
  });

  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery<RiskAlert[]>({
    queryKey: ["/api/alerts"],
  });

  const { data: marketData, isLoading: marketLoading, refetch: refetchMarket } = useQuery<MarketData[]>({
    queryKey: ["/api/market-data"],
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchProjects(), refetchAlerts(), refetchMarket()]);
    setIsRefreshing(false);
  };

  const analyzedProjects = projects?.filter(p => p.riskAnalysis) || [];
  const pendingProjects = projects?.filter(p => !p.riskAnalysis) || [];
  const unreadAlerts = alerts?.filter(a => !a.isRead) || [];
  
  const avgRiskScore = analyzedProjects.length > 0
    ? analyzedProjects.reduce((sum, p) => sum + (p.riskAnalysis?.overallScore || 0), 0) / analyzedProjects.length
    : 0;

  const totalValue = projects?.reduce((sum, p) => sum + p.totalValue, 0) || 0;

  const riskDistribution = [
    { name: "Low", value: analyzedProjects.filter(p => p.riskAnalysis?.riskLevel === "low").length, color: "#22c55e" },
    { name: "Medium", value: analyzedProjects.filter(p => p.riskAnalysis?.riskLevel === "medium").length, color: "#f59e0b" },
    { name: "High", value: analyzedProjects.filter(p => p.riskAnalysis?.riskLevel === "high").length, color: "#f97316" },
    { name: "Critical", value: analyzedProjects.filter(p => p.riskAnalysis?.riskLevel === "critical").length, color: "#ef4444" },
  ];

  const assetTypeDistribution = [
    { name: "Real Estate", value: projects?.filter(p => p.assetType === "real_estate").length || 0 },
    { name: "Bonds", value: projects?.filter(p => p.assetType === "bonds").length || 0 },
    { name: "Invoices", value: projects?.filter(p => p.assetType === "invoices").length || 0 },
    { name: "Commodities", value: projects?.filter(p => p.assetType === "commodities").length || 0 },
  ];

  const performanceData = [
    { month: "Jan", score: 65, alerts: 12 },
    { month: "Feb", score: 68, alerts: 8 },
    { month: "Mar", score: 72, alerts: 15 },
    { month: "Apr", score: 70, alerts: 10 },
    { month: "May", score: 75, alerts: 6 },
    { month: "Jun", score: 78, alerts: 4 },
  ];

  const formatValue = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your RWA portfolio and risk metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh-dashboard"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/submit">
              <Button size="sm" data-testid="button-add-project">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {projectsLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Projects"
                value={projects?.length || 0}
                change={12.5}
                icon={FileSearch}
                iconColor="text-purple-500"
                delay={0}
              />
              <StatsCard
                title="Total Value Locked"
                value={formatValue(totalValue)}
                change={8.3}
                icon={BarChart3}
                iconColor="text-blue-500"
                delay={0.1}
              />
              <StatsCard
                title="Avg Risk Score"
                value={avgRiskScore.toFixed(0)}
                change={-2.1}
                icon={TrendingUp}
                iconColor="text-emerald-500"
                delay={0.2}
              />
              <StatsCard
                title="Active Alerts"
                value={unreadAlerts.length}
                change={-15.0}
                icon={AlertTriangle}
                iconColor="text-amber-500"
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Chart */}
            <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Risk Score Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#8b5cf6" 
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Risk Distribution */}
              <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {riskDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Asset Type Distribution */}
              <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Asset Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assetTypeDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-lg">Recent Projects</CardTitle>
                  <Link href="/explore">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProjectCardSkeleton />
                    <ProjectCardSkeleton />
                  </div>
                ) : projects && projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.slice(0, 4).map((project, index) => (
                      <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No projects yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Submit your first RWA project to get started
                    </p>
                    <Link href="/submit">
                      <Button data-testid="button-submit-first-project">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Submit Project
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Alerts & Market Data */}
          <div className="space-y-6">
            {/* Alerts */}
            <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Recent Alerts
                  {unreadAlerts.length > 0 && (
                    <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">
                      {unreadAlerts.length} new
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {alertsLoading ? (
                    <div className="space-y-3">
                      <AlertItemSkeleton />
                      <AlertItemSkeleton />
                      <AlertItemSkeleton />
                    </div>
                  ) : alerts && alerts.length > 0 ? (
                    <div className="space-y-3 pr-4">
                      {alerts.slice(0, 5).map((alert, index) => (
                        <AlertItem key={alert.id} alert={alert} index={index} />
                      ))}
                    </div>
                  ) : (
                    <EmptyAlerts />
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Market Data */}
            <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Market Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketLoading ? (
                    <>
                      <MarketDataSkeleton />
                      <MarketDataSkeleton />
                    </>
                  ) : marketData && marketData.length > 0 ? (
                    marketData.slice(0, 3).map((data, index) => (
                      <MarketDataCard key={data.id} data={data} index={index} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No market data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
