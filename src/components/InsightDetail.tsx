import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Circle, FileText, Share2, Download } from "lucide-react";
import { CategoryBadge, PriorityDot } from "./CategoryBadge";
import { Button } from "./ui/button";
import { toggleInsightValidation } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DbInsight } from "@/lib/api";

interface InsightDetailProps {
  insight: DbInsight | null;
  onClose: () => void;
}

const InsightDetail = ({ insight, onClose }: InsightDetailProps) => {
  const queryClient = useQueryClient();

  const handleToggleValidation = async () => {
    if (!insight) return;
    try {
      await toggleInsightValidation(insight.id, !insight.validated);
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      toast.success(insight.validated ? "Marked as unvalidated" : "Marked as validated");
    } catch {}
  };

  const handleExport = () => {
    if (!insight) return;
    const text = `# ${insight.title}\n\nCategory: ${insight.category}\nPriority: ${insight.priority}\nValidated: ${insight.validated ? "Yes" : "No"}\n\n## Summary\n${insight.summary}\n\n## Sources\n${(insight.sources || []).map(s => `- ${s.title} (${s.type}): "${s.snippet}"`).join("\n")}`;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `insight-${insight.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Insight exported");
  };

  return (
    <AnimatePresence>
      {insight && (
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          className="w-[420px] shrink-0 border-l border-border bg-card overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
            <span className="font-display text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Insight Detail
            </span>
            <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Title + Meta */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PriorityDot priority={insight.priority} />
                <span className="text-xs font-display font-medium text-muted-foreground uppercase">
                  {insight.priority} priority
                </span>
                <button onClick={handleToggleValidation} className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity">
                  {insight.validated ? (
                    <span className="flex items-center gap-1 text-badge-success">
                      <CheckCircle2 className="w-3 h-3" /> Validated
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Circle className="w-3 h-3" /> Unvalidated
                    </span>
                  )}
                </button>
              </div>
              <h2 className="text-lg font-semibold text-card-foreground leading-snug">
                {insight.title}
              </h2>
            </div>

            {/* Category + Tags */}
            <div className="flex flex-wrap gap-1.5">
              <CategoryBadge category={insight.category} />
              {(insight.tags || []).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>

            {/* Summary */}
            <div>
              <h4 className="font-display text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Summary
              </h4>
              <p className="text-sm text-card-foreground leading-relaxed">
                {insight.summary}
              </p>
            </div>

            {/* Sources */}
            <div>
              <h4 className="font-display text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Sources ({(insight.sources || []).length})
              </h4>
              <div className="space-y-3">
                {(insight.sources || []).map((source) => (
                  <div key={source.id} className="p-3 rounded-md border border-border bg-muted/30">
                    <div className="flex items-start gap-2 mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">{source.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{source.type}</span>
                          <span>·</span>
                          <span>{new Date(source.date).toLocaleDateString()}</span>
                          {source.author && (
                            <>
                              <span>·</span>
                              <span>{source.author}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {source.snippet && (
                      <blockquote className="ml-5 pl-3 border-l-2 border-accent/30 text-xs text-muted-foreground italic leading-relaxed">
                        "{source.snippet}"
                      </blockquote>
                    )}
                  </div>
                ))}
                {(insight.sources || []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No sources linked</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => { navigator.clipboard.writeText(`${insight.title}\n\n${insight.summary}`); toast.success("Copied to clipboard"); }}>
                <Share2 className="w-3.5 h-3.5" /> Share
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={handleExport}>
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InsightDetail;
