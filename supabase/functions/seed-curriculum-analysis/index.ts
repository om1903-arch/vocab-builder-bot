import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const { faculty_id } = await req.json();
    if (!faculty_id) throw new Error("faculty_id is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { data: faculty, error: facultyError } = await supabase
      .from("faculties")
      .select("*")
      .eq("id", faculty_id)
      .single();

    if (facultyError || !faculty) {
      return new Response(JSON.stringify({ error: "Faculty not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!faculty.structure || !Array.isArray(faculty.structure)) {
       return new Response(JSON.stringify({ error: "Faculty has no structure" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let existingAnalysis = faculty.curriculum_analysis || {};
    if (typeof existingAnalysis !== 'object') existingAnalysis = {};

    let hasChanges = false;
    let newAnalysis: Record<string, any> = { ...existingAnalysis };

    const structure = faculty.structure as any[];

    for (const department of structure) {
      const deptName = department.department_en || department.name_en || "General Department";
      if (!newAnalysis[deptName]) {
        newAnalysis[deptName] = {};
      }

      const subjects = department.subjects || [];
      for (const subjectObj of subjects) {
        const subjectName = subjectObj.subject_en || subjectObj.name_en;
        if (!subjectName) continue;

        // Skip if already analyzed
        if (newAnalysis[deptName][subjectName]) continue;

        console.log(`Analyzing: ${deptName} - ${subjectName}`);

        try {
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
                  content: "You are an academic curriculum expert. Return ONLY valid JSON, no markdown.",
                },
                {
                  role: "user",
                  content: `Analyze the academic subject "${subjectName}" in the "${deptName}" department for a student in "${faculty.name_en}".

Return ONLY valid JSON with this exact structure:
{
  "overview": "Brief description of the subject (1-2 sentences)",
  "core_concepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5"],
  "typical_topics": ["topic 1", "topic 2", "topic 3"],
  "key_terminology": ["term 1", "term 2", "term 3", "term 4", "term 5"],
  "learning_outcomes": ["outcome 1", "outcome 2"],
  "academic_depth": "How this subject builds on other topics and its importance in the field (1 sentence)",
  "suggested_references": ["Book or Paper 1", "Course or Website 2", "Reference 3"]
}`,
                },
              ],
              temperature: 0.7,
            }),
          });

          if (!response.ok) {
            console.error("AI error for", subjectName, response.status);
            continue; // Skip and continue
          }

          const data = await response.json();
          const raw = data.choices?.[0]?.message?.content;
          const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleaned);

          newAnalysis[deptName][subjectName] = parsed;
          hasChanges = true;
          
        } catch (e) {
          console.error("Failed to analyze", subjectName, e);
        }
      }
    }

    if (hasChanges) {
      const { error: updateError } = await supabase
        .from("faculties")
        .update({ curriculum_analysis: newAnalysis })
        .eq("id", faculty_id);

      if (updateError) {
        throw new Error(`Failed to update DB: ${updateError.message}`);
      }
    }

    return new Response(JSON.stringify({ success: true, analysis: newAnalysis, updated: hasChanges }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed-curriculum-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
