import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Assignment, Submission, Student, ClassRow } from "@/lib/types";
import { Copy, Check, Link as LinkIcon } from "lucide-react";

interface Resp {
  assignment: Assignment;
  class: ClassRow;
  submissions: Array<{ submission: Submission; student: Student | null }>;
}

export default function AssignmentView() {
  const [, params] = useRoute<{ id: string }>("/assignments/:id");
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    if (!params?.id) return;
    const r = await api.get<Resp>(`/assignments/${params.id}`);
    setData(r);
    setLoading(false);
  };
  useEffect(() => { void load(); }, [params?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <AppShell><p className="text-muted-foreground">Loading.</p></AppShell>;
  if (!data) return <AppShell><p>Assignment not found.</p></AppShell>;

  const a = data.assignment;
  const url = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/take/${a.shareCode}`;

  const toggleClosed = async () => {
    await api.patch(`/assignments/${a.id}`, { closed: !a.closed });
    await load();
  };

  return (
    <AppShell>
      <header className="mb-8">
        <Link href={`/classes/${a.classId}`} className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary">Back to {data.class.name}</Link>
        <h1 className="font-serif text-4xl text-primary mt-1">{a.title}</h1>
        <p className="text-muted-foreground">{a.resourceKind} · {a.deliveryMode === "share_link" ? "Share link" : "Student accounts"}{a.closed ? " · closed" : ""}</p>
      </header>

      {a.deliveryMode === "share_link" && (
        <div className="mb-8 bg-secondary/40 border rounded-md p-4">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium"><LinkIcon className="h-4 w-4" />Share link</div>
          <div className="flex items-center gap-2">
            <code className="text-xs flex-1 truncate bg-background border rounded px-2 py-1.5">{url}</code>
            <Button size="sm" variant="outline" onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      )}

      <div className="mb-8 flex gap-2">
        <Button variant="outline" size="sm" onClick={toggleClosed}>{a.closed ? "Re-open assignment" : "Close assignment"}</Button>
      </div>

      <section>
        <h2 className="font-serif text-2xl text-primary mb-4">Submissions ({data.submissions.length})</h2>
        {data.submissions.length === 0 ? (
          <div className="bg-card border rounded-lg p-6 text-center text-muted-foreground text-sm">
            No submissions yet.
          </div>
        ) : (
          <div className="divide-y border rounded-lg bg-card">
            {data.submissions.map(({ submission, student }) => {
              const pct = submission.maxAutoScore > 0 ? Math.round((submission.autoScore / submission.maxAutoScore) * 100) : null;
              return (
                <div key={submission.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    {student ? (
                      <Link href={`/classes/${a.classId}/students/${student.id}`} className="font-medium hover:text-primary">{submission.displayName}</Link>
                    ) : (
                      <div className="font-medium">{submission.displayName}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(submission.submittedAt).toLocaleString()}
                      {submission.needsReviewCount > 0 && <> · {submission.needsReviewCount} items need review</>}
                    </div>
                  </div>
                  <div className="text-right">
                    {pct !== null ? <div className="font-serif text-2xl text-primary">{pct}%</div> : <div className="text-sm text-muted-foreground">Needs review</div>}
                    <div className="text-xs text-muted-foreground">{submission.autoScore}/{submission.maxAutoScore} auto</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
