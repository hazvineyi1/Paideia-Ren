import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Quiz } from "@/lib/types";
import { QuizView as Renderer } from "@/components/Renderers";
import { AssignDialog } from "@/components/AssignDialog";
import { Printer, Trash2, Share2, Send } from "lucide-react";
import { ShareResourceDialog } from "@/components/ShareResourceDialog";

export default function QuizView() {
  const [, params] = useRoute<{ id: string }>("/quizzes/:id");
  const [, setLoc] = useLocation();
  const [q, setQ] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    void api.get<{ quiz: Quiz }>(`/quizzes/${params.id}`)
      .then((r) => setQ(r.quiz))
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <AppShell><p className="text-muted-foreground">Loading.</p></AppShell>;
  if (!q) return <AppShell><p>Quiz not found.</p></AppShell>;

  const onDelete = async () => {
    if (!confirm("Delete this quiz?")) return;
    await api.del(`/quizzes/${q.id}`);
    setLoc("/dashboard");
  };

  return (
    <AppShell>
      <header className="mb-8 flex items-start justify-between gap-4 no-print">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            {q.format} · {q.subject} · {q.yearGroup}
          </div>
          <h1 className="font-serif text-4xl text-primary">{q.title}</h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={() => setAssignOpen(true)}><Send className="h-4 w-4 mr-1" />Assign to a class</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" />Print</Button>
          <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}><Share2 className="h-4 w-4 mr-1" />Share</Button>
          <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
        </div>
      </header>
      <div className="bg-card border rounded-lg p-8 print-page">
        <Renderer c={q.content} />
      </div>
      <AssignDialog open={assignOpen} onClose={() => setAssignOpen(false)} resourceKind="quiz" resourceId={q.id} resourceTitle={q.title} />
      <ShareResourceDialog open={shareOpen} onOpenChange={setShareOpen} resourceType="quiz" resourceId={q.id} resourceTitle={q.title} />
    </AppShell>
  );
}
