import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/Header";
import { StatsGrid } from "@/components/StatsGrid";
import { AudioUploader } from "@/components/AudioUploader";
import { RiskGauge } from "@/components/RiskGauge";
import { TranscriptionPanel } from "@/components/TranscriptionPanel";
import { AnalysisCard } from "@/components/AnalysisCard";
import { DetailedThreatView } from "@/components/DetailedThreatView";
import { LiveMonitoringPanel } from "@/components/LiveMonitoringPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Zap, Brain, Shield, Radio, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLiveMonitoring } from "@/hooks/useLiveMonitoring";
import { 
  processAudioFile, 
  saveAnalysis, 
  fetchAnalyses, 
  deleteAnalysis,
  getAnalyticsStats 
} from "@/lib/audioAnalysis";
import { exportToPdf, exportToCsv } from "@/lib/exportReport";

interface Threat {
  id: string;
  threat_type: string;
  description: string;
  severity: "low" | "medium" | "high";
  confidence: number;
  recommendation: string;
}

interface AnalysisResult {
  id: string;
  filename: string;
  file_path: string | null;
  transcription: string;
  risk_score: number;
  status: "safe" | "suspicious" | "danger";
  ai_summary: string;
  is_ai_generated: boolean;
  confidence_score: number;
  created_at: string;
  threats: Threat[];
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
    summary?: string;
    isAiGenerated?: boolean;
  } | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    threatDetected: 0,
    safeScans: 0,
    accuracyRate: 94,
  });

  const liveMonitoring = useLiveMonitoring();

  // Fetch history on mount
  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAnalyses();
      setHistory(data as AnalysisResult[]);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getAnalyticsStats();
      setStats({
        totalScans: data.totalScans,
        threatDetected: data.threatDetected,
        safeScans: data.safeScans,
        accuracyRate: 94, // Static for now
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    setCurrentAnalysis(null);

    try {
      // Process the audio file (transcribe + analyze)
      const { transcription, analysis } = await processAudioFile(file);

      // Convert threats to flags for the transcription panel
      const flags: Flag[] = analysis.threats.map((threat, i) => ({
        text: threat.threatType,
        severity: threat.severity,
        startIndex: i * 20,
        endIndex: i * 20 + 15,
      }));

      setCurrentAnalysis({
        riskScore: analysis.riskScore,
        transcription,
        flags,
        summary: analysis.summary,
        isAiGenerated: analysis.isAiGenerated,
      });

      // Save to database
      const analysisId = await saveAnalysis(file.name, null, transcription, analysis);

      // Reload history and stats
      await Promise.all([loadHistory(), loadStats()]);

      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Processing error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process audio");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleViewDetails = (result: AnalysisResult) => {
    setSelectedAnalysis(result);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnalysis(id);
      toast.success("Analysis deleted");
      setIsDetailOpen(false);
      await Promise.all([loadHistory(), loadStats()]);
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleExport = (analysis: AnalysisResult) => {
    exportToPdf(analysis as any);
    toast.success("Report exported");
  };

  const handleExportAll = () => {
    exportToCsv(history as any);
    toast.success("All analyses exported to CSV");
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

        {/* Main Content with Tabs */}
        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Quick Analysis
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Radio className="w-4 h-4" />
              Live Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="space-y-6">
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
                      <div className="text-center">
                        <RiskGauge score={currentAnalysis.riskScore} size="lg" />
                        {currentAnalysis.isAiGenerated && (
                          <p className="mt-4 text-sm text-destructive font-medium">
                            ⚠️ AI-Generated Voice Detected
                          </p>
                        )}
                      </div>
                    </div>

                    {currentAnalysis.summary && (
                      <div className="cyber-card">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-primary" />
                          AI Summary
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {currentAnalysis.summary}
                        </p>
                      </div>
                    )}

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
          </TabsContent>

          <TabsContent value="live">
            <div className="max-w-2xl mx-auto">
              <LiveMonitoringPanel
                isMonitoring={liveMonitoring.isMonitoring}
                transcription={liveMonitoring.transcription}
                liveAnalysis={liveMonitoring.liveAnalysis}
                isAnalyzing={liveMonitoring.isAnalyzing}
                onStart={liveMonitoring.startMonitoring}
                onStop={liveMonitoring.stopMonitoring}
              />

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Pro tip:</strong> For best results, ensure clear audio and minimize background noise.
                  Live monitoring analyzes speech patterns in real-time to detect potential threats.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* History Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Recent Analyses</h3>
              <span className="text-sm text-muted-foreground">({history.length})</span>
            </div>

            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExportAll}>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : history.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((result) => (
                <AnalysisCard 
                  key={result.id} 
                  result={{
                    id: result.id,
                    filename: result.filename,
                    timestamp: new Date(result.created_at),
                    riskScore: result.risk_score,
                    transcription: result.transcription,
                    flags: result.threats?.map(t => t.threat_type) || [],
                    status: result.status,
                  }}
                  onClick={() => handleViewDetails(result)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No analyses yet. Upload an audio file to get started.</p>
            </div>
          )}
        </div>
      </main>

      {/* Detailed View Dialog */}
      <DetailedThreatView
        analysis={selectedAnalysis as any}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDelete={handleDelete}
        onExport={handleExport}
      />

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-mono">
            Echo<span className="text-primary">Audit</span> • AI Voice Analysis System
          </p>
          <p className="mt-2">
            Powered by advanced AI. All analysis is performed securely.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
