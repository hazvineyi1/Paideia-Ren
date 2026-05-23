import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Worksheet } from "@/lib/types";
import { WorksheetView as Renderer } from "@/components/Renderers";
import { AssignDialog } from "@/components/AssignDialog";
import { Printer, Trash2, Share2, Eye, EyeOff } from "lucide-react";
import { ShareResourceDialog } from "@/components/ShareResourceDialog";

export default function WorksheetView() {
  const [, params] = useRoute<{ id: string }>("/worksheets/:id");
  const [, setLoc] = useLocation();
  const [w, setW] = useState<Worksheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [studentView, setStudentView] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    void api.get<{ worksheet: Worksheet }>(`/worksheets/${params.id}`)
      .then((r) => setW(r.worksheet))
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <AppShell><p className="text-muted-foreground">Loading.</p></AppShell>;
  if (!w) return <AppShell><p>Worksheet not found.</p></AppShell>;

  const onDelete = async () => {
    if (!confirm("Delete this worksheet?")) return;
    await api.del(`/worksheets/${w.id}`);
    setLoc("/dashboard");
  };

  return (
    <AppShell>
      <header className="mb-8 flex items-start justify-between gap-4 no-print">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Worksheet · {w.subject} · {w.yearGroup} · {w.difficulty} · {w.questionCount} questions{studentView ? " · student view" : ""}
          </div>
          <h1 className="font-serif text-4xl text-primary">{w.title}</h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={() => setAssignOpen(true)}><Share2 className="h-4 w-4 mr-1" />Assign to a class</Button>
          <Button variant={studentView ? "default" : "outline"} size="sm" aria-pressed={studentView} aria-label={studentView ? "Currently in student view, switch to teacher view" : "Currently in teacher view, switch to student view"} onClick={() => setStudentView((v) => !v)}>
            {studentView ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {studentView ? "Teacher view" : "Student view"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" />Print</Button>
          <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}><Share2 className="h-4 w-4 mr-1" />Share</Button>
          <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
        </div>
      </header>
      <div className="bg-card border rounded-lg p-8 print-page">
        <Renderer c={w.content} studentView={studentView} />
      </div>
      <AssignDialog open={assignOpen} onClose={() => setAssignOpen(false)} resourceKind="worksheet" resourceId={w.id} resourceTitle={w.title} />
      <ShareResourceDialog open={shareOpen} onOpenChange={setShareOpen} resourceType="worksheet" resourceId={w.id} resourceTitle={w.title} />
    </AppShell>
  );
}
