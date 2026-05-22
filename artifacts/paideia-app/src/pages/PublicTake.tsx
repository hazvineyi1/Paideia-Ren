import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, ApiError } from "@/lib/api";
import { Check, X, HelpCircle } from "lucide-react";

interface WorksheetQ { number: number; prompt: string; type: string; options: string[] | null }
interface QuizI { number: number; prompt: string; type: string; options: string[] | null }
interface ResourceContent { title?: string; instructions?: string; questions?: WorksheetQ[]; items?: QuizI[] }
interface ShareResp {
  assignment: { id: string; title: string; resourceKind: "worksheet" | "quiz"; shareCode: string };
  class: { name: string };
  resource: ResourceContent;
  students: Array<{ id: string; firstName: string; lastInitial: string }>;
}
interface ResultFeedback { number: number; given: string; correct: string | null; state: "correct" | "incorrect" | "needs_review" }
interface SubmitResp { submission: { autoScore: number; maxAutoScore: number; needsReviewCount: number; feedback: ResultFeedback[] } }

export default function PublicTake() {
  const [, params] = useRoute<{ code: string }>("/take/:code");
  const [data, setData] = useState<ShareResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SubmitResp["submission"] | null>(null);

  useEffect(() => {
    if (!params?.code) return;
    api.get<ShareResp>(`/share/${params.code}`)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof ApiError ? e.message : "Could not load"))
      .finally(() => setLoading(false));
  }, [params?.code]);

  const submit = async () => {
    if (!studentId) { setError("Please pick your name from the list."); return; }
    setBusy(true); setError(null);
    try {
      const r = await api.post<SubmitResp>(`/share/${params?.code}/submit`, { studentId, answers });
      setResult(r.submission);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to submit");
    } finally { setBusy(false); }
  };

  if (loading) return <Shell><p className="text-muted-foreground">Loading.</p></Shell>;
  if (error && !data) return <Shell><p className="text-destructive">{error}</p></Shell>;
  if (!data) return <Shell><p>Assignment not found.</p></Shell>;

  if (result) {
    const pct = result.maxAutoScore > 0 ? Math.round((result.autoScore / result.maxAutoScore) * 100) : null;
    return (
      <Shell>
        <div className="bg-card border rounded-lg p-8 text-center">
          <h1 className="font-serif text-3xl text-primary mb-2">Submitted</h1>
          <p className="text-muted-foreground mb-6">Your teacher will see your result.</p>
          {pct !== null && (
            <div className="mb-6">
              <div className="font-serif text-6xl text-primary">{pct}%</div>
              <div className="text-sm text-muted-foreground mt-1">{result.autoScore} out of {result.maxAutoScore} auto-marked</div>
            </div>
          )}
          {result.needsReviewCount > 0 && (
            <p className="text-sm text-muted-foreground mb-6">{result.needsReviewCount} of your answers need your teacher to mark them.</p>
          )}
        </div>
        <div className="mt-8">
          <h2 className="font-serif text-xl text-primary mb-3">Your answers</h2>
          <div className="space-y-3">
            {result.feedback.map((f) => (
              <FeedbackRow key={f.number} f={f} />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  const items = data.resource.items ?? data.resource.questions ?? [];

  return (
    <Shell>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{data.class.name}</p>
        <h1 className="font-serif text-3xl text-primary">{data.assignment.title}</h1>
        {data.resource.instructions && <p className="text-muted-foreground mt-2">{data.resource.instructions}</p>}
      </header>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <Label>Who are you?</Label>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger className="mt-2"><SelectValue placeholder="Pick your name" /></SelectTrigger>
          <SelectContent>
            {data.students.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastInitial}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">If your name is not here, tell your teacher.</p>
      </div>

      <ol className="space-y-6">
        {items.map((q) => (
          <li key={q.number} className="bg-card border rounded-lg p-5">
            <div className="font-medium mb-3"><span className="text-primary">{q.number}.</span> {q.prompt}</div>
            {q.type === "multiple_choice" && q.options ? (
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-secondary/40">
                    <input
                      type="radio"
                      name={`q-${q.number}`}
                      value={opt}
                      checked={answers[String(q.number)] === opt}
                      onChange={() => setAnswers((a) => ({ ...a, [String(q.number)]: opt }))}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : q.type === "true_false" ? (
              <div className="flex gap-3">
                {["True", "False"].map((v) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-secondary/40 border flex-1 justify-center">
                    <input
                      type="radio"
                      name={`q-${q.number}`}
                      value={v}
                      checked={answers[String(q.number)] === v}
                      onChange={() => setAnswers((a) => ({ ...a, [String(q.number)]: v }))}
                    />
                    {v}
                  </label>
                ))}
              </div>
            ) : q.type === "short" || q.type === "short_answer" || q.type === "calculation" ? (
              <Input
                value={answers[String(q.number)] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [String(q.number)]: e.target.value }))}
                placeholder="Your answer"
              />
            ) : (
              <Textarea
                value={answers[String(q.number)] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [String(q.number)]: e.target.value }))}
                rows={4}
                placeholder="Your answer"
              />
            )}
          </li>
        ))}
      </ol>

      {error && <div className="text-sm text-destructive mt-4">{error}</div>}
      <div className="mt-6">
        <Button onClick={submit} disabled={busy} size="lg" className="w-full">{busy ? "Submitting..." : "Submit answers"}</Button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="font-serif text-xl text-primary">Paideia-Ren</div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}

function FeedbackRow({ f }: { f: ResultFeedback }) {
  const Icon = f.state === "correct" ? Check : f.state === "incorrect" ? X : HelpCircle;
  const color = f.state === "correct" ? "text-green-700" : f.state === "incorrect" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="bg-card border rounded-md p-3 flex items-start gap-3 text-sm">
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">Q{f.number}</div>
        <div>You answered: <span className="font-medium">{f.given || "(blank)"}</span></div>
        {f.state === "incorrect" && f.correct && <div className="text-xs text-muted-foreground mt-1">Correct answer: {f.correct}</div>}
        {f.state === "needs_review" && <div className="text-xs text-muted-foreground mt-1">Your teacher will mark this.</div>}
      </div>
    </div>
  );
}
