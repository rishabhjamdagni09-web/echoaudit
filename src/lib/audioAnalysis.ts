import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisResult {
  riskScore: number;
  status: "safe" | "suspicious" | "danger";
  isAiGenerated: boolean;
  confidenceScore: number;
  summary: string;
  threats: Array<{
    threatType: string;
    description: string;
    severity: "low" | "medium" | "high";
    confidence: number;
    recommendation: string;
  }>;
}

export async function transcribeAudio(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("audio", file);

  const { data, error } = await supabase.functions.invoke("transcribe-audio", {
    body: formData,
  });

  if (error) {
    console.error("Transcription error:", error);
    throw new Error(error.message || "Failed to transcribe audio");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data.transcription;
}

export async function analyzeTranscription(
  transcription: string,
  type: "analyze" | "live" = "analyze"
): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-audio", {
    body: { transcription, type },
  });

  if (error) {
    console.error("Analysis error:", error);
    throw new Error(error.message || "Failed to analyze audio");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as AnalysisResult;
}

export async function processAudioFile(file: File): Promise<{
  transcription: string;
  analysis: AnalysisResult;
}> {
  // Step 1: Transcribe
  toast.info("Transcribing audio...");
  const transcription = await transcribeAudio(file);

  // Step 2: Analyze
  toast.info("Analyzing for threats...");
  const analysis = await analyzeTranscription(transcription);

  return { transcription, analysis };
}

export async function uploadAudioFile(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from("audio-files")
    .upload(fileName, file);

  if (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload audio file");
  }

  return data.path;
}

export async function saveAnalysis(
  filename: string,
  filePath: string | null,
  transcription: string,
  analysis: AnalysisResult
): Promise<string> {
  // Insert the main analysis
  const { data: analysisData, error: analysisError } = await supabase
    .from("analyses")
    .insert({
      filename,
      file_path: filePath,
      transcription,
      risk_score: analysis.riskScore,
      status: analysis.status,
      ai_summary: analysis.summary,
      is_ai_generated: analysis.isAiGenerated,
      confidence_score: analysis.confidenceScore,
    })
    .select()
    .single();

  if (analysisError) {
    console.error("Save analysis error:", analysisError);
    throw new Error("Failed to save analysis");
  }

  // Insert threats
  if (analysis.threats && analysis.threats.length > 0) {
    const threats = analysis.threats.map((threat) => ({
      analysis_id: analysisData.id,
      threat_type: threat.threatType,
      description: threat.description,
      severity: threat.severity,
      confidence: threat.confidence,
      recommendation: threat.recommendation,
    }));

    const { error: threatsError } = await supabase.from("threats").insert(threats);

    if (threatsError) {
      console.error("Save threats error:", threatsError);
      // Don't throw here, analysis was saved successfully
    }
  }

  return analysisData.id;
}

export async function fetchAnalyses(limit = 50) {
  const { data, error } = await supabase
    .from("analyses")
    .select(`
      *,
      threats (*)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Fetch analyses error:", error);
    throw new Error("Failed to fetch analyses");
  }

  return data;
}

export async function fetchAnalysisById(id: string) {
  const { data, error } = await supabase
    .from("analyses")
    .select(`
      *,
      threats (*)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Fetch analysis error:", error);
    throw new Error("Failed to fetch analysis");
  }

  return data;
}

export async function deleteAnalysis(id: string) {
  const { error } = await supabase.from("analyses").delete().eq("id", id);

  if (error) {
    console.error("Delete analysis error:", error);
    throw new Error("Failed to delete analysis");
  }
}

export async function getAnalyticsStats() {
  const { data, error } = await supabase
    .from("analyses")
    .select("status, risk_score");

  if (error) {
    console.error("Stats error:", error);
    return { totalScans: 0, threatDetected: 0, safeScans: 0, avgRiskScore: 0 };
  }

  const totalScans = data.length;
  const threatDetected = data.filter((a) => a.status === "danger").length;
  const safeScans = data.filter((a) => a.status === "safe").length;
  const avgRiskScore = totalScans > 0 
    ? Math.round(data.reduce((acc, a) => acc + a.risk_score, 0) / totalScans) 
    : 0;

  return { totalScans, threatDetected, safeScans, avgRiskScore };
}
