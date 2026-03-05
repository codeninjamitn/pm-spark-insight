import { useState, useMemo } from "react";
import AppSidebar from "@/components/AppSidebar";
import DashboardStats from "@/components/DashboardStats";
import InsightsFilters from "@/components/InsightsFilters";
import InsightCard from "@/components/InsightCard";
import InsightDetail from "@/components/InsightDetail";
import UploadPanel from "@/components/UploadPanel";
import SourcesView from "@/components/SourcesView";
import { mockInsights } from "@/lib/mockData";
import type { Insight, InsightCategory, InsightPriority } from "@/lib/mockData";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<InsightCategory | "All">("All");
  const [activePriority, setActivePriority] = useState<InsightPriority | "All">("All");

  const filteredInsights = useMemo(() => {
    return mockInsights.filter((i) => {
      if (activeCategory !== "All" && i.category !== activeCategory) return false;
      if (activePriority !== "All" && i.priority !== activePriority) return false;
      if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.summary.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, activeCategory, activePriority]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar activeView={activeView} onViewChange={(v) => { setActiveView(v); setSelectedInsight(null); }} />

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {/* Dashboard */}
          {activeView === "dashboard" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl font-semibold font-display text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Overview of your product intelligence.</p>
              </div>
              <DashboardStats />
              <div>
                <h3 className="font-display text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Recent High-Priority Insights
                </h3>
                <div className="space-y-2">
                  {mockInsights
                    .filter((i) => i.priority === "high")
                    .map((insight) => (
                      <InsightCard
                        key={insight.id}
                        insight={insight}
                        onSelect={(i) => { setSelectedInsight(i); setActiveView("insights"); }}
                        isSelected={false}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Insights */}
          {activeView === "insights" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h1 className="text-xl font-semibold font-display text-foreground">Insights</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredInsights.length} insight{filteredInsights.length !== 1 && "s"} from {mockInsights.length} total
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
                    No insights match your filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sources */}
          {activeView === "sources" && (
            <div className="animate-fade-in">
              <SourcesView />
            </div>
          )}

          {/* Upload */}
          {activeView === "upload" && (
            <div className="animate-fade-in">
              <UploadPanel />
            </div>
          )}

          {/* Settings placeholder */}
          {activeView === "settings" && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-semibold font-display text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">Configuration coming soon.</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {activeView === "insights" && (
          <InsightDetail insight={selectedInsight} onClose={() => setSelectedInsight(null)} />
        )}
      </main>
    </div>
  );
};

export default Index;
