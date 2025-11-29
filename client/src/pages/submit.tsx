import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Building2, 
  FileText, 
  Coins, 
  Users, 
  Shield, 
  Rocket,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().min(50, "Description must be at least 50 characters").max(1000),
  assetType: z.enum(["real_estate", "bonds", "invoices", "commodities"]),
  totalValue: z.coerce.number().min(1000, "Minimum value is $1,000"),
  tokenSymbol: z.string().min(2).max(10).toUpperCase(),
  tokenSupply: z.coerce.number().min(1, "Token supply must be at least 1"),
  yieldPercentage: z.coerce.number().min(0).max(100),
  contractAddress: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  whitepaperUrl: z.string().url().optional().or(z.literal("")),
  teamInfo: z.string().min(50, "Team information must be at least 50 characters").max(2000),
  tokenomics: z.string().min(50, "Tokenomics must be at least 50 characters").max(2000),
  complianceInfo: z.string().min(30, "Compliance information must be at least 30 characters").max(2000),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const steps = [
  { id: 1, title: "Basic Info", icon: FileText, description: "Project name and description" },
  { id: 2, title: "Asset Details", icon: Coins, description: "Value and token information" },
  { id: 3, title: "Team & Links", icon: Users, description: "Team and project URLs" },
  { id: 4, title: "Compliance", icon: Shield, description: "Tokenomics and regulatory" },
  { id: 5, title: "Review", icon: Rocket, description: "Review and submit" },
];

const assetTypeOptions = [
  { value: "real_estate", label: "Real Estate", icon: Building2, description: "Properties, land, REITs" },
  { value: "bonds", label: "Bonds", icon: FileText, description: "Government, corporate bonds" },
  { value: "invoices", label: "Invoices", icon: FileText, description: "Invoice financing, receivables" },
  { value: "commodities", label: "Commodities", icon: Coins, description: "Precious metals, resources" },
];

export default function SubmitPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
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
    mode: "onChange",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project submitted successfully!",
        description: "AI analysis will begin shortly.",
      });
      setLocation(`/project/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof ProjectFormData)[] => {
    switch (step) {
      case 1: return ["name", "description", "assetType"];
      case 2: return ["totalValue", "tokenSymbol", "tokenSupply", "yieldPercentage"];
      case 3: return ["teamInfo", "websiteUrl", "whitepaperUrl"];
      case 4: return ["tokenomics", "complianceInfo"];
      default: return [];
    }
  };

  const onSubmit = (data: ProjectFormData) => {
    submitMutation.mutate(data);
  };

  const progress = (currentStep / 5) * 100;
  const values = form.watch();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2">Submit RWA Project</h1>
          <p className="text-muted-foreground">
            Submit your tokenized real-world asset project for AI-powered risk analysis
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of 5</span>
            <span className="text-sm font-medium">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="hidden md:flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-purple-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-0.5 mx-2 ${isCompleted ? "bg-emerald-500" : "bg-muted"}`} style={{ minWidth: "40px" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                      <>
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Manhattan Real Estate Token" {...field} data-testid="input-project-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your project, its goals, and the underlying assets..."
                                  className="min-h-[120px]"
                                  {...field}
                                  data-testid="input-project-description"
                                />
                              </FormControl>
                              <FormDescription>
                                Minimum 50 characters. Be specific about the asset and its value proposition.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="assetType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Asset Type</FormLabel>
                              <div className="grid grid-cols-2 gap-3">
                                {assetTypeOptions.map((option) => {
                                  const Icon = option.icon;
                                  const isSelected = field.value === option.value;
                                  return (
                                    <div
                                      key={option.value}
                                      onClick={() => field.onChange(option.value)}
                                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                        isSelected
                                          ? "border-purple-500 bg-purple-500/10"
                                          : "border-border hover:border-purple-500/50"
                                      }`}
                                      data-testid={`select-asset-${option.value}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 ${isSelected ? "text-purple-500" : "text-muted-foreground"}`} />
                                        <div>
                                          <p className="font-medium">{option.label}</p>
                                          <p className="text-xs text-muted-foreground">{option.description}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {/* Step 2: Asset Details */}
                    {currentStep === 2 && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="totalValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Asset Value (USD)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="1000000" {...field} data-testid="input-total-value" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="yieldPercentage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expected Yield (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.1" placeholder="8.5" {...field} data-testid="input-yield" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="tokenSymbol"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Token Symbol</FormLabel>
                                <FormControl>
                                  <Input placeholder="MRET" {...field} className="uppercase" data-testid="input-token-symbol" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="tokenSupply"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Token Supply</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="1000000" {...field} data-testid="input-token-supply" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="contractAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contract Address (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="0x..." {...field} className="font-mono" data-testid="input-contract-address" />
                              </FormControl>
                              <FormDescription>
                                If already deployed on Mantle Network
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {/* Step 3: Team & Links */}
                    {currentStep === 3 && (
                      <>
                        <FormField
                          control={form.control}
                          name="teamInfo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Team Information</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the founding team, their experience, and relevant background..."
                                  className="min-h-[120px]"
                                  {...field}
                                  data-testid="input-team-info"
                                />
                              </FormControl>
                              <FormDescription>
                                Include team members' names, roles, and relevant experience.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="websiteUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://yourproject.com" {...field} data-testid="input-website-url" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="whitepaperUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Whitepaper URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://yourproject.com/whitepaper.pdf" {...field} data-testid="input-whitepaper-url" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                    {/* Step 4: Compliance */}
                    {currentStep === 4 && (
                      <>
                        <FormField
                          control={form.control}
                          name="tokenomics"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tokenomics</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe token distribution, vesting schedules, utility, and economic model..."
                                  className="min-h-[120px]"
                                  {...field}
                                  data-testid="input-tokenomics"
                                />
                              </FormControl>
                              <FormDescription>
                                Detail the token allocation, distribution mechanism, and utility.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="complianceInfo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compliance Information</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe regulatory compliance measures, licenses, KYC requirements..."
                                  className="min-h-[120px]"
                                  {...field}
                                  data-testid="input-compliance-info"
                                />
                              </FormControl>
                              <FormDescription>
                                Include jurisdiction, regulatory status, and compliance measures.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {/* Step 5: Review */}
                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div className="rounded-lg border border-border p-4 space-y-4">
                          <div>
                            <Label className="text-muted-foreground text-xs">Project Name</Label>
                            <p className="font-medium">{values.name || "-"}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground text-xs">Asset Type</Label>
                              <Badge variant="outline" className="mt-1">
                                {assetTypeOptions.find(o => o.value === values.assetType)?.label || values.assetType}
                              </Badge>
                            </div>
                            <div>
                              <Label className="text-muted-foreground text-xs">Token Symbol</Label>
                              <p className="font-mono font-medium">{values.tokenSymbol || "-"}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground text-xs">Total Value</Label>
                              <p className="font-medium">${values.totalValue?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground text-xs">Expected Yield</Label>
                              <p className="font-medium text-emerald-500">{values.yieldPercentage || 0}%</p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-muted-foreground text-xs">Description</Label>
                            <p className="text-sm text-muted-foreground line-clamp-3">{values.description || "-"}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Before submitting</p>
                            <p className="text-sm text-muted-foreground">
                              Please review all information carefully. Once submitted, AI analysis will begin immediately
                              and cannot be cancelled.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
                data-testid="button-prev-step"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button type="button" onClick={handleNext} data-testid="button-next-step">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                  data-testid="button-submit-project"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Submit for Analysis
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
