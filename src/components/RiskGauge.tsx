import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const RiskGauge = ({ score, size = "md", showLabel = true }: RiskGaugeProps) => {
  const getColor = () => {
    if (score < 30) return "text-success";
    if (score < 70) return "text-warning";
    return "text-destructive";
  };

  const getLabel = () => {
    if (score < 30) return "Safe";
    if (score < 70) return "Suspicious";
    return "High Risk";
  };

  const getGlowClass = () => {
    if (score < 30) return "success-glow";
    if (score < 70) return "";
    return "danger-glow";
  };

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-44 h-44",
  };

  const strokeWidth = size === "sm" ? 6 : size === "md" ? 8 : 10;
  const radius = size === "sm" ? 32 : size === "md" ? 52 : 72;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference * 0.75;
  const viewBox = size === "sm" ? "0 0 80 80" : size === "md" ? "0 0 128 128" : "0 0 176 176";
  const center = size === "sm" ? 40 : size === "md" ? 64 : 88;

  return (
    <div className={cn("relative flex flex-col items-center", getGlowClass())}>
      <svg
        className={cn(sizeClasses[size], "transform -rotate-135")}
        viewBox={viewBox}
      >
        {/* Background arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          className={cn(getColor(), "transition-all duration-1000 ease-out")}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          "font-mono font-bold",
          getColor(),
          size === "sm" ? "text-lg" : size === "md" ? "text-3xl" : "text-4xl"
        )}>
          {score}
        </span>
        {showLabel && (
          <span className={cn(
            "font-medium text-muted-foreground",
            size === "sm" ? "text-xs" : "text-sm"
          )}>
            {getLabel()}
          </span>
        )}
      </div>
    </div>
  );
};
