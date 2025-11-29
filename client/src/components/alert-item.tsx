import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, TrendingDown, Info, X, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { RiskAlert } from "@shared/schema";
import { motion } from "framer-motion";

interface AlertItemProps {
  alert: RiskAlert;
  onDismiss?: (id: string) => void;
  index?: number;
}

const alertTypeIcons: Record<string, typeof AlertTriangle> = {
  risk_increase: TrendingUp,
  risk_decrease: TrendingDown,
  yield_change: TrendingUp,
  market_event: Info,
};

const severityStyles: Record<string, { bg: string; text: string; border: string }> = {
  info: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  critical: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
};

export function AlertItem({ alert, onDismiss, index = 0 }: AlertItemProps) {
  const Icon = alertTypeIcons[alert.alertType] || Bell;
  const styles = severityStyles[alert.severity] || severityStyles.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={`p-4 border ${styles.border} ${styles.bg} ${alert.isRead ? "opacity-60" : ""}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full ${styles.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-4 h-4 ${styles.text}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-sm" data-testid={`text-alert-title-${alert.id}`}>
                  {alert.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                  {alert.message}
                </p>
              </div>
              <Badge variant="outline" className={`${styles.text} capitalize shrink-0`}>
                {alert.severity}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : "Just now"}
              </span>
              
              {alert.previousValue !== null && alert.newValue !== null && (
                <span className="text-xs font-mono">
                  {alert.previousValue.toFixed(1)} → {alert.newValue.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0 h-6 w-6"
              onClick={() => onDismiss(alert.id)}
              data-testid={`button-dismiss-alert-${alert.id}`}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export function AlertItemSkeleton() {
  return (
    <Card className="p-4 border-card-border/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

export function EmptyAlerts() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Bell className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-lg mb-1">No alerts yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        When there are significant risk changes or yield fluctuations, you'll see alerts here.
      </p>
    </div>
  );
}
