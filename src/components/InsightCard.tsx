import { motion } from "framer-motion";
import { CheckCircle2, Circle, FileText } from "lucide-react";
import { CategoryBadge, PriorityDot } from "./CategoryBadge";
import type { DbInsight } from "@/lib/api";

interface InsightCardProps {
  insight: DbInsight;
  onSelect: (insight: DbInsight) => void;
  isSelected: boolean;
}

const InsightCard = ({ insight, onSelect, isSelected }: InsightCardProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(insight)}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected 
          ? "border-accent bg-accent/5 shadow-sm" 
          : "border-border bg-card hover:border-accent/30 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        <PriorityDot priority={insight.priority} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-card-foreground leading-tight truncate">
            {insight.title}
          </h3>
        </div>
        {insight.validated ? (
          <CheckCircle2 className="w-4 h-4 text-badge-success shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 ml-4">
        {insight.summary}
      </p>
      <div className="flex items-center gap-2 ml-4">
        <CategoryBadge category={insight.category} />
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {(insight.sources || []).length} source{(insight.sources || []).length !== 1 ? "s" : ""}
        </span>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">{new Date(insight.created_at).toLocaleDateString()}</span>
      </div>
    </motion.button>
  );
};

export default InsightCard;
