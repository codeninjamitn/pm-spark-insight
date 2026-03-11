import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type DbSource = Tables<"sources">;
export type DbInsight = Tables<"insights"> & { sources?: DbSource[] };

export async function fetchSources(): Promise<DbSource[]> {
  const { data, error } = await supabase.from("sources").select("*").order("created_at", { ascending: false });
  if (error) { toast.error("Failed to load sources"); throw error; }
  return data || [];
}

export async function fetchInsights(): Promise<DbInsight[]> {
  const { data: insights, error } = await supabase
    .from("insights")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { toast.error("Failed to load insights"); throw error; }

  // Fetch source links
  const { data: links } = await supabase.from("insight_sources").select("*");
  const { data: sources } = await supabase.from("sources").select("*");

  return (insights || []).map((insight) => {
    const sourceIds = (links || []).filter(l => l.insight_id === insight.id).map(l => l.source_id);
    return {
      ...insight,
      sources: (sources || []).filter(s => sourceIds.includes(s.id)),
    };
  });
}

export async function uploadFileAndCreateSource(
  file: File,
  sourceType: string
): Promise<DbSource> {
  const filePath = `${Date.now()}-${file.name}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file);

  if (uploadError) {
    toast.error(`Failed to upload ${file.name}`);
    throw uploadError;
  }

  // Read file content for snippet
  let snippet = "";
  try {
    const text = await file.text();
    snippet = text.slice(0, 500);
  } catch {
    snippet = `[Binary file: ${file.name}]`;
  }

  // Create source record
  const { data, error } = await supabase
    .from("sources")
    .insert({
      title: file.name,
      type: sourceType as any,
      snippet,
      file_path: filePath,
    })
    .select()
    .single();

  if (error) {
    toast.error(`Failed to save source record for ${file.name}`);
    throw error;
  }

  return data;
}

export async function extractInsightsFromSources(sourceIds: string[]): Promise<DbInsight[]> {
  const { data, error } = await supabase.functions.invoke("extract-insights", {
    body: { sourceIds },
  });

  if (error) {
    toast.error("AI insight extraction failed");
    throw error;
  }

  if (data?.error) {
    toast.error(data.error);
    throw new Error(data.error);
  }

  return data.insights || [];
}

export async function createSourceFromUrl(
  url: string,
  sourceType: string
): Promise<DbSource> {
  // Scrape URL via edge function
  const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke("scrape-url", {
    body: { url },
  });

  if (scrapeError) {
    toast.error(`Failed to scrape URL`);
    throw scrapeError;
  }

  if (scrapeData?.error) {
    toast.error(scrapeData.error);
    throw new Error(scrapeData.error);
  }

  // Check if scraped content is too thin (JS-rendered pages like Google Maps)
  if (!scrapeData.snippet || scrapeData.snippet.length < 200) {
    throw new Error("INSUFFICIENT_CONTENT");
  }

  // Create source record
  const { data, error } = await supabase
    .from("sources")
    .insert({
      title: scrapeData.title || url,
      type: sourceType as any,
      snippet: scrapeData.snippet,
      file_path: null,
      author: new URL(url.startsWith('http') ? url : `https://${url}`).hostname,
    })
    .select()
    .single();

  if (error) {
    toast.error("Failed to save URL source");
    throw error;
  }

  return data;
}

export async function toggleInsightValidation(insightId: string, validated: boolean) {
  const { error } = await supabase
    .from("insights")
    .update({ validated })
    .eq("id", insightId);

  if (error) {
    toast.error("Failed to update validation");
    throw error;
  }
}
