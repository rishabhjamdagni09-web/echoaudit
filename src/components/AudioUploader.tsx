import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, Mic, StopCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const AudioUploader = ({ onFileSelect, isProcessing }: AudioUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(f => f.type.startsWith("audio/"));
    if (audioFile) {
      onFileSelect(audioFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
        onFileSelect(file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300",
          "flex flex-col items-center justify-center min-h-[200px]",
          isDragging 
            ? "border-primary bg-primary/5 cyber-glow" 
            : "border-border hover:border-primary/50",
          isProcessing && "pointer-events-none opacity-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Analyzing audio...</p>
            <WaveformVisualizer isActive={true} />
          </div>
        ) : isRecording ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-destructive animate-pulse" />
              </div>
            </div>
            <p className="text-destructive font-medium">Recording...</p>
            <WaveformVisualizer isActive={true} />
            <Button variant="danger" onClick={stopRecording}>
              <StopCircle className="w-4 h-4" />
              Stop Recording
            </Button>
          </div>
        ) : (
          <>
            <Upload className={cn(
              "w-12 h-12 mb-4 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
            <p className="text-lg font-medium mb-2">
              Drop audio file here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse • Supports MP3, WAV, WebM
            </p>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </>
        )}
      </div>

      {/* Record Button */}
      {!isProcessing && !isRecording && (
        <div className="flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      {!isProcessing && !isRecording && (
        <Button 
          variant="cyber" 
          size="lg" 
          className="w-full" 
          onClick={startRecording}
        >
          <Mic className="w-5 h-5" />
          Record Live Audio
        </Button>
      )}
    </div>
  );
};
