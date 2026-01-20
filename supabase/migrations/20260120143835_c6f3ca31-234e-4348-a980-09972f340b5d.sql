-- Create enum for analysis status
CREATE TYPE public.analysis_status AS ENUM ('safe', 'suspicious', 'danger');

-- Create enum for threat severity
CREATE TYPE public.threat_severity AS ENUM ('low', 'medium', 'high');

-- Create analyses table
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT,
  transcription TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  status analysis_status NOT NULL DEFAULT 'safe',
  duration_seconds REAL,
  audio_format TEXT,
  ai_summary TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  confidence_score REAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create threats table for detailed threat breakdown
CREATE TABLE public.threats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  threat_type TEXT NOT NULL,
  description TEXT,
  severity threat_severity NOT NULL DEFAULT 'medium',
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  start_index INTEGER,
  end_index INTEGER,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster threat lookups
CREATE INDEX idx_threats_analysis_id ON public.threats(analysis_id);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX idx_analyses_status ON public.analyses(status);

-- Enable Row Level Security (making data public for now since no auth required)
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threats ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access (no auth required for this tool)
CREATE POLICY "Anyone can view analyses" 
ON public.analyses 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create analyses" 
ON public.analyses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update analyses" 
ON public.analyses 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete analyses" 
ON public.analyses 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can view threats" 
ON public.threats 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create threats" 
ON public.threats 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_analyses_updated_at
BEFORE UPDATE ON public.analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-files', 'audio-files', true);

-- Storage policies for audio uploads
CREATE POLICY "Anyone can upload audio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'audio-files');

CREATE POLICY "Anyone can view audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio-files');

CREATE POLICY "Anyone can delete audio files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'audio-files');