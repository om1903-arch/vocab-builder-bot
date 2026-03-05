
-- Add UPDATE policy on dictionary for flashcard reviews
CREATE POLICY "Users can update own dictionary"
ON public.dictionary
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
