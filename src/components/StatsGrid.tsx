import { cn } from "@/lib/utils";
import { Shield, AlertTriangle, FileAudio, TrendingUp } from "lucide-react";

interface StatsGridProps {
  totalScans: number;
  threatDetected: number;
  safeScans: number;
  accuracyRate: number;
}

export const StatsGrid = ({ 
  totalScans, 
  threatDetected, 
  safeScans, 
  accuracyRate 
}: StatsGridProps) => {
  const stats = [
    {
      label: "Total Scans",
      value: totalScans,
      icon: FileAudio,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Threats Detected",
      value: threatDetected,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Safe Audio",
      value: safeScans,
      icon: Shield,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Accuracy Rate",
      value: `${accuracyRate}%`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="cyber-card animate-fade-in"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", stat.bgColor)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
