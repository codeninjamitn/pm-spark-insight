import { cn } from "@/lib/utils";
import type { InsightCategory, InsightPriority } from "@/lib/mockData";

const categoryColors: Record<InsightCategory, string> = {
  "Design Feedback": "bg-badge-info/15 text-badge-info",
  "Feature Requests": "bg-accent/15 text-accent",
  "Competitive Intel": "bg-destructive/15 text-destructive",
  "Churn Risks": "bg-destructive/20 text-destructive",
  "Future Releases": "bg-badge-success/15 text-badge-success",
};

const priorityIndicator: Record<InsightPriority, string> = {
  high: "bg-destructive",
  medium: "bg-accent",
  low: "bg-badge-neutral",
};

export const CategoryBadge = ({ category }: { category: InsightCategory }) => (
  <span className={cn("px-2 py-0.5 rounded text-xs font-medium font-display", categoryColors[category])}>
    {category}
  </span>
);

export const PriorityDot = ({ priority }: { priority: InsightPriority }) => (
  <span className={cn("w-2 h-2 rounded-full shrink-0", priorityIndicator[priority])} title={priority} />
);
