import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple hash function for cache keys
async function hashKey(text: string, voiceId: string): Promise<string> {
  const data = new TextEncoder().encode(text + "|" + voiceId);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      return new Response("ElevenLabs API key not configured", { status: 500, headers: corsHeaders });
    }

    const { text, voiceId } = await req.json();
    if (!text) {
      return new Response("Missing text", { status: 400, headers: corsHeaders });
    }

    const voice = voiceId || "JBFqnCBsd6RMkjVDRZzb";
    const cacheKey = await hashKey(text, voice);
    const filePath = `${cacheKey}.mp3`;

    // Init Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache
    const { data: existing } = await supabase.storage
      .from("tts-cache")
      .download(filePath);

    if (existing && existing.size > 100) {
      console.log("Cache HIT:", filePath);
      const arrayBuffer = await existing.arrayBuffer();
      return new Response(arrayBuffer, {
        headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
      });
    }

    console.log("Cache MISS:", filePath);

    // Call ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.substring(0, 5000),
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs error:", err);
      return new Response(err, { status: response.status, headers: corsHeaders });
    }

    const audioBuffer = await response.arrayBuffer();

    // Upload to cache (fire and forget - don't block response)
    supabase.storage
      .from("tts-cache")
      .upload(filePath, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      })
      .then(({ error }) => {
        if (error) console.error("Cache upload error:", error.message);
        else console.log("Cached:", filePath);
      });

    return new Response(audioBuffer, {
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
