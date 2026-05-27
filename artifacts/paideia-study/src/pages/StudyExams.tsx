import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  useListStudyMaterials,
  useListStudyExams,
  useCreateStudyExam,
} from "@workspace/api-client-react";
import type { StudyMockExam } from "@workspace/api-client-react";
import { ArrowLeft, Award, Play, Plus, FileText, Calendar } from "lucide-react";

export default function StudyExams() {
  const [, setLoc] = useLocation();
  const { data: materials, isLoading: matLoading } = useListStudyMaterials();
  const { data: exams, isLoading: examsLoading } = useListStudyExams();
  const createMutation = useCreateStudyExam();

  const [title, setTitle] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(60);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title || !materialId) return;
    setCreating(true);
    try {
      const res = await createMutation.mutateAsync({
        data: { title, materialId, questionCount, timeLimitMinutes },
      });
      setLoc(`/exams/${res.id}/take`);
    } catch {
      alert("Failed to create mock exam.");
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
          <Award className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Mock Exams</h1>
          <p className="text-muted-foreground mt-1">
            Simulate exam conditions with timed tests from your materials.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="py-5 space-y-4">
            <h3 className="font-semibold text-sm">Create New Mock Exam</h3>
            <div>
              <Label htmlFor="title">Exam Title</Label>
              <Input
                id="title"
                placeholder="e.g., Final Biology Exam - Full Mock"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="count">Questions</Label>
                <Input
                  id="count"
                  type="number"
                  min={5}
                  max={60}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="time">Time Limit (min)</Label>
                <Input
                  id="time"
                  type="number"
                  min={5}
                  max={180}
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={!title || !materialId || creating}
            >
              <Plus className="h-4 w-4 mr-2" />
              {creating ? "Creating..." : "Create & Start Exam"}
            </Button>
          </CardContent>
        </Card>

        <h2 className="text-lg font-bold mb-4">Previous Exams</h2>
        {examsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !exams || exams.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No mock exams yet.</p>
        ) : (
          <div className="space-y-3">
            {exams.map((exam: StudyMockExam) => (
              <Card key={exam.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{exam.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {exam.questionCount} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {exam.timeLimitMinutes} min
                      </span>
                      <span>
                        {new Date(exam.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={exam.status === "completed" ? "outline" : "default"}
                    onClick={() => setLoc(`/exams/${exam.id}/take`)}
                  >
                    {exam.status === "completed" ? "Review" : <Play className="h-3 w-3 mr-1" />}
                    {exam.status === "completed" ? "" : "Resume"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
