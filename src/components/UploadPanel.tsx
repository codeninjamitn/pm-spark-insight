import { Upload, FileText, File, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { sourceTypes } from "@/lib/mockData";
import type { SourceType } from "@/lib/mockData";

const UploadPanel = () => {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<{ name: string; type: SourceType }[]>([]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Mock: add dropped files
    const newFiles = Array.from(e.dataTransfer.files).map((f) => ({
      name: f.name,
      type: "Customer Feedback" as SourceType,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground font-display">Upload Sources</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drop feedback, reports, or transcripts. PM Wizard will extract and categorize insights automatically.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragOver ? "border-accent bg-accent/5" : "border-border bg-muted/30"
        }`}
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">Drop files here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, DOCX, TXT, CSV — up to 20MB per file
        </p>
        <Button variant="outline" size="sm" className="mt-4">
          Browse Files
        </Button>
      </div>

      {/* Queued files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-display text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Queued ({files.length})
          </h4>
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-card border border-border rounded-md">
              <File className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm text-card-foreground flex-1 truncate">{file.name}</span>
              <select
                value={file.type}
                onChange={(e) => {
                  const updated = [...files];
                  updated[idx].type = e.target.value as SourceType;
                  setFiles(updated);
                }}
                className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground"
              >
                {sourceTypes.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <button
                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
          <Button className="w-full mt-3 bg-accent text-accent-foreground hover:bg-accent/90">
            Process {files.length} file{files.length !== 1 && "s"} with AI
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadPanel;
