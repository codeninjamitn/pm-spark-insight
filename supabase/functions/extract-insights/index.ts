import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceIds } = await req.json();
    
    if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
      return new Response(JSON.stringify({ error: "sourceIds array is required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch sources
    const { data: sources, error: sourcesError } = await supabase
      .from("sources")
      .select("*")
      .in("id", sourceIds);

    if (sourcesError) {
      console.error("Error fetching sources:", sourcesError);
      return new Response(JSON.stringify({ error: "Failed to fetch sources" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!sources || sources.length === 0) {
      return new Response(JSON.stringify({ error: "No sources found" }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build prompt from sources
    const sourceTexts = sources.map((s: any, i: number) => 
      `Source ${i + 1}: "${s.title}" (${s.type}, by ${s.author || 'Unknown'}, ${s.date})\nSnippet: ${s.snippet || 'No snippet available'}`
    ).join("\n\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a product intelligence analyst. Given source documents, extract actionable product insights.
For each insight, provide:
- title: concise insight title
- summary: 2-3 sentence explanation with specific data points
- category: one of "Design Feedback", "Feature Requests", "Competitive Intel", "Churn Risks", "Future Releases"
- priority: "high", "medium", or "low"
- tags: array of 2-4 relevant tags
- source_indices: array of 0-based indices of sources that support this insight

Return insights as JSON array.`
          },
          {
            role: "user",
            content: `Analyze these ${sources.length} source(s) and extract product insights:\n\n${sourceTexts}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_insights",
            description: "Return extracted product insights from the analyzed sources",
            parameters: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      summary: { type: "string" },
                      category: { type: "string", enum: ["Design Feedback", "Feature Requests", "Competitive Intel", "Churn Risks", "Future Releases"] },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                      tags: { type: "array", items: { type: "string" } },
                      source_indices: { type: "array", items: { type: "number" } }
                    },
                    required: ["title", "summary", "category", "priority", "tags", "source_indices"],
                    additionalProperties: false
                  }
                }
              },
              required: ["insights"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_insights" } }
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "AI did not return structured insights" }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { insights: extractedInsights } = JSON.parse(toolCall.function.arguments);

    // Save insights to database
    const savedInsights = [];
    for (const ei of extractedInsights) {
      const { data: insight, error: insightError } = await supabase
        .from("insights")
        .insert({
          title: ei.title,
          summary: ei.summary,
          category: ei.category,
          priority: ei.priority,
          tags: ei.tags,
          validated: false,
        })
        .select()
        .single();

      if (insightError) {
        console.error("Error saving insight:", insightError);
        continue;
      }

      // Link sources
      const sourceLinks = (ei.source_indices || [])
        .filter((idx: number) => idx >= 0 && idx < sources.length)
        .map((idx: number) => ({
          insight_id: insight.id,
          source_id: sources[idx].id,
        }));

      if (sourceLinks.length > 0) {
        await supabase.from("insight_sources").insert(sourceLinks);
      }

      savedInsights.push({ ...insight, sources: sourceLinks.map((sl: any) => sources.find((s: any) => s.id === sl.source_id)) });
    }

    return new Response(JSON.stringify({ insights: savedInsights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error("extract-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
