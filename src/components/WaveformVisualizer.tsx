import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface WaveformVisualizerProps {
  isActive?: boolean;
  barCount?: number;
  className?: string;
}

export const WaveformVisualizer = ({ 
  isActive = false, 
  barCount = 40,
  className 
}: WaveformVisualizerProps) => {
  const [heights, setHeights] = useState<number[]>(Array(barCount).fill(20));

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(barCount).fill(20));
      return;
    }

    const interval = setInterval(() => {
      setHeights(prev => prev.map(() => Math.random() * 80 + 20));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return (
    <div className={cn("flex items-center justify-center gap-[2px] h-16", className)}>
      {heights.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-100",
            isActive ? "bg-primary" : "bg-muted-foreground/30"
          )}
          style={{ 
            height: `${height}%`,
            opacity: isActive ? 0.6 + Math.random() * 0.4 : 0.3,
          }}
        />
      ))}
    </div>
  );
};
