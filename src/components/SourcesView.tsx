import { FileText, Calendar, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchSources } from "@/lib/api";

const SourcesView = () => {
  const { data: sources = [], isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: fetchSources,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground font-display">All Sources</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {sources.length} ingested source{sources.length !== 1 ? "s" : ""} powering your insights.
        </p>
      </div>

      {sources.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No sources yet. Upload files to get started.
        </div>
      ) : (
        <div className="grid gap-3">
          {sources.map((source, idx) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-card-foreground">{source.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">{source.type}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(source.date).toLocaleDateString()}
                    </span>
                    {source.author && (
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{source.author}</span>
                    )}
                  </div>
                  {source.snippet && (
                    <blockquote className="mt-2 pl-3 border-l-2 border-accent/30 text-xs text-muted-foreground italic line-clamp-3">
                      "{source.snippet}"
                    </blockquote>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourcesView;
