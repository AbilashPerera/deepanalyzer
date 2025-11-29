import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import type { ProjectFilters } from "@shared/schema";

interface ProjectFiltersProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
}

export function ProjectFiltersCard({ filters, onFiltersChange }: ProjectFiltersProps) {
  const handleReset = () => {
    onFiltersChange({});
  };

  return (
    <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-500" />
            <CardTitle className="text-base">Filters</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            className="h-8 px-2 text-xs"
            data-testid="button-reset-filters"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm">Asset Type</Label>
          <Select 
            value={filters.assetType || "all"} 
            onValueChange={(value) => onFiltersChange({ ...filters, assetType: value === "all" ? undefined : value })}
          >
            <SelectTrigger data-testid="select-asset-type">
              <SelectValue placeholder="All Asset Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Asset Types</SelectItem>
              <SelectItem value="real_estate">Real Estate</SelectItem>
              <SelectItem value="bonds">Bonds</SelectItem>
              <SelectItem value="invoices">Invoices</SelectItem>
              <SelectItem value="commodities">Commodities</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Risk Level</Label>
          <Select 
            value={filters.riskLevel || "all"} 
            onValueChange={(value) => onFiltersChange({ ...filters, riskLevel: value === "all" ? undefined : value })}
          >
            <SelectTrigger data-testid="select-risk-level">
              <SelectValue placeholder="All Risk Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="critical">Critical Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Min Yield (%)</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {filters.minYield?.toFixed(0) || 0}%
            </span>
          </div>
          <Slider
            value={[filters.minYield || 0]}
            onValueChange={([value]) => onFiltersChange({ ...filters, minYield: value })}
            max={30}
            step={1}
            className="w-full"
            data-testid="slider-min-yield"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Min Risk Score</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {filters.minScore || 0}
            </span>
          </div>
          <Slider
            value={[filters.minScore || 0]}
            onValueChange={([value]) => onFiltersChange({ ...filters, minScore: value })}
            max={100}
            step={5}
            className="w-full"
            data-testid="slider-min-score"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectFiltersInline({ filters, onFiltersChange }: ProjectFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select 
        value={filters.assetType || "all"} 
        onValueChange={(value) => onFiltersChange({ ...filters, assetType: value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-40" data-testid="inline-select-asset-type">
          <SelectValue placeholder="Asset Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="real_estate">Real Estate</SelectItem>
          <SelectItem value="bonds">Bonds</SelectItem>
          <SelectItem value="invoices">Invoices</SelectItem>
          <SelectItem value="commodities">Commodities</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={filters.riskLevel || "all"} 
        onValueChange={(value) => onFiltersChange({ ...filters, riskLevel: value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-40" data-testid="inline-select-risk-level">
          <SelectValue placeholder="Risk Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Risks</SelectItem>
          <SelectItem value="low">Low Risk</SelectItem>
          <SelectItem value="medium">Medium Risk</SelectItem>
          <SelectItem value="high">High Risk</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>

      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onFiltersChange({})}
        data-testid="button-clear-inline-filters"
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Clear
      </Button>
    </div>
  );
}
