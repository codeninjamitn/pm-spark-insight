
-- Create source_type enum
CREATE TYPE public.source_type AS ENUM (
  'Customer Feedback',
  'Field Report',
  'Partner Insight',
  'Analyst Transcript',
  'Market Report'
);

-- Create insight_category enum
CREATE TYPE public.insight_category AS ENUM (
  'Design Feedback',
  'Feature Requests',
  'Competitive Intel',
  'Churn Risks',
  'Future Releases'
);

-- Create insight_priority enum
CREATE TYPE public.insight_priority AS ENUM ('high', 'medium', 'low');

-- Create sources table
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type source_type NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  snippet TEXT,
  author TEXT,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create insights table
CREATE TABLE public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category insight_category NOT NULL,
  priority insight_priority NOT NULL DEFAULT 'medium',
  validated BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for insights <-> sources
CREATE TABLE public.insight_sources (
  insight_id UUID NOT NULL REFERENCES public.insights(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  PRIMARY KEY (insight_id, source_id)
);

-- Enable RLS
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insight_sources ENABLE ROW LEVEL SECURITY;

-- For MVP: allow all authenticated and anonymous users to read/write
CREATE POLICY "Anyone can read sources" ON public.sources FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sources" ON public.sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read insights" ON public.insights FOR SELECT USING (true);
CREATE POLICY "Anyone can insert insights" ON public.insights FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update insights" ON public.insights FOR UPDATE USING (true);
CREATE POLICY "Anyone can read insight_sources" ON public.insight_sources FOR SELECT USING (true);
CREATE POLICY "Anyone can insert insight_sources" ON public.insight_sources FOR INSERT WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_insights_updated_at
  BEFORE UPDATE ON public.insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for uploaded documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Anyone can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can read documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');
