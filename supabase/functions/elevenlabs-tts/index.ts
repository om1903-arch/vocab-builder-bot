import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VOICE = "sage"; // calm, clear, steady

async function hashKey(text: string): Promise<string> {
  const data = new TextEncoder().encode(text + "|" + VOICE + "|gw-v1");
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI key not configured" }), { status: 500, headers: corsHeaders });
    }

    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Missing text" }), { status: 400, headers: corsHeaders });
    }
    const input = text.substring(0, 4000);
    const filePath = `${await hashKey(input)}.mp3`;

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: existing } = await supabase.storage.from("tts-cache").download(filePath);
    if (existing && existing.size > 100) {
      return new Response(await existing.arrayBuffer(), { headers: { ...corsHeaders, "Content-Type": "audio/mpeg" } });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        voice: VOICE,
        input,
        instructions: "Speak in a calm, warm, clear and steady tone, at a moderate pace suitable for English learners.",
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`TTS failed [${response.status}]: ${err}`);
      return new Response(JSON.stringify({ error: "TTS failed", status: response.status, details: err }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audio = await response.arrayBuffer();
    supabase.storage.from("tts-cache").upload(filePath, audio, { contentType: "audio/mpeg", upsert: true })
      .then(({ error }) => error && console.error("Cache upload error:", error.message));

    return new Response(audio, { headers: { ...corsHeaders, "Content-Type": "audio/mpeg" } });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
