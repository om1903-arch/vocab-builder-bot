-- Add spaced repetition columns to dictionary table
ALTER TABLE public.dictionary 
ADD COLUMN IF NOT EXISTS next_review timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ease_factor numeric DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS interval_days integer DEFAULT 0;