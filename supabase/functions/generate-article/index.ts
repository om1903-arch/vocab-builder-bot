import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const levelDescriptions: Record<string, string> = {
  beginner: "A1 level, very simple vocabulary and short sentences, present tense only",
  elementary: "A2 level, simple vocabulary, basic past and future tenses, short paragraphs",
  intermediate: "B1 level, moderate vocabulary, varied tenses, compound sentences",
  upper_intermediate: "B2 level, rich vocabulary, complex sentences, idiomatic expressions",
  advanced: "C1 level, sophisticated vocabulary, nuanced arguments, academic style",
};

const categoryNames: Record<string, string> = {
  technology: "Technology & Innovation",
  science: "Science & Discovery",
  sport: "Sports & Fitness",
  culture: "Culture & Society",
  health: "Health & Wellness",
  business: "Business & Economy",
  travel: "Travel & Geography",
  history: "History & Civilizations",
  environment: "Environment & Nature",
  food: "Food & Cooking",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { category, level } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const levelDesc = levelDescriptions[level] || levelDescriptions.intermediate;
    const catName = categoryNames[category] || category;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are an English language teaching content creator. Generate educational articles for English learners. Always respond with valid JSON only, no markdown.",
          },
          {
            role: "user",
            content: `Generate an educational English article about ${catName} for a student at ${levelDesc}.

The article should be engaging, informative, and about a current/interesting topic in this field.

Return ONLY valid JSON with this structure:
{
  "title": "Article title in English",
  "content": "The full article text, 200-400 words depending on level. Use paragraphs separated by \\n\\n.",
  "key_words": ["word1", "word2", "word3", "word4", "word5"]
}

The key_words should be 5-8 important vocabulary words from the article that the student should learn.`,
          },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-article error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
