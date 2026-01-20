import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { RiskGauge } from "./RiskGauge";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { Radio, StopCircle, AlertTriangle, Shield } from "lucide-react";

interface LiveAnalysis {
  riskScore: number;
  status: "safe" | "suspicious" | "danger";
  threats: string[];
}

interface LiveMonitoringPanelProps {
  isMonitoring: boolean;
  transcription: string;
  liveAnalysis: LiveAnalysis | null;
  isAnalyzing: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const LiveMonitoringPanel = ({
  isMonitoring,
  transcription,
  liveAnalysis,
  isAnalyzing,
  onStart,
  onStop,
}: LiveMonitoringPanelProps) => {
  return (
    <div className="cyber-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Radio className={cn(
            "w-5 h-5",
            isMonitoring ? "text-success animate-pulse" : "text-muted-foreground"
          )} />
          Live Monitoring
        </h3>
        
        {isMonitoring ? (
          <Button variant="danger" size="sm" onClick={onStop}>
            <StopCircle className="w-4 h-4 mr-2" />
            Stop
          </Button>
        ) : (
          <Button variant="cyber" size="sm" onClick={onStart}>
            <Radio className="w-4 h-4 mr-2" />
            Start
          </Button>
        )}
      </div>

      {isMonitoring && (
        <>
          {/* Live Waveform */}
          <div className="bg-muted/30 rounded-lg p-4">
            <WaveformVisualizer isActive={isMonitoring} barCount={60} />
          </div>

          {/* Live Risk Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {liveAnalysis ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {liveAnalysis.status === "safe" ? (
                      <Shield className="w-5 h-5 text-success" />
                    ) : (
                      <AlertTriangle className={cn(
                        "w-5 h-5",
                        liveAnalysis.status === "danger" ? "text-destructive" : "text-warning"
                      )} />
                    )}
                    <span className={cn(
                      "font-medium capitalize",
                      liveAnalysis.status === "safe" ? "text-success" :
                      liveAnalysis.status === "danger" ? "text-destructive" : "text-warning"
                    )}>
                      {liveAnalysis.status}
                    </span>
                  </div>
                  
                  {liveAnalysis.threats.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {liveAnalysis.threats.map((threat, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded text-xs font-mono bg-destructive/20 text-destructive"
                        >
                          {threat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isAnalyzing ? "Analyzing..." : "Waiting for speech..."}
                </p>
              )}
            </div>

            {liveAnalysis && (
              <RiskGauge score={liveAnalysis.riskScore} size="sm" showLabel={false} />
            )}
          </div>

          {/* Live Transcription */}
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Live Transcription</p>
            <p className="text-sm font-mono leading-relaxed max-h-24 overflow-y-auto">
              {transcription || "Listening..."}
            </p>
          </div>
        </>
      )}

      {!isMonitoring && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Start live monitoring to analyze audio in real-time
        </p>
      )}
    </div>
  );
};
