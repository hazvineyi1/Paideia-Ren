import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import StudyNav from "@/components/StudyNav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  useListStudyMaterials,
  useCreateStudyPractice,
} from "@workspace/api-client-react";
import {
  ArrowLeft, Play, BrainCircuit, Target, Zap, BarChart3,
  BookOpen, ChevronRight, TrendingUp
} from "lucide-react";

type DifficultyLevel = "easy" | "medium" | "hard" | "mixed";

const DIFFICULTIES: { id: DifficultyLevel; label: string; color: string; desc: string }[] = [
  { id: "easy", label: "Easy", color: "bg-emerald-500", desc: "Warm-up, confidence building" },
  { id: "medium", label: "Medium", color: "bg-blue-500", desc: "Balanced challenge" },
  { id: "hard", label: "Hard", color: "bg-amber-500", desc: "Push your limits" },
  { id: "mixed", label: "Adaptive", color: "bg-primary", desc: "AI adjusts per question" },
];

export default function StudyPractice() {
  const [, setLoc] = useLocation();
  const { data: materials, isLoading: matLoading } = useListStudyMaterials();
  const createMutation = useCreateStudyPractice();

  const [materialId, setMaterialId] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("material") || "";
    } catch { return ""; }
  });

  // Keep selection in sync if user arrives with a different ?material= later
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("material");
    if (fromUrl && fromUrl !== materialId) setMaterialId(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("mixed");
  const [focusMode, setFocusMode] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!materialId) return;
    setCreating(true);
    try {
      const res = await createMutation.mutateAsync({
        data: { materialId, questionCount, difficulty },
      });
      setLoc(`/practice/${res.id}`);
    } catch {
      alert("Failed to start practice session.");
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StudyNav />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Adaptive Practice</h1>
          <p className="text-sm text-muted-foreground">
            AI generates questions from your materials and adapts difficulty based on your performance.
          </p>
        </div>

        {/* Source Material */}
        <Card className="mb-4">
          <CardContent className="py-5 space-y-5">
            <div>
              <Label className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                Source Material
              </Label>
              {matLoading ? (
                <p className="text-sm text-muted-foreground py-2">Loading...</p>
              ) : (
                <select
                  value={materialId}
                  onChange={(e) => setMaterialId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm mt-1.5"
                >
                  <option value="">Select a material</option>
                  {materials?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.flashcardCount} cards, {m.conceptCount} concepts)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Question Count */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  Questions
                </Label>
                <span className="text-sm font-medium">{questionCount}</span>
              </div>
              <Slider
                value={[questionCount]}
                onValueChange={(v) => setQuestionCount(v[0])}
                min={3}
                max={30}
                step={1}
              />
            </div>

            {/* Difficulty Selection */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                Difficulty Mode
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      difficulty === d.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${d.color}`} />
                      <span className={`text-sm font-medium ${difficulty === d.id ? "text-primary" : ""}`}>
                        {d.label}
                      </span>
                      {d.id === "mixed" && (
                        <Badge variant="outline" className="ml-auto text-[10px] h-5">AI</Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{d.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Adaptive Features */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Confidence Calibration</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">Enabled</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                After each answer, rate your confidence (1-5). AI tracks metacognition and adjusts difficulty.
              </p>
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleCreate}
              disabled={!materialId || creating}
            >
              <Play className="h-4 w-4" />
              {creating ? "Generating questions..." : "Start Practice Session"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Stats Preview */}
        <Card className="border-dashed">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Your Practice Trends</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold">14</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">78%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">4.2</p>
                <p className="text-xs text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
