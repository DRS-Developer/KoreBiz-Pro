-- Create table for performance metrics
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  rating TEXT,
  path TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for performance metrics" 
ON public.performance_metrics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow admin read for performance metrics" 
ON public.performance_metrics FOR SELECT 
USING (auth.role() = 'authenticated');
