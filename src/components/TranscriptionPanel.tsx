import { cn } from "@/lib/utils";
import { AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface Flag {
  text: string;
  severity: "low" | "medium" | "high";
  startIndex: number;
  endIndex: number;
}

interface TranscriptionPanelProps {
  transcription: string;
  flags: Flag[];
  isLoading?: boolean;
}

export const TranscriptionPanel = ({ 
  transcription, 
  flags, 
  isLoading = false 
}: TranscriptionPanelProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityColor = (severity: Flag["severity"]) => {
    switch (severity) {
      case "low": return "bg-warning/30 border-warning/50";
      case "medium": return "bg-warning/40 border-warning/60";
      case "high": return "bg-destructive/30 border-destructive/50";
    }
  };

  // Highlight flagged sections in the transcription
  const renderHighlightedText = () => {
    if (!transcription || flags.length === 0) {
      return <span>{transcription || "No transcription available"}</span>;
    }

    const sortedFlags = [...flags].sort((a, b) => a.startIndex - b.startIndex);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedFlags.forEach((flag, i) => {
      // Add normal text before the flag
      if (flag.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>
            {transcription.slice(lastIndex, flag.startIndex)}
          </span>
        );
      }

      // Add highlighted text
      parts.push(
        <span
          key={`flag-${i}`}
          className={cn(
            "px-1 py-0.5 rounded border relative group cursor-help",
            getSeverityColor(flag.severity)
          )}
          title={flag.text}
        >
          {transcription.slice(flag.startIndex, flag.endIndex)}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {flag.text}
          </span>
        </span>
      );

      lastIndex = flag.endIndex;
    });

    // Add remaining text
    if (lastIndex < transcription.length) {
      parts.push(
        <span key="text-end">{transcription.slice(lastIndex)}</span>
      );
    }

    return parts;
  };

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          Transcription Analysis
          {flags.length > 0 && (
            <span className="flex items-center gap-1 text-sm text-warning">
              <AlertTriangle className="w-4 h-4" />
              {flags.length} flag{flags.length !== 1 ? "s" : ""}
            </span>
          )}
        </h3>
        
        <Button variant="ghost" size="sm" onClick={copyToClipboard}>
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className={cn(
        "bg-muted/50 rounded-lg p-4 font-mono text-sm leading-relaxed max-h-64 overflow-y-auto",
        isLoading && "animate-pulse"
      )}>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        ) : (
          renderHighlightedText()
        )}
      </div>

      {flags.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Detected Patterns</h4>
          <div className="flex flex-wrap gap-2">
            {flags.map((flag, i) => (
              <span
                key={i}
                className={cn(
                  "px-2 py-1 rounded-md text-xs font-mono",
                  flag.severity === "high" 
                    ? "bg-destructive/20 text-destructive" 
                    : "bg-warning/20 text-warning"
                )}
              >
                {flag.text}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
