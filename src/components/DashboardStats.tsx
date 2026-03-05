import { AlertTriangle, Lightbulb, CheckCircle2, TrendingUp, Loader2 } from "lucide-react";
import type { DbInsight } from "@/lib/api";

interface DashboardStatsProps {
  insights: DbInsight[];
  isLoading: boolean;
}

const DashboardStats = ({ insights, isLoading }: DashboardStatsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const safeInsights = insights || [];

  const stats = [
    {
      label: "Total Insights",
      value: safeInsights.length,
      icon: Lightbulb,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "High Priority",
      value: safeInsights.filter((i) => i.priority === "high").length,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Validated",
      value: safeInsights.filter((i) => i.validated).length,
      icon: CheckCircle2,
      color: "text-badge-success",
      bg: "bg-badge-success/10",
    },
    {
      label: "Categories",
      value: new Set(safeInsights.map((i) => i.category)).size,
      icon: TrendingUp,
      color: "text-badge-info",
      bg: "bg-badge-info/10",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold font-display text-card-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
