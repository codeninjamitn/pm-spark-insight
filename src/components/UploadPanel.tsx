import { Upload, File, X, Loader2, Globe, Link2, Plus, AlertTriangle, ClipboardPaste, Lock } from "lucide-react";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Constants } from "@/integrations/supabase/types";
import { uploadFileAndCreateSource, createSourceFromUrl, createSourceFromText, extractInsightsFromSources } from "@/lib/api";
import type { DbSource } from "@/lib/api";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

const sourceTypes = Constants.public.Enums.source_type;

interface QueuedFile {
  file: File;
  type: string;
}

interface QueuedUrl {
  url: string;
  type: string;
}

interface QueuedText {
  title: string;
  text: string;
  type: string;
}

type InputMode = "files" | "urls" | "text";

interface UploadPanelProps {
  onInsightsGenerated?: () => void;
}

const UploadPanel = ({ onInsightsGenerated }: UploadPanelProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [queuedUrls, setQueuedUrls] = useState<QueuedUrl[]>([]);
  const [queuedTexts, setQueuedTexts] = useState<QueuedText[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("files");
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMsg, setErrorDialogMsg] = useState("");

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

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    setQueuedUrls((prev) => [...prev, { url: trimmed, type: sourceTypes[0] }]);
    setUrlInput("");
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUrl();
    }
  };

  const handleAddText = () => {
    const trimmedText = textInput.trim();
    if (!trimmedText) { toast.error("Please paste some text"); return; }
    const title = textTitle.trim() || `Pasted text ${queuedTexts.length + 1}`;
    setQueuedTexts((prev) => [...prev, { title, text: trimmedText, type: sourceTypes[0] }]);
    setTextTitle("");
    setTextInput("");
  };

  const totalQueued = queuedFiles.length + queuedUrls.length + queuedTexts.length;

  const handleProcess = async () => {
    if (totalQueued === 0) return;
    setIsUploading(true);

    try {
      const uploadedSources: DbSource[] = [];

      // Upload files
      for (const qf of queuedFiles) {
        const source = await uploadFileAndCreateSource(qf.file, qf.type);
        uploadedSources.push(source);
      }

      // Scrape URLs
      for (const qu of queuedUrls) {
        const source = await createSourceFromUrl(qu.url, qu.type);
        uploadedSources.push(source);
      }

      // Pasted texts
      for (const qt of queuedTexts) {
        const source = await createSourceFromText(qt.title, qt.text, qt.type);
        uploadedSources.push(source);
      }

      toast.success(`${uploadedSources.length} source(s) added successfully`);
      setQueuedFiles([]);
      setQueuedUrls([]);
      setQueuedTexts([]);

      // Extract insights via AI
      setIsUploading(false);
      setIsExtracting(true);
      const sourceIds = uploadedSources.map((s) => s.id);
      await extractInsightsFromSources(sourceIds);
      toast.success("AI insights extracted successfully!");
      onInsightsGenerated?.();
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg === "INSUFFICIENT_CONTENT") {
        setErrorDialogMsg(
          "This page didn't return enough content — it may require JavaScript to load (e.g. Google Maps, App Store). Try pasting the review text directly as a file instead."
        );
        setErrorDialogOpen(true);
      } else {
        console.error("Process error:", err);
      }
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
          Drop feedback, reports, or transcripts — or paste review URLs. PM Wizard will extract and categorize insights automatically using AI.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setInputMode("files")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            inputMode === "files"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="w-4 h-4" />
          Files
        </button>
        <button
          onClick={() => setInputMode("urls")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            inputMode === "urls"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="w-4 h-4" />
          URL
        </button>
        <button
          onClick={() => setInputMode("text")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            inputMode === "text"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          Paste Text
        </button>
      </div>

      {/* File drop zone */}
      {inputMode === "files" && (
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
      )}

      {/* URL input */}
      {inputMode === "urls" && (
        <div className="border-2 border-dashed rounded-lg p-8 border-border bg-muted/30 space-y-4">
          <div className="text-center mb-2">
            <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Paste a review or feedback URL</p>
            <p className="text-xs text-muted-foreground mt-1">
              Google Reviews, Apple App Store, G2, Capterra, Trustpilot, or any public page
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://play.google.com/store/apps/details?id=..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleUrlKeyDown}
              className="flex-1"
            />
            <Button
              onClick={handleAddUrl}
              variant="outline"
              size="icon"
              disabled={!urlInput.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Paste text input */}
      {inputMode === "text" && (
        <div className="border-2 border-dashed rounded-lg p-8 border-border bg-muted/30 space-y-4">
          <div className="text-center mb-2">
            <ClipboardPaste className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Paste review or feedback text</p>
            <p className="text-xs text-muted-foreground mt-1">
              Copy & paste reviews, survey responses, or any feedback text directly
            </p>
          </div>
          <Input
            placeholder="Title (optional)"
            value={textTitle}
            onChange={(e) => setTextTitle(e.target.value)}
          />
          <Textarea
            placeholder="Paste your review text, feedback, or transcript here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={6}
          />
          <Button
            onClick={handleAddText}
            variant="outline"
            className="w-full"
            disabled={!textInput.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Queue
          </Button>
        </div>
      )}

      {/* Queued items */}
      {totalQueued > 0 && (
        <div className="space-y-2">
          <h4 className="font-display text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Queued ({totalQueued})
          </h4>

          {/* Queued files */}
          {queuedFiles.map((qf, idx) => (
            <div key={`file-${idx}`} className="flex items-center gap-3 p-3 bg-card border border-border rounded-md">
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

          {/* Queued URLs */}
          {queuedUrls.map((qu, idx) => (
            <div key={`url-${idx}`} className="flex items-center gap-3 p-3 bg-card border border-border rounded-md">
              <Link2 className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm text-card-foreground flex-1 truncate">{qu.url}</span>
              <span className="text-xs text-muted-foreground">URL</span>
              <select
                value={qu.type}
                onChange={(e) => {
                  const updated = [...queuedUrls];
                  updated[idx] = { ...updated[idx], type: e.target.value };
                  setQueuedUrls(updated);
                }}
                className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground"
              >
                {sourceTypes.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <button
                onClick={() => setQueuedUrls((prev) => prev.filter((_, i) => i !== idx))}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}

          {/* Queued Texts */}
          {queuedTexts.map((qt, idx) => (
            <div key={`text-${idx}`} className="flex items-center gap-3 p-3 bg-card border border-border rounded-md">
              <ClipboardPaste className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm text-card-foreground flex-1 truncate">{qt.title}</span>
              <span className="text-xs text-muted-foreground">{qt.text.length} chars</span>
              <select
                value={qt.type}
                onChange={(e) => {
                  const updated = [...queuedTexts];
                  updated[idx] = { ...updated[idx], type: e.target.value };
                  setQueuedTexts(updated);
                }}
                className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground"
              >
                {sourceTypes.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <button
                onClick={() => setQueuedTexts((prev) => prev.filter((_, i) => i !== idx))}
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
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing sources...</>
            ) : isExtracting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting insights with AI...</>
            ) : (
              `Process ${totalQueued} source${totalQueued !== 1 ? "s" : ""} with AI`
            )}
          </Button>
        </div>
      )}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Unable to Read URL
            </AlertDialogTitle>
            <AlertDialogDescription>{errorDialogMsg}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UploadPanel;
