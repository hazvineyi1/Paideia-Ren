import { useState, useRef, DragEvent } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useCreateStudyMaterial,
  getListStudyMaterialsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGenerateAssessment, useStudyProfile, useUpdateStudyProfile } from "@/hooks/use-study-journey";
import {
  ArrowLeft, Sparkles, FileText, Link2, Upload, Image,
  Mic, Globe, Brain, Loader2, CheckCircle2, X, Rocket,
  BookOpen, Zap, Compass, ChevronRight
} from "lucide-react";

type SourceType = "paste" | "url" | "file" | "image" | "audio";

interface IngestionOption {
  id: SourceType;
  label: string;
  icon: typeof FileText;
  description: string;
  accepted?: string;
}

const OPTIONS: IngestionOption[] = [
  { id: "paste", label: "Paste Text", icon: FileText, description: "Notes, articles, textbook content" },
  { id: "url", label: "Web URL", icon: Link2, description: "Articles, Wikipedia, docs" },
  { id: "file", label: "Upload File", icon: Upload, description: "PDF, DOC, TXT files", accepted: ".pdf,.doc,.docx,.txt" },
  { id: "image", label: "Image / Screenshot", icon: Image, description: "Notes, diagrams, slides", accepted: "image/*" },
  { id: "audio", label: "Audio / Video", icon: Mic, description: "Lectures, podcasts, recordings", accepted: "audio/*,video/*" },
];

