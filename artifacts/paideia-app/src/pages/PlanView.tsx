import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { LessonPlan } from "@/lib/types";
import { LessonPlanView } from "@/components/Renderers";
import { Printer, Trash2 } from "lucide-react";

export default function PlanView() {
  const [, params] = useRoute<{ id: string }>("/plans/:id");
  const [, setLoc] = useLocation();
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    void api.get<{ plan: LessonPlan }>(`/plans/${params.id}`)
      .then((r) => setPlan(r.plan))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const onDelete = async () => {
    if (!plan) return;
    if (!confirm("Delete this lesson plan?")) return;
    await api.del(`/plans/${plan.id}`);
    setLoc("/dashboard");
  };

  if (loading) return <AppShell><p className="text-muted-foreground">Loading.</p></AppShell>;
  if (!plan) return <AppShell><p>Plan not found.</p></AppShell>;

  return (
    <AppShell>
      <header className="mb-8 flex items-start justify-between gap-4 no-print">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Lesson plan · {plan.subject} · {plan.yearGroup} · {plan.durationMinutes} min
          </div>
          <h1 className="font-serif text-4xl text-primary">{plan.title}</h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" />Print</Button>
          <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
        </div>
      </header>
      <div className="bg-card border rounded-lg p-8 print-page">
        <LessonPlanView c={plan.content} />
      </div>
    </AppShell>
  );
}
