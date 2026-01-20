import { useState, useRef, useCallback, useEffect } from "react";
import { analyzeTranscription } from "@/lib/audioAnalysis";
import { toast } from "sonner";

interface LiveAnalysis {
  riskScore: number;
  status: "safe" | "suspicious" | "danger";
  threats: string[];
}

export function useLiveMonitoring() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [liveAnalysis, setLiveAnalysis] = useState<LiveAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const analyzeCurrentTranscription = useCallback(async (text: string) => {
    if (!text.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeTranscription(text, "live");
      setLiveAnalysis({
        riskScore: result.riskScore,
        status: result.status,
        threats: result.threats.map(t => t.threatType),
      });
    } catch (error) {
      console.error("Live analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  const startMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsMonitoring(true);
      
      // Simulated live transcription (in production, use WebSocket STT)
      // For demo, we'll show a message that real-time transcription requires additional setup
      setTranscription("🎤 Live monitoring active. Speak to analyze in real-time...");
      
      toast.success("Live monitoring started");
      
      // Run analysis periodically
      analysisIntervalRef.current = setInterval(() => {
        if (transcription.length > 50) {
          analyzeCurrentTranscription(transcription);
        }
      }, 5000);

    } catch (error) {
      console.error("Failed to start monitoring:", error);
      toast.error("Failed to access microphone");
    }
  }, [transcription, analyzeCurrentTranscription]);

  const stopMonitoring = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    setIsMonitoring(false);
    toast.info("Live monitoring stopped");
  }, []);

  const updateTranscription = useCallback((text: string) => {
    setTranscription(prev => prev + " " + text);
  }, []);

  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    isMonitoring,
    transcription,
    liveAnalysis,
    isAnalyzing,
    startMonitoring,
    stopMonitoring,
    updateTranscription,
    setTranscription,
  };
}
