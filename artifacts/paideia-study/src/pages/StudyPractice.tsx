import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  useListStudyMaterials,
  useCreateStudyPractice,
} from "@workspace/api-client-react";
import { ArrowLeft, BrainCircuit, Play, FileText } from "lucide-react";

export default function StudyPractice() {
  const [, setLoc] = useLocation();
  const { data: materials, isLoading: matLoading } = useListStudyMaterials();
  const createMutation = useCreateStudyPractice();

  const [materialId, setMaterialId] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!materialId) return;
    setCreating(true);
    try {
      const res = await createMutation.mutateAsync({
        data: { materialId, questionCount },
      });
      setLoc(`/practice/${res.id}`);
    } catch {
      alert("Failed to start practice session.");
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <Button variant="ghost" size="sm" onClick={() => setLoc("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <BrainCircuit className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Adaptive Practice</h1>
          <p className="text-muted-foreground mt-1">
            Generate targeted questions from your materials with confidence calibration.
          </p>
        </div>

        <Card>
          <CardContent className="py-5 space-y-4">
            <div>
              <Label htmlFor="material">Source Material</Label>
              {matLoading ? (
                <p className="text-sm text-muted-foreground py-2">Loading materials...</p>
              ) : (
                <select
                  id="material"
                  value={materialId}
                  onChange={(e) => setMaterialId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select a material</option>
                  {materials?.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <Label htmlFor="count">Questions</Label>
              <Input
                id="count"
                type="number"
                min={3}
                max={30}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={!materialId || creating}
            >
              <Play className="h-4 w-4 mr-2" />
              {creating ? "Creating..." : "Start Practice Session"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
