import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, scenario } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "You are a helpful AI assistant.";
    if (scenario === "interview") {
      systemPrompt = "You are an interviewer conducting a professional job interview. Ask one question at a time, wait for the user's response, and evaluate their answer professionally. Keep it conversational and realistic.";
    } else if (scenario === "thesis") {
      systemPrompt = "You are a university professor examining a student during their thesis defense. Ask challenging questions about their methodology and findings. Wait for their response and challenge them further.";
    } else if (scenario === "medical") {
      systemPrompt = "You are a patient visiting a doctor (the user). Describe your symptoms realistically and answer the doctor's questions. Keep your responses concise.";
    } else if (scenario === "airport") {
      systemPrompt = "You are an immigration officer at an airport. Ask the user (traveler) questions about their passport, destination, and purpose of travel. Be formal.";
    } else if (scenario === "restaurant") {
      systemPrompt = "You are a waiter at a restaurant. Take the user's order, ask about preferences, and engage in standard restaurant conversation. Be polite.";
    } else if (scenario === "hotel") {
      systemPrompt = "You are a hotel receptionist. Help the user check in, ask for their reservation details, and explain hotel amenities. Be welcoming.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `AI Gateway Error: ${errorText}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
