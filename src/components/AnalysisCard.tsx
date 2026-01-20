import { cn } from "@/lib/utils";
import { RiskGauge } from "./RiskGauge";
import { AlertTriangle, CheckCircle, Clock, FileAudio } from "lucide-react";

interface AnalysisResult {
  id: string;
  filename: string;
  timestamp: Date;
  riskScore: number;
  transcription: string;
  flags: string[];
  status: "safe" | "suspicious" | "danger";
}

interface AnalysisCardProps {
  result: AnalysisResult;
  onClick?: () => void;
}

export const AnalysisCard = ({ result, onClick }: AnalysisCardProps) => {
  const getStatusIcon = () => {
    switch (result.status) {
      case "safe":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "suspicious":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "danger":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
    }
  };

  const getStatusBorder = () => {
    switch (result.status) {
      case "safe":
        return "border-success/30 hover:border-success/50";
      case "suspicious":
        return "border-warning/30 hover:border-warning/50";
      case "danger":
        return "border-destructive/30 hover:border-destructive/50";
    }
  };

  return (
    <div
      className={cn(
        "cyber-card cursor-pointer transition-all duration-300 hover:scale-[1.02]",
        "border-2",
        getStatusBorder()
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon()}
            <span className="font-mono text-sm text-muted-foreground">
              #{result.id.slice(0, 8)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <FileAudio className="w-4 h-4 text-primary" />
            <span className="font-medium truncate">{result.filename}</span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {result.transcription}
          </p>

          {result.flags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.flags.slice(0, 3).map((flag, i) => (
                <span
                  key={i}
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-mono",
                    result.status === "danger" 
                      ? "bg-destructive/20 text-destructive" 
                      : "bg-warning/20 text-warning"
                  )}
                >
                  {flag}
                </span>
              ))}
              {result.flags.length > 3 && (
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground">
                  +{result.flags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{result.timestamp.toLocaleString()}</span>
          </div>
        </div>

        <RiskGauge score={result.riskScore} size="sm" showLabel={false} />
      </div>
    </div>
  );
};