export default function StudyMaterialNew() {
  const [, setLoc] = useLocation();
  const createMutation = useCreateStudyMaterial();
  const generateAssessment = useGenerateAssessment();
  const updateProfile = useUpdateStudyProfile();
  const { data: profile } = useStudyProfile();
  const queryClient = useQueryClient();

  const [learningGoal, setLearningGoal] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [activeTab, setActiveTab] = useState<SourceType>("paste");
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<"input" | "processing" | "done">("input");
  const [createdMaterial, setCreatedMaterial] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (sourceType: SourceType) => {
    if (!title) return;
    if (sourceType === "paste" && !content) return;
    if (sourceType === "url" && !sourceUrl) return;
    setSubmitting(true);
    setStage("processing");

    try {
      // Save learning goal to learner profile so AI can use it as context
      const goal = learningGoal.trim();
      if (goal && goal !== (profile?.examTarget ?? "")) {
        try {
          await updateProfile.mutateAsync({ examTarget: goal });
        } catch {
          // non-fatal - continue with material creation
        }
      }

      const material = await createMutation.mutateAsync({
        data: {
          title,
          sourceType: (sourceType === "audio" ? "file" : sourceType) as any,
          sourceUrl: sourceType === "url" ? sourceUrl || null : null,
          contentText: content || sourceUrl || "",
        },
      });

      queryClient.invalidateQueries({ queryKey: getListStudyMaterialsQueryKey() });
      setCreatedMaterial(material);

      // Trigger knowledge graph generation
      await fetch("/api/study/knowledge/generate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: material.id }),
      });

      setStage("done");
    } catch (err: any) {
      alert(err?.data?.error || "Failed to add material");
      setSubmitting(false);
      setStage("input");
    }
  };

  const handleStartAssessment = () => {
    if (!createdMaterial) return;
    generateAssessment.mutate(
      { materialId: createdMaterial.id },
      {
        onSuccess: (assessment: any) => {
          setLoc(`/assessment/${assessment.id}`);
        },
        onError: () => {
          alert("Assessment generation failed. Try again in a moment.");
        },
      },
    );
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, type: SourceType) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setDroppedFile(files[0]);
      setTitle(files[0].name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDroppedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  // Done / Success Stage
  if (stage === "done" && createdMaterial) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Material Added!</h1>
          <p className="text-muted-foreground mb-2">{createdMaterial.title}</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
            AI has extracted key concepts and built your knowledge graph. Now take a quick diagnostic assessment so we can personalize your learning path.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3 text-primary" /> Concepts Extracted</span>
            <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /> Flashcards Ready</span>
            <span className="flex items-center gap-1"><Compass className="h-3 w-3 text-primary" /> Path Waiting</span>
          </div>

          <Button
            size="lg"
            className="gap-2 w-full max-w-xs"
            onClick={handleStartAssessment}
            disabled={generateAssessment.isPending}
          >
            {generateAssessment.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Assessment...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Start Diagnostic Assessment
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-xs"
            onClick={() => setLoc("/dashboard")}
          >
            Skip for Now → Dashboard
          </Button>
        </main>
      </div>
    );
  }

  // Processing Stage
  if (stage === "processing") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
            <Brain className="absolute inset-0 m-auto h-6 w-6 text-primary" />
          </div>
          <h2 className="font-semibold mb-1">AI is Analyzing Your Material</h2>
          <p className="text-sm text-muted-foreground">
            Extracting concepts, building knowledge graph, generating flashcards...
          </p>
          <p className="text-xs text-muted-foreground mt-2">This takes ~10-20 seconds</p>
        </div>
      </div>
    );
  }

  // Input Stage
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-3 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLoc("/materials")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Start Your Learning Journey</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Set Up Your Learning Journey</h1>
          <p className="text-sm text-muted-foreground">
            Tell us your goal and share your materials. AI will profile how you learn and build your optimal path.
          </p>
        </div>

        {/* Learning Goal - sets context for everything */}
        <Card className="mb-5 border-primary/20 bg-primary/5">
          <CardContent className="py-5 px-5">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-4 w-4 text-primary" />
              <Label htmlFor="goal" className="text-sm font-semibold m-0">What are you preparing for?</Label>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              The AI uses this to focus every step on your goal - exam, certification, project, or topic mastery.
            </p>
            <Input
              id="goal"
              placeholder="e.g., Scrum Master Certification, AWS Solutions Architect, USMLE Step 1"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              className="bg-background"
            />
            {profile?.examTarget && !learningGoal && (
              <p className="text-[11px] text-muted-foreground mt-2">
                Current goal: <span className="font-medium">{profile.examTarget}</span> · type above to change
              </p>
            )}
          </CardContent>
        </Card>

        {/* Title */}
        <div className="mb-6">
          <Label htmlFor="title" className="text-sm font-medium">Material title</Label>
          <Input
            id="title"
            placeholder="e.g., Scrum Guide 2020 - Chapter 1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5"
            required
          />
        </div>

        {/* Source Type Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setActiveTab(opt.id); setDroppedFile(null); }}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                activeTab === opt.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-primary/30 hover:bg-accent/50"
              }`}
            >
              <opt.icon className={`h-5 w-5 ${activeTab === opt.id ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-center">
                <p className={`text-xs font-medium ${activeTab === opt.id ? "text-primary" : ""}`}>{opt.label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 hidden sm:block">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <Card className="mb-6">
          <CardContent className="py-5 px-5">
            {activeTab === "paste" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Paste Your Study Notes</h3>
                  <Badge variant="outline" className="text-[10px] h-5 ml-auto">Fastest</Badge>
                </div>
                <Textarea
                  placeholder="Paste lecture notes, textbook chapters, study guides, or any text content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={14}
                  className="resize-none text-sm leading-relaxed"
                />
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>{content.length.toLocaleString()} characters</span>
                  <span>AI extracts ~1 concept per 200 words</span>
                </div>
              </div>
            )}

            {activeTab === "url" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Link to Web Content</h3>
                </div>
                <Input
                  placeholder="https://en.wikipedia.org/wiki/Cell_biology"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Paste a link to an article, Wikipedia page, or any web resource. AI will extract key concepts.
                </p>
              </div>
            )}

            {(activeTab === "file" || activeTab === "image" || activeTab === "audio") && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => handleDrop(e, activeTab)}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-muted-foreground/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={OPTIONS.find((o) => o.id === activeTab)?.accepted}
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {droppedFile ? (
                  <div className="flex items-center gap-3 justify-center">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{droppedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(droppedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDroppedFile(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                      {activeTab === "file" && <Upload className="h-6 w-6 text-muted-foreground" />}
                      {activeTab === "image" && <Image className="h-6 w-6 text-muted-foreground" />}
                      {activeTab === "audio" && <Mic className="h-6 w-6 text-muted-foreground" />}
                    </div>
                    <p className="text-sm font-medium mb-1">
                      Drop {activeTab === "file" ? "a file" : activeTab === "image" ? "an image" : "audio/video"} here
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      or click to browse from your device
                    </p>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Browse Files
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          className="w-full gap-2"
          size="lg"
          disabled={!title || (activeTab === "paste" && !content) || (activeTab === "url" && !sourceUrl) || ((activeTab === "file" || activeTab === "image" || activeTab === "audio") && !droppedFile) || submitting}
          onClick={() => handleSubmit(activeTab)}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI is analyzing your material...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Start Learning - Generate Concepts & Path
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-3">
          After upload, AI extracts concepts, generates flashcards, and creates your personalized assessment & learning path.
        </p>
      </main>
    </div>
  );
}
