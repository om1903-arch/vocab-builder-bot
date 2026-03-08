

## Plan: TTS Audio Caching System

### Goal
Cache ElevenLabs TTS audio in Supabase Storage so the same text is never generated twice. Any user requesting the same text gets the cached version instantly.

### Architecture

```text
Client (AudioPlayer)
  │
  ├─ POST /elevenlabs-tts { text, voiceId }
  │
  └─► Edge Function
        │
        ├─ Generate cache key: hash(text + voiceId)
        ├─ Check Supabase Storage bucket "tts-cache" for existing file
        │   ├─ EXISTS → return cached audio (skip ElevenLabs)
        │   └─ NOT EXISTS → call ElevenLabs API
        │       ├─ Upload audio to Storage bucket
        │       └─ Return audio to client
```

### Steps

1. **Create Supabase Storage bucket `tts-cache`**
   - Public bucket (so files can be served via direct URL)
   - No RLS needed since audio is non-sensitive shared content

2. **Update `elevenlabs-tts` Edge Function**
   - Generate a deterministic cache key from `text + voiceId` using a simple hash
   - Use Supabase service role client to check if file exists in `tts-cache/{hash}.mp3`
   - If found: fetch the public URL and return audio from storage
   - If not found: call ElevenLabs, upload result to storage, then return audio
   - This is transparent to the client -- no client-side changes needed

3. **No client changes required** -- `AudioPlayer.tsx` already calls the edge function and receives binary audio. The caching is fully server-side.

### Database Migration
- Create the `tts-cache` storage bucket via SQL migration

### Files Changed
- `supabase/functions/elevenlabs-tts/index.ts` -- add cache check/store logic
- Migration SQL -- create storage bucket + public access policy

