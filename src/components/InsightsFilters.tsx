import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { categories } from "@/lib/mockData";
import type { InsightCategory, InsightPriority } from "@/lib/mockData";

interface InsightsFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeCategory: InsightCategory | "All";
  onCategoryChange: (cat: InsightCategory | "All") => void;
  activePriority: InsightPriority | "All";
  onPriorityChange: (p: InsightPriority | "All") => void;
}

const InsightsFilters = ({
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  activePriority,
  onPriorityChange,
}: InsightsFiltersProps) => {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search insights..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip
          label="All"
          active={activeCategory === "All"}
          onClick={() => onCategoryChange("All")}
        />
        {categories.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            active={activeCategory === cat}
            onClick={() => onCategoryChange(cat)}
          />
        ))}
      </div>

      {/* Priority filter */}
      <div className="flex gap-1.5">
        {(["All", "high", "medium", "low"] as const).map((p) => (
          <FilterChip
            key={p}
            label={p === "All" ? "Any Priority" : `${p[0].toUpperCase()}${p.slice(1)}`}
            active={activePriority === p}
            onClick={() => onPriorityChange(p)}
          />
        ))}
      </div>
    </div>
  );
};

const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
      active
        ? "bg-accent text-accent-foreground"
        : "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
    }`}
  >
    {label}
  </button>
);

export default InsightsFilters;
