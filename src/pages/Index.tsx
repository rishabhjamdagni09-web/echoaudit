import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { StatsGrid } from "@/components/StatsGrid";
import { AudioUploader } from "@/components/AudioUploader";
import { RiskGauge } from "@/components/RiskGauge";
import { TranscriptionPanel } from "@/components/TranscriptionPanel";
import { AnalysisCard } from "@/components/AnalysisCard";
import { Button } from "@/components/ui/button";
import { History, Zap, Brain, Shield } from "lucide-react";

interface AnalysisResult {
  id: string;
  filename: string;
  timestamp: Date;
  riskScore: number;
  transcription: string;
  flags: string[];
  status: "safe" | "suspicious" | "danger";
}

interface Flag {
  text: string;
  severity: "low" | "medium" | "high";
  startIndex: number;
  endIndex: number;
}

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    riskScore: number;
    transcription: string;
    flags: Flag[];
  } | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([
    {
      id: "demo-1",
      filename: "call_recording_01.mp3",
      timestamp: new Date(Date.now() - 3600000),
      riskScore: 78,
      transcription: "Hello, this is your bank calling. We've detected suspicious activity on your account and need to verify your identity immediately...",
      flags: ["Urgency Pressure", "Authority Claim", "Identity Request"],
      status: "danger",
    },
    {
      id: "demo-2",
      filename: "voicemail_02.wav",
      timestamp: new Date(Date.now() - 7200000),
      riskScore: 12,
      transcription: "Hey, just calling to confirm our meeting tomorrow at 3pm. Let me know if that still works for you.",
      flags: [],
      status: "safe",
    },
    {
      id: "demo-3",
      filename: "support_call.webm",
      timestamp: new Date(Date.now() - 10800000),
      riskScore: 45,
      transcription: "Congratulations! You've been selected for a special offer. Act now to claim your exclusive prize...",
      flags: ["Prize Claim", "Time Pressure"],
      status: "suspicious",
    },
  ]);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    setCurrentAnalysis(null);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock analysis result
    const mockTranscription = "This is a simulated transcription of the uploaded audio file. In a real implementation, this would be processed by Whisper AI to transcribe the speech, and then analyzed for potential scam indicators like urgency language, authority claims, or requests for sensitive information.";
    
    const mockFlags: Flag[] = [
      { text: "Potential AI-generated voice", severity: "medium", startIndex: 0, endIndex: 4 },
      { text: "Urgency language detected", severity: "high", startIndex: 100, endIndex: 108 },
    ];
    
    const riskScore = Math.floor(Math.random() * 60) + 20;
    
    setCurrentAnalysis({
      riskScore,
      transcription: mockTranscription,
      flags: mockFlags,
    });

    // Add to history
    const newResult: AnalysisResult = {
      id: crypto.randomUUID(),
      filename: file.name,
      timestamp: new Date(),
      riskScore,
      transcription: mockTranscription,
      flags: mockFlags.map(f => f.text),
      status: riskScore < 30 ? "safe" : riskScore < 70 ? "suspicious" : "danger",
    };
    
    setHistory(prev => [newResult, ...prev]);
    setIsProcessing(false);
  }, []);

  const stats = {
    totalScans: history.length,
    threatDetected: history.filter(h => h.status === "danger").length,
    safeScans: history.filter(h => h.status === "safe").length,
    accuracyRate: 94,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Detect AI-Generated Voices & <span className="text-primary">Scam Calls</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Advanced audio analysis powered by machine learning. Upload recordings or capture live audio to detect deepfakes, synthetic voices, and fraudulent patterns.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <StatsGrid {...stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Quick Analysis</h3>
            </div>
            <AudioUploader 
              onFileSelect={handleFileSelect} 
              isProcessing={isProcessing} 
            />

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="cyber-card p-4">
                <Brain className="w-8 h-8 text-primary mb-2" />
                <h4 className="font-medium text-sm">AI Detection</h4>
                <p className="text-xs text-muted-foreground">
                  Identifies synthetic voices and deepfakes
                </p>
              </div>
              <div className="cyber-card p-4">
                <Shield className="w-8 h-8 text-success mb-2" />
                <h4 className="font-medium text-sm">Scam Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  Detects manipulation patterns
                </p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {currentAnalysis ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Analysis Result</h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentAnalysis(null)}>
                    Clear
                  </Button>
                </div>
                
                <div className="cyber-card flex items-center justify-center py-8">
                  <RiskGauge score={currentAnalysis.riskScore} size="lg" />
                </div>

                <TranscriptionPanel
                  transcription={currentAnalysis.transcription}
                  flags={currentAnalysis.flags}
                />
              </>
            ) : (
              <div className="cyber-card flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Shield className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Upload an audio file or record live audio to begin the analysis process.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Recent Analyses</h3>
            <span className="text-sm text-muted-foreground">({history.length})</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((result) => (
              <AnalysisCard 
                key={result.id} 
                result={result}
                onClick={() => {
                  setCurrentAnalysis({
                    riskScore: result.riskScore,
                    transcription: result.transcription,
                    flags: result.flags.map((f, i) => ({
                      text: f,
                      severity: result.status === "danger" ? "high" : "medium" as const,
                      startIndex: i * 10,
                      endIndex: i * 10 + 5,
                    })),
                  });
                }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-mono">
            Echo<span className="text-primary">Audit</span> • AI Voice Analysis System
          </p>
          <p className="mt-2">
            All audio is processed locally. No data is stored after analysis.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
