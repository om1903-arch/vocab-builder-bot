CREATE TABLE public.daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_type text NOT NULL,
  target_count integer NOT NULL DEFAULT 1,
  current_count integer NOT NULL DEFAULT 0,
  xp_reward integer NOT NULL DEFAULT 10,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '1 day')
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own challenges" ON public.daily_challenges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" ON public.daily_challenges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON public.daily_challenges
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);