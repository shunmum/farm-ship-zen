-- Create work_logs table for storing daily work logs
CREATE TABLE public.work_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  log_date DATE NOT NULL,
  field TEXT NOT NULL,
  work_details TEXT NOT NULL,
  photo_url TEXT,
  harvest_items TEXT,
  materials_used TEXT,
  input_type TEXT NOT NULL CHECK (input_type IN ('manual', 'ai_chat')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own work logs"
ON public.work_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own work logs"
ON public.work_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work logs"
ON public.work_logs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work logs"
ON public.work_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_work_logs_updated_at
BEFORE UPDATE ON public.work_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();