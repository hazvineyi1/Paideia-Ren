import { useState } from "react";
import { useLocation } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { WorkflowForm } from "@/components/WorkflowForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useCatalog } from "@/hooks/use-catalog";
import { GeneratingSpinner } from "@/components/Loading";
import { api, ApiError } from "@/lib/api";
import type { Worksheet } from "@/lib/types";

export default function WorksheetNew() {
  const { teacher } = useAuth();
  const { regions } = useCatalog();
  const [, setLoc] = useLocation();
  const region = regions.find((r) => r.id === teacher?.region);

  const [subject, setSubject] = useState("");
  const [yearGroup, setYearGroup] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("core");
  const [questionCount, setQuestionCount] = useState(10);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await api.post<{ worksheet: Worksheet }>("/worksheets", {
        region: teacher?.region, subject, yearGroup, topic, difficulty, questionCount,
        notes: notes || undefined,
      });
      setLoc(`/worksheets/${res.worksheet.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Generation failed");
      setBusy(false);
    }
  };

  if (busy) return <AppShell><GeneratingSpinner label="Building your worksheet" /></AppShell>;

  return (
    <AppShell>
      <WorkflowForm title="New worksheet" subtitle="Practice questions with full answer keys.">
        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder="Pick a subject" /></SelectTrigger>
                <SelectContent>{region?.subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year group</Label>
              <Select value={yearGroup} onValueChange={setYearGroup}>
                <SelectTrigger><SelectValue placeholder="Pick a year group" /></SelectTrigger>
                <SelectContent>{region?.yearGroups.map((y) => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Equivalent fractions" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="stretch">Stretch</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Number of questions</Label>
              <Input id="count" type="number" min={3} max={30} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any constraints or focus areas." rows={2} />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <Button type="submit" disabled={!subject || !yearGroup || !topic} className="w-full">Generate worksheet</Button>
        </form>
      </WorkflowForm>
    </AppShell>
  );
}
