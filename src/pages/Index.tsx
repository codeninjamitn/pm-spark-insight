import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AppSidebar from "@/components/AppSidebar";
import DashboardStats from "@/components/DashboardStats";
import InsightsFilters from "@/components/InsightsFilters";
import InsightCard from "@/components/InsightCard";
import InsightDetail from "@/components/InsightDetail";
import UploadPanel from "@/components/UploadPanel";
import SourcesView from "@/components/SourcesView";
import SettingsView from "@/components/SettingsView";
import { fetchInsights } from "@/lib/api";
import type { DbInsight } from "@/lib/api";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type InsightCategory = Database["public"]["Enums"]["insight_category"];
type InsightPriority = Database["public"]["Enums"]["insight_priority"];

const Index = () => {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedInsight, setSelectedInsight] = useState<DbInsight | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<InsightCategory | "All">("All");
  const [activePriority, setActivePriority] = useState<InsightPriority | "All">("All");

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: fetchInsights,
  });

  const filteredInsights = useMemo(() => {
    return insights.filter((i) => {
      if (activeCategory !== "All" && i.category !== activeCategory) return false;
      if (activePriority !== "All" && i.priority !== activePriority) return false;
      if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.summary.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [insights, search, activeCategory, activePriority]);

  const handleInsightsGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ["insights"] });
    queryClient.invalidateQueries({ queryKey: ["sources"] });
    setActiveView("insights");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar activeView={activeView} onViewChange={(v) => { setActiveView(v); setSelectedInsight(null); }} />

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === "dashboard" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-semibold font-display text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Overview of your product intelligence.</p>
              </div>
              <DashboardStats insights={insights} isLoading={isLoading} />
              <div>
                <h3 className="font-display text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Recent High-Priority Insights
                </h3>
                {isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                ) : insights.filter(i => i.priority === "high").length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No high-priority insights yet. Upload sources to get started.</p>
                ) : (
                  <div className="space-y-2">
                    {insights.filter((i) => i.priority === "high").map((insight) => (
                      <InsightCard
                        key={insight.id}
                        insight={insight}
                        onSelect={(i) => { setSelectedInsight(i); setActiveView("insights"); }}
                        isSelected={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === "insights" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h1 className="text-xl font-semibold font-display text-foreground">Insights</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredInsights.length} insight{filteredInsights.length !== 1 ? "s" : ""} from {insights.length} total
                </p>
              </div>
              <InsightsFilters
                search={search}
                onSearchChange={setSearch}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                activePriority={activePriority}
                onPriorityChange={setActivePriority}
              />
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="space-y-2">
                  {filteredInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onSelect={setSelectedInsight}
                      isSelected={selectedInsight?.id === insight.id}
                    />
                  ))}
                  {filteredInsights.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      {insights.length === 0 ? "No insights yet. Upload sources to generate insights." : "No insights match your filters."}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeView === "sources" && (
            <div className="animate-fade-in"><SourcesView /></div>
          )}

          {activeView === "upload" && (
            <div className="animate-fade-in">
              <UploadPanel onInsightsGenerated={handleInsightsGenerated} />
            </div>
          )}

          {activeView === "settings" && (
            <div className="animate-fade-in"><SettingsView /></div>
          )}
        </div>

        {activeView === "insights" && (
          <InsightDetail insight={selectedInsight} onClose={() => setSelectedInsight(null)} />
        )}
      </main>
    </div>
  );
};

export default Index;
