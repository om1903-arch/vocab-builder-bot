
-- Create the tts-cache storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tts-cache', 'tts-cache', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read from the bucket
CREATE POLICY "Public read access for tts-cache"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tts-cache');

-- Allow service role (edge functions) to insert
CREATE POLICY "Service role insert for tts-cache"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'tts-cache');
