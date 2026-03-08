import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const levelDescriptions: Record<string, string> = {
  beginner: "A1-A2 level, foundational academic vocabulary with simple explanations",
  elementary: "A2-B1 level, basic academic terminology with clear definitions",
  intermediate: "B1-B2 level, moderate academic vocabulary with field-specific context",
  upper_intermediate: "B2-C1 level, advanced terminology with nuanced explanations",
  advanced: "C1 level, sophisticated academic language with complex concepts",
  proficient: "C2 level, expert-level terminology with abstract and theoretical discussions",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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

    const { faculty_id, level, topic, department, subject, pdf_terms } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Fetch faculty details
    const { data: faculty, error: facultyError } = await supabase
      .from("faculties")
      .select("*")
      .eq("id", faculty_id)
      .single();

    if (facultyError || !faculty) {
      return new Response(JSON.stringify({ error: "Faculty not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const levelDesc = levelDescriptions[level] || levelDescriptions.intermediate;
    const keyTopics = faculty.key_topics?.join(", ") || "";
    
    let topicContext = topic ? `Focus specifically on: ${topic}.` : "";
    if (department) topicContext += `\nDepartment: ${department}`;
    if (subject) topicContext += `\nSubject: ${subject}`;
    if (pdf_terms && pdf_terms.length > 0) {
      topicContext += `\nCRITICAL: Incorporate these terms extracted from the student's curriculum PDF: ${pdf_terms.join(", ")}`;
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
          {
            role: "system",
            content: `You are an academic English content creator specializing in ${faculty.name_en}. Generate educational articles with formal academic register, field-specific terminology, and proper scholarly structure. Always respond with valid JSON only, no markdown.`,
          },
          {
            role: "user",
            content: `Generate an academic English article for a ${faculty.name_en} student at ${levelDesc}.

Field description: ${faculty.description}
Core curriculum topics: ${keyTopics}
${topicContext}

Requirements:
1. Use formal academic register throughout
2. Include field-specific terminology naturally in context
3. Structure with clear introduction, body paragraphs, and conclusion
4. Make content educational and relevant to ${faculty.name_en} studies
5. Include 8-12 key academic terms the student should learn

Return ONLY valid JSON with this structure:
{
  "title": "Academic article title in English",
  "content": "The full article text, 300-500 words. Use paragraphs separated by \\n\\n. Include proper academic structure.",
  "key_words": ["term1", "term2", "term3", "term4", "term5", "term6", "term7", "term8"]
}

The key_words should be 8-12 important academic/field-specific vocabulary words from the article.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-academic-article error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
