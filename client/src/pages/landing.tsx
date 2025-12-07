import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Shield, 
  Zap, 
  Brain, 
  Lock, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  LineChart
} from "lucide-react";
import { motion } from "framer-motion";
import { WalletConnect } from "@/components/wallet-connect";
import { useQuery } from "@tanstack/react-query";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced GPT models analyze project fundamentals, team credibility, tokenomics, and compliance for comprehensive risk assessment.",
  },
  {
    icon: LineChart,
    title: "Real-Time Data",
    description: "Integration with Chainlink oracles provides live price feeds, market data, and yield information for accurate analysis.",
  },
  {
    icon: Shield,
    title: "Risk Scoring",
    description: "Comprehensive 0-100 risk scores with detailed breakdowns across financial health, team, market viability, and compliance.",
  },
  {
    icon: TrendingUp,
    title: "Investment Recommendations",
    description: "Personalized recommendations based on your risk tolerance profile - conservative, moderate, or aggressive.",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    description: "Real-time notifications for significant risk changes, yield fluctuations, and market events affecting your watched assets.",
  },
  {
    icon: Lock,
    title: "On-Chain Integration",
    description: "Direct integration with Mantle Network for on-chain RWA data fetching and smart contract verification.",
  },
];

const techStack = [
  { name: "Mantle Network", description: "Layer 2 Blockchain" },
  { name: "OpenAI GPT", description: "AI Analysis" },
  { name: "Chainlink", description: "Oracle Data" },
  { name: "React", description: "Frontend" },
];

function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export default function LandingPage() {
  const { data: stats } = useQuery<{ projectCount: number; totalValue: number; analysisCount: number }>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/5 to-cyan-600/10" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 pt-20 pb-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-purple-500/30 bg-purple-500/10">
                <Sparkles className="w-3 h-3 mr-2 text-purple-400" />
                AI-Powered RWA Intelligence on Mantle
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="gradient-text">RiskLens</span>
              <br />
              RWA Intelligence
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Evaluate tokenized real-world assets with advanced AI risk scoring, 
              oracle data integration, and personalized investment recommendations. 
              Make informed decisions in the RWA ecosystem.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8" data-testid="button-launch-app">
                  Launch App
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" data-testid="button-explore-projects">
                  Explore Projects
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Real Stats from Database */}
          {stats && (stats.projectCount > 0 || stats.totalValue > 0) && (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-20 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="border-card-border/50 bg-card/30 backdrop-blur-sm text-center">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-2xl sm:text-3xl font-bold font-display gradient-text">
                    {formatCurrency(stats.totalValue)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Assets Analyzed</p>
                </CardContent>
              </Card>
              <Card className="border-card-border/50 bg-card/30 backdrop-blur-sm text-center">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-2xl sm:text-3xl font-bold font-display gradient-text">
                    {stats.projectCount}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">RWA Projects</p>
                </CardContent>
              </Card>
              <Card className="border-card-border/50 bg-card/30 backdrop-blur-sm text-center col-span-2 md:col-span-1">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-2xl sm:text-3xl font-bold font-display gradient-text">
                    {stats.analysisCount}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Risk Analyses</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
              Comprehensive Risk Intelligence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to evaluate and monitor tokenized real-world assets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full border-card-border/50 bg-card/50 backdrop-blur-sm hover-elevate">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-purple-500" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
              Three Simple Steps
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Submit Your RWA Project",
                description: "Provide project details including asset type, team information, tokenomics, and compliance documentation.",
              },
              {
                step: "02",
                title: "AI Analyzes the Data",
                description: "Our AI engine evaluates all aspects of your project using advanced language models and oracle data.",
              },
              {
                step: "03",
                title: "Get Actionable Insights",
                description: "Receive comprehensive risk scores, detailed analysis, and personalized investment recommendations.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex gap-6 mb-8 last:mb-0"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div className="w-0.5 h-16 bg-gradient-to-b from-purple-600/50 to-transparent mx-auto mt-2" />
                  )}
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Technology</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
              Powered By
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <p className="font-semibold">{tech.name}</p>
                    <p className="text-xs text-muted-foreground">{tech.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20 overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center relative">
              <div className="absolute inset-0 grid-pattern opacity-20" />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold font-display mb-4">
                  Ready to Analyze Your First RWA Project?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Submit your tokenized real-world asset project for comprehensive AI-powered risk analysis.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <WalletConnect />
                  <Link href="/submit">
                    <Button variant="outline" size="lg" data-testid="button-submit-project">
                      Submit a Project
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold">RiskLens</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-Powered RWA Risk Intelligence
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="https://www.mantle.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Mantle Network
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
