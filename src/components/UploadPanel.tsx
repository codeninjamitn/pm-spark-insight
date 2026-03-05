import { Upload, File, X, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Constants } from "@/integrations/supabase/types";
import { uploadFileAndCreateSource, extractInsightsFromSources } from "@/lib/api";
import type { DbSource } from "@/lib/api";
import { toast } from "sonner";

const sourceTypes = Constants.public.Enums.source_type;

interface QueuedFile {
  file: File;
  type: string;
}

interface UploadPanelProps {
  onInsightsGenerated?: () => void;
}

const UploadPanel = ({ onInsightsGenerated }: UploadPanelProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: QueuedFile[] = Array.from(fileList).map((f) => ({
      file: f,
      type: sourceTypes[0],
    }));
    setQueuedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const handleProcess = async () => {
    if (queuedFiles.length === 0) return;
    setIsUploading(true);

    try {
      // Upload all files and create sources
      const uploadedSources: DbSource[] = [];
      for (const qf of queuedFiles) {
        const source = await uploadFileAndCreateSource(qf.file, qf.type);
        uploadedSources.push(source);
      }

      toast.success(`${uploadedSources.length} file(s) uploaded successfully`);
      setQueuedFiles([]);

      // Extract insights via AI
      setIsUploading(false);
      setIsExtracting(true);
      const sourceIds = uploadedSources.map((s) => s.id);
      await extractInsightsFromSources(sourceIds);
      toast.success("AI insights extracted successfully!");
      onInsightsGenerated?.();
    } catch (err) {
      console.error("Process error:", err);
    } finally {
      setIsUploading(false);
      setIsExtracting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground font-display">Upload Sources</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drop feedback, reports, or transcripts. PM Wizard will extract and categorize insights automatically using AI.
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
        <label>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <span>Browse Files</span>
          </Button>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInput}
            accept=".pdf,.docx,.txt,.csv,.md,.json"
          />
        </label>
      </div>

      {/* Queued files */}
      {queuedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-display text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Queued ({queuedFiles.length})
          </h4>
          {queuedFiles.map((qf, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-card border border-border rounded-md">
              <File className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm text-card-foreground flex-1 truncate">{qf.file.name}</span>
              <span className="text-xs text-muted-foreground">{(qf.file.size / 1024).toFixed(0)}KB</span>
              <select
                value={qf.type}
                onChange={(e) => {
                  const updated = [...queuedFiles];
                  updated[idx] = { ...updated[idx], type: e.target.value };
                  setQueuedFiles(updated);
                }}
                className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground"
              >
                {sourceTypes.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <button
                onClick={() => setQueuedFiles((prev) => prev.filter((_, i) => i !== idx))}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
          <Button
            onClick={handleProcess}
            disabled={isUploading || isExtracting}
            className="w-full mt-3 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isUploading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
            ) : isExtracting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting insights with AI...</>
            ) : (
              `Process ${queuedFiles.length} file${queuedFiles.length !== 1 ? "s" : ""} with AI`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadPanel;
