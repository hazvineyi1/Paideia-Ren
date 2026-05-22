import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { AdminStats } from "@/lib/types";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border rounded-lg bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-serif text-3xl text-primary mt-1">{value}</div>
    </div>
  );
}

export default function Admin() {
  const { teacher, loading: authLoading } = useAuth();
  const [, setLoc] = useLocation();
  const [data, setData] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!teacher) {
      setLoc("/login");
      return;
    }
    if (!teacher.isAdmin) {
      setError("This page is for the founder admin account only.");
      setLoading(false);
      return;
    }
    api
      .get<AdminStats>("/admin/stats")
      .then((r) => setData(r))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [teacher, authLoading, setLoc]);

  if (authLoading || loading) {
    return <AppShell><p className="text-muted-foreground">Loading.</p></AppShell>;
  }
  if (error) {
    return <AppShell><div className="max-w-xl"><h1 className="font-serif text-2xl text-primary mb-2">Admin</h1><p className="text-muted-foreground">{error}</p></div></AppShell>;
  }
  if (!data) return null;

  const t = data.totals;
  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="font-serif text-3xl text-primary">Founder admin</h1>
          <p className="text-muted-foreground">A simple view of who is using Classroom Companion and what they are doing. Use this to decide when to introduce paid plans.</p>
        </div>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Headline numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Teachers signed up" value={t.teachers} />
            <Stat label="Active this week" value={t.activeTeachersThisWeek} />
            <Stat label="Pilot requests" value={t.pilotRequests} />
            <Stat label="Classes" value={t.classes} />
            <Stat label="Students" value={t.students} />
            <Stat label="Lesson plans" value={t.lessonPlans} />
            <Stat label="Worksheets" value={t.worksheets} />
            <Stat label="Quizzes" value={t.quizzes} />
            <Stat label="Parent updates" value={t.parentDrafts} />
            <Stat label="Assignments" value={t.assignments} />
            <Stat label="Submissions" value={t.submissions} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Last four weeks</h2>
          <div className="border rounded-lg bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-muted-foreground text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Week starting</th>
                  <th className="px-4 py-2 font-medium">New teachers</th>
                  <th className="px-4 py-2 font-medium">Resources created</th>
                  <th className="px-4 py-2 font-medium">Student submissions</th>
                </tr>
              </thead>
              <tbody>
                {data.weeklyActivity.map((w) => (
                  <tr key={w.weekStart} className="border-t">
                    <td className="px-4 py-2">{new Date(w.weekStart).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</td>
                    <td className="px-4 py-2">{w.teachers}</td>
                    <td className="px-4 py-2">{w.resources}</td>
                    <td className="px-4 py-2">{w.submissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent teacher sign-ups</h2>
          {data.recentSignups.length === 0 ? (
            <p className="text-muted-foreground">No teachers yet.</p>
          ) : (
            <div className="border rounded-lg bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-muted-foreground text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Email</th>
                    <th className="px-4 py-2 font-medium">School</th>
                    <th className="px-4 py-2 font-medium">Country</th>
                    <th className="px-4 py-2 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSignups.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{s.email}</td>
                      <td className="px-4 py-2">{s.schoolName ?? "—"}</td>
                      <td className="px-4 py-2">{s.country ?? "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent pilot requests</h2>
          {data.recentPilotRequests.length === 0 ? (
            <p className="text-muted-foreground">No pilot requests yet. The marketing site is the source of these.</p>
          ) : (
            <div className="space-y-3">
              {data.recentPilotRequests.map((p) => (
                <div key={p.id} className="border rounded-lg bg-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{p.contactName} <span className="text-muted-foreground font-normal">({p.contactEmail})</span></div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {[p.schoolName, p.organization, p.gradeLevels, p.country].filter(Boolean).join(" · ") || "No school details provided"}
                      </div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">Source: {p.source}</div>
                      {p.message && <p className="text-sm mt-3 whitespace-pre-wrap">{p.message}</p>}
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">{new Date(p.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
