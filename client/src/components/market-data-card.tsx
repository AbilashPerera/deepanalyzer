import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";
import type { MarketData } from "@shared/schema";
import { motion } from "framer-motion";

interface MarketDataCardProps {
  data: MarketData;
  index?: number;
}

export function MarketDataCard({ data, index = 0 }: MarketDataCardProps) {
  const isPositive = data.priceChange24h >= 0;

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(2)}K`;
    return `$${price.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm hover-elevate">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-base font-mono">{data.symbol}</CardTitle>
                <p className="text-xs text-muted-foreground capitalize">{data.assetType.replace('_', ' ')}</p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={isPositive ? "text-emerald-500 border-emerald-500/30" : "text-red-500 border-red-500/30"}
            >
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {isPositive ? "+" : ""}{data.priceChange24h.toFixed(2)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold font-display">{formatPrice(data.price)}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  24h Volume
                </p>
                <p className="font-medium">{formatVolume(data.volume24h)}</p>
              </div>
              {data.marketCap && (
                <div className="p-2 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Market Cap</p>
                  <p className="font-medium">{formatVolume(data.marketCap)}</p>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-right">
              Updated {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : "just now"}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MarketDataSkeleton() {
  return (
    <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-3 w-12 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-14 bg-muted rounded animate-pulse" />
            <div className="h-14 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
