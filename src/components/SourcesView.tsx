import { FileText, Calendar, User } from "lucide-react";
import { mockSources } from "@/lib/mockData";
import { motion } from "framer-motion";

const SourcesView = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground font-display">All Sources</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {mockSources.length} ingested sources powering your insights.
        </p>
      </div>

      <div className="grid gap-3">
        {mockSources.map((source, idx) => (
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
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{source.date}</span>
                  {source.author && (
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{source.author}</span>
                  )}
                </div>
                <blockquote className="mt-2 pl-3 border-l-2 border-accent/30 text-xs text-muted-foreground italic">
                  "{source.snippet}"
                </blockquote>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SourcesView;
