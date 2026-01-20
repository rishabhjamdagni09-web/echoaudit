import { cn } from "@/lib/utils";
import { RiskGauge } from "./RiskGauge";
import { 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  X, 
  ExternalLink,
  Download,
  Trash2,
  Clock,
  Brain,
  FileAudio
} from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface Threat {
  id: string;
  threat_type: string;
  description: string;
  severity: "low" | "medium" | "high";
  confidence: number;
  recommendation: string;
}

interface Analysis {
  id: string;
  filename: string;
  transcription: string;
  risk_score: number;
  status: "safe" | "suspicious" | "danger";
  ai_summary: string;
  is_ai_generated: boolean;
  confidence_score: number;
  created_at: string;
  threats: Threat[];
}

interface DetailedThreatViewProps {
  analysis: Analysis | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onExport?: (analysis: Analysis) => void;
}

export const DetailedThreatView = ({ 
  analysis, 
  isOpen, 
  onClose,
  onDelete,
  onExport 
}: DetailedThreatViewProps) => {
  if (!analysis) return null;

  const getSeverityColor = (severity: Threat["severity"]) => {
    switch (severity) {
      case "low": return "bg-warning/20 text-warning border-warning/30";
      case "medium": return "bg-warning/30 text-warning border-warning/50";
      case "high": return "bg-destructive/20 text-destructive border-destructive/30";
    }
  };

  const getStatusColor = () => {
    switch (analysis.status) {
      case "safe": return "text-success";
      case "suspicious": return "text-warning";
      case "danger": return "text-destructive";
    }
  };

  const getStatusIcon = () => {
    switch (analysis.status) {
      case "safe": return <CheckCircle className="w-6 h-6 text-success" />;
      case "suspicious": return <AlertTriangle className="w-6 h-6 text-warning" />;
      case "danger": return <AlertTriangle className="w-6 h-6 text-destructive" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              {getStatusIcon()}
              <span>Threat Analysis Report</span>
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <FileAudio className="w-4 h-4" />
                  <span className="font-mono">{analysis.filename}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(analysis.created_at).toLocaleString()}</span>
                </div>
              </div>
              
              <RiskGauge score={analysis.risk_score} size="md" />
            </div>

            {/* AI Summary */}
            <div className="cyber-card">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                AI Analysis Summary
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.ai_summary}
              </p>
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">AI Voice:</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-mono",
                    analysis.is_ai_generated 
                      ? "bg-destructive/20 text-destructive" 
                      : "bg-success/20 text-success"
                  )}>
                    {analysis.is_ai_generated ? "Detected" : "Not Detected"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <span className="font-mono text-sm">
                    {Math.round((analysis.confidence_score || 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Threats Breakdown */}
            {analysis.threats && analysis.threats.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Detected Threats ({analysis.threats.length})
                </h3>
                
                <div className="space-y-3">
                  {analysis.threats.map((threat) => (
                    <div 
                      key={threat.id}
                      className={cn(
                        "rounded-lg border p-4",
                        getSeverityColor(threat.severity)
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-medium">{threat.threat_type}</h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-mono uppercase",
                          threat.severity === "high" ? "bg-destructive/30" : "bg-warning/30"
                        )}>
                          {threat.severity}
                        </span>
                      </div>
                      
                      <p className="text-sm opacity-90 mb-3">
                        {threat.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>{threat.recommendation}</span>
                        </div>
                        <span className="font-mono opacity-70">
                          {Math.round((threat.confidence || 0) * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transcription */}
            <div className="space-y-2">
              <h3 className="font-semibold">Full Transcription</h3>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm leading-relaxed max-h-48 overflow-y-auto">
                {analysis.transcription}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete?.(analysis.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              
              <Button 
                variant="cyber" 
                size="sm"
                onClick={() => onExport?.(analysis)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
