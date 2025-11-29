import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

export function RiskGauge({ score, size = "md", showLabel = true, animated = true }: RiskGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayScore(score);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayScore(score);
    }
  }, [score, animated]);

  const sizeClasses = {
    sm: { container: "w-24 h-24", text: "text-xl", label: "text-xs" },
    md: { container: "w-36 h-36", text: "text-3xl", label: "text-sm" },
    lg: { container: "w-48 h-48", text: "text-4xl", label: "text-base" },
  };

  const getRiskLevel = (s: number) => {
    if (s >= 75) return { label: "Low Risk", color: "text-emerald-500", gradient: "from-emerald-500 to-teal-400" };
    if (s >= 50) return { label: "Medium Risk", color: "text-amber-500", gradient: "from-amber-500 to-yellow-400" };
    if (s >= 25) return { label: "High Risk", color: "text-orange-500", gradient: "from-orange-500 to-red-400" };
    return { label: "Critical Risk", color: "text-red-500", gradient: "from-red-500 to-rose-400" };
  };

  const risk = getRiskLevel(displayScore);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className={`relative ${sizeClasses[size].container} flex items-center justify-center`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        <defs>
          <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={`${risk.gradient.split(' ')[0].replace('from-', 'text-')}`} style={{ stopColor: 'currentColor' }} />
            <stop offset="100%" className={`${risk.gradient.split(' ')[1].replace('to-', 'text-')}`} style={{ stopColor: 'currentColor' }} />
          </linearGradient>
        </defs>
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={`url(#gradient-${score})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`font-bold font-display ${sizeClasses[size].text} ${risk.color}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {Math.round(displayScore)}
        </motion.span>
        {showLabel && (
          <motion.span
            className={`${sizeClasses[size].label} text-muted-foreground mt-1`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {risk.label}
          </motion.span>
        )}
      </div>
    </div>
  );
}

export function RiskScoreBar({ label, score, maxScore = 100 }: { label: string; score: number; maxScore?: number }) {
  const percentage = (score / maxScore) * 100;
  
  const getColor = (s: number) => {
    if (s >= 75) return "bg-emerald-500";
    if (s >= 50) return "bg-amber-500";
    if (s >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score}/{maxScore}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getColor(percentage)} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
