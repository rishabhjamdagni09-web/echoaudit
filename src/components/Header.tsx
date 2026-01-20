import { Shield, Radio } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center cyber-glow">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Echo<span className="text-primary">Audit</span>
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                AI Voice Analysis System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Radio className="w-4 h-4 text-success animate-pulse" />
            <span className="text-muted-foreground">System Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
