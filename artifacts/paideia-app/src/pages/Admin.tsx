import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type {
  AdminStats,
  AdminEngagement,
  AdminProduct,
  AdminAiUsage,
  AdminPilots,
  AdminPilot,
  PilotStatus,
} from "@/lib/types";

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="border rounded-lg bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-serif text-3xl text-primary mt-1">{value}</div>
      {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
    </div>
  );
}

function fmtUsd(v: number): string {
  if (v >= 100) return `$${v.toFixed(0)}`;
  return `$${v.toFixed(2)}`;
}

function fmtNum(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}

function Bar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="h-3 bg-muted rounded">
      <div className="h-full rounded" style={{ width: `${pct}%`, background: color ?? "var(--primary)" }} />
    </div>
  );
}

function statusColor(s: string): string {
  switch (s) {
    case "new": return "bg-blue-100 text-blue-800";
    case "contacted": return "bg-amber-100 text-amber-800";
    case "scheduled": return "bg-purple-100 text-purple-800";
    case "in_pilot": return "bg-teal-100 text-teal-800";
    case "won": return "bg-green-100 text-green-800";
    case "lost": return "bg-rose-100 text-rose-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

const PILOT_STATUSES: PilotStatus[] = ["new", "contacted", "scheduled", "in_pilot", "won", "lost"];

export default function Admin() {
  const { teacher, loading: authLoading } = useAuth();
  const [, setLoc] = useLocation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [engagement, setEngagement] = useState<AdminEngagement | null>(null);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [aiUsage, setAiUsage] = useState<AdminAiUsage | null>(null);
  const [pilots, setPilots] = useState<AdminPilots | null>(null);
  const [pilotFilter, setPilotFilter] = useState<string>("all");
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
    Promise.all([
      api.get<AdminStats>("/admin/stats"),
      api.get<AdminEngagement>("/admin/engagement"),
      api.get<AdminProduct>("/admin/product"),
      api.get<AdminAiUsage>("/admin/ai-usage"),
      api.get<AdminPilots>("/admin/pilots"),
    ])
      .then(([s, e, p, a, pl]) => {
        setStats(s);
        setEngagement(e);
        setProduct(p);
        setAiUsage(a);
        setPilots(pl);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [teacher, authLoading, setLoc]);

  async function reloadPilots(status: string) {
    const path = status === "all" ? "/admin/pilots" : `/admin/pilots?status=${encodeURIComponent(status)}`;
    const r = await api.get<AdminPilots>(path);
    setPilots(r);
  }

  async function updatePilot(id: string, patch: { status?: PilotStatus; notes?: string | null }) {
    await api.patch(`/admin/pilots/${id}`, patch);
    await reloadPilots(pilotFilter);
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-primary">Founder dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Engagement, product use, AI cost, and pilot pipeline at a glance.
            </p>
          </div>
          <div className="flex gap-2">
            <a href="/api/copilot/admin/export/pilots.csv" className="text-sm underline text-primary" data-track="admin_export" data-track-kind="pilots">
              Export pilots CSV
            </a>
            <a href="/api/copilot/admin/export/teachers.csv" className="text-sm underline text-primary" data-track="admin_export" data-track-kind="teachers">
              Export teachers CSV
            </a>
            <a href="/api/copilot/admin/export/events.csv" className="text-sm underline text-primary" data-track="admin_export" data-track-kind="events">
              Export events CSV
            </a>
            <a href="/api/copilot/admin/export/ai-usage.csv" className="text-sm underline text-primary" data-track="admin_export" data-track-kind="ai_usage">
              Export AI usage CSV
            </a>
          </div>
        </div>

        {error ? <div className="mt-8 p-4 border rounded bg-rose-50 text-rose-800">{error}</div> : null}
        {loading ? <div className="mt-8 text-muted-foreground">Loading founder analytics.</div> : null}

        {!loading && stats ? (
          <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="overview" data-track="admin_tab" data-track-tab="overview">Overview</TabsTrigger>
              <TabsTrigger value="engagement" data-track="admin_tab" data-track-tab="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="product" data-track="admin_tab" data-track-tab="product">Product</TabsTrigger>
              <TabsTrigger value="ai" data-track="admin_tab" data-track-tab="ai">AI usage</TabsTrigger>
              <TabsTrigger value="pilots" data-track="admin_tab" data-track-tab="pilots">Pilots</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <OverviewTab stats={stats} />
            </TabsContent>

            <TabsContent value="engagement" className="mt-6">
              {engagement ? <EngagementTab data={engagement} /> : null}
            </TabsContent>

            <TabsContent value="product" className="mt-6">
              {product ? <ProductTab data={product} /> : null}
            </TabsContent>

            <TabsContent value="ai" className="mt-6">
              {aiUsage ? <AiTab data={aiUsage} /> : null}
            </TabsContent>

            <TabsContent value="pilots" className="mt-6">
              {pilots ? (
                <PilotsTab
                  data={pilots}
                  filter={pilotFilter}
                  onFilter={(v) => {
                    setPilotFilter(v);
                    void reloadPilots(v);
                  }}
                  onUpdate={updatePilot}
                />
              ) : null}
            </TabsContent>
          </Tabs>
        ) : null}
      </div>
    </AppShell>
  );
}

function OverviewTab({ stats }: { stats: AdminStats }) {
  const maxWeekly = Math.max(1, ...stats.weeklyActivity.map((w) => w.resources + w.submissions));
  const maxDaily = Math.max(1, ...stats.dailyActivity.map((d) => d.activeTeachers));
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Teachers" value={stats.totals.teachers} hint={`${stats.totals.activeTeachersThisWeek} active this week`} />
        <Stat label="Active today" value={stats.totals.activeTeachersToday} />
        <Stat label="Resources" value={fmtNum(stats.totals.lessonPlans + stats.totals.worksheets + stats.totals.quizzes + stats.totals.parentDrafts)} hint="Plans, worksheets, quizzes, drafts" />
        <Stat label="Submissions" value={fmtNum(stats.totals.submissions)} />
        <Stat label="Classes" value={stats.totals.classes} hint={`${stats.totals.students} students`} />
        <Stat label="Pilot requests" value={stats.totals.pilotRequests} />
        <Stat label="AI cost (all time)" value={fmtUsd(stats.totals.aiCostUsd)} hint={`${fmtNum(stats.totals.aiCalls)} calls, ${fmtNum(stats.totals.aiTokens)} tokens`} />
        <Stat label="Events captured" value={fmtNum(stats.totals.events)} />
      </div>

      <div>
        <h2 className="font-serif text-xl text-primary mb-3">Signup funnel</h2>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Signed up" value={stats.signupFunnel.signups} />
          <Stat label="Created a resource" value={stats.signupFunnel.createdResource} hint={pctHint(stats.signupFunnel.createdResource, stats.signupFunnel.signups)} />
          <Stat label="Returned after week 1" value={stats.signupFunnel.returnedAfterWeek} hint={pctHint(stats.signupFunnel.returnedAfterWeek, stats.signupFunnel.signups)} />
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-primary mb-3">Daily active teachers (last 30 days)</h2>
        <div className="border rounded-lg bg-card p-4 space-y-1">
          {stats.dailyActivity.map((d) => (
            <div key={d.day} className="flex items-center gap-3 text-xs">
              <span className="w-24 text-muted-foreground">{new Date(d.day).toLocaleDateString()}</span>
              <div className="flex-1"><Bar value={d.activeTeachers} max={maxDaily} /></div>
              <span className="w-12 text-right tabular-nums">{d.activeTeachers}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-primary mb-3">Weekly activity (last 4 weeks)</h2>
        <div className="border rounded-lg bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr><th className="text-left p-3">Week of</th><th className="text-right p-3">New teachers</th><th className="text-right p-3">Resources</th><th className="text-right p-3">Submissions</th><th className="p-3">Volume</th></tr>
            </thead>
            <tbody>
              {stats.weeklyActivity.map((w) => (
                <tr key={w.weekStart} className="border-t">
                  <td className="p-3">{new Date(w.weekStart).toLocaleDateString()}</td>
                  <td className="p-3 text-right tabular-nums">{w.teachers}</td>
                  <td className="p-3 text-right tabular-nums">{w.resources}</td>
                  <td className="p-3 text-right tabular-nums">{w.submissions}</td>
                  <td className="p-3 w-1/3"><Bar value={w.resources + w.submissions} max={maxWeekly} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-primary mb-3">Recent signups</h2>
        <div className="border rounded-lg bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">School</th><th className="text-left p-3">Region</th><th className="text-left p-3">When</th></tr></thead>
            <tbody>
              {stats.recentSignups.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3"><div className="font-medium">{t.name}</div><div className="text-xs text-muted-foreground">{t.email}</div></td>
                  <td className="p-3">{t.schoolName ?? "-"}{t.country ? ` · ${t.country}` : ""}</td>
                  <td className="p-3">{t.region}</td>
                  <td className="p-3 text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function pctHint(n: number, d: number): string {
  if (d === 0) return "no signups yet";
  return `${Math.round((n / d) * 100)}% of signups`;
}

function EngagementTab({ data }: { data: AdminEngagement }) {
  const maxFeature = Math.max(1, ...data.featureUsage.map((f) => f.total));
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-xl text-primary mb-3">Weekly retention cohorts</h2>
        <div className="border rounded-lg bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Cohort week</th>
                <th className="text-right p-3">Size</th>
                {Array.from({ length: 8 }).map((_, i) => (
                  <th key={i} className="text-right p-3">W{i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.retentionCohorts.map((c) => (
                <tr key={c.weekStart} className="border-t">
                  <td className="p-3">{new Date(c.weekStart).toLocaleDateString()}</td>
                  <td className="p-3 text-right tabular-nums">{c.size}</td>
                  {Array.from({ length: 8 }).map((_, i) => {
                    const v = c.retention[i] ?? 0;
                    const pct = c.size > 0 ? Math.round((v / c.size) * 100) : 0;
                    const intensity = Math.min(1, pct / 100);
                    return (
                      <td key={i} className="p-3 text-right tabular-nums" style={{ background: v ? `rgba(31,42,92,${0.08 + intensity * 0.5})` : undefined }}>
                        {v ? `${pct}%` : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">W0 is the cohort week. WN is the % of that cohort active in week N.</p>
      </div>

      <div>
        <h2 className="font-serif text-xl text-primary mb-3">Feature usage</h2>
        <div className="border rounded-lg bg-card p-4 space-y-2">
          {data.featureUsage.map((f) => (
            <div key={f.feature} className="flex items-center gap-3 text-sm">
              <span className="w-32 capitalize">{f.feature.replace(/_/g, " ")}</span>
              <div className="flex-1"><Bar value={f.total} max={maxFeature} /></div>
              <span className="w-32 text-right text-muted-foreground tabular-nums">{f.total} · {f.uniqueTeachers} teachers</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-primary mb-3">Teacher leaderboard</h2>
        <div className="border rounded-lg bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Teacher</th>
                <th className="text-right p-3">Plans</th>
                <th className="text-right p-3">Sheets</th>
                <th className="text-right p-3">Quizzes</th>
                <th className="text-right p-3">Drafts</th>
                <th className="text-right p-3">Assigns</th>
                <th className="text-right p-3">Events</th>
                <th className="text-left p-3">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {data.teacherLeaderboard.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.email}{t.schoolName ? ` · ${t.schoolName}` : ""}</div>
                  </td>
                  <td className="p-3 text-right tabular-nums">{t.lessonPlans}</td>
                  <td className="p-3 text-right tabular-nums">{t.worksheets}</td>
                  <td className="p-3 text-right tabular-nums">{t.quizzes}</td>
                  <td className="p-3 text-right tabular-nums">{t.parentDrafts}</td>
                  <td className="p-3 text-right tabular-nums">{t.assignments}</td>
                  <td className="p-3 text-right tabular-nums">{t.events}</td>
                  <td className="p-3 text-muted-foreground">{t.lastSeen ? new Date(t.lastSeen).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductTab({ data }: { data: AdminProduct }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-xl text-primary mb-3">Surface mix (last 30 days)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.surfaceBreakdown.map((s) => (
            <Stat key={s.label} label={s.label} value={fmtNum(s.count)} hint={`${fmtNum(s.uniqueUsers)} unique`} />
          ))}
        </div>
      </div>
      <TopList title="Top events (last 30 days)" items={data.topEvents} />
      <TopList title="Top pages: teacher app" items={data.topPagesApp} />
      <TopList title="Top pages: marketing site" items={data.topPagesSite} />
    </div>
  );
}

function TopList({ title, items }: { title: string; items: { label: string; surface: string | null; count: number; uniqueUsers: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div>
      <h2 className="font-serif text-xl text-primary mb-3">{title}</h2>
      <div className="border rounded-lg bg-card p-4 space-y-1">
        {items.length === 0 ? <div className="text-sm text-muted-foreground">No data yet.</div> : null}
        {items.map((i, idx) => (
          <div key={`${i.label}-${i.surface ?? "all"}-${idx}`} className="flex items-center gap-3 text-sm">
            <span className="flex-1 truncate" title={i.label}>
              {i.label || "(empty)"}
              {i.surface ? <span className="ml-2 text-xs text-muted-foreground">{i.surface}</span> : null}
            </span>
            <div className="w-1/3"><Bar value={i.count} max={max} /></div>
            <span className="w-28 text-right text-muted-foreground tabular-nums">{i.count} · {i.uniqueUsers} u</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiTab({ data }: { data: AdminAiUsage }) {
  const maxDaily = Math.max(1, ...data.daily.map((d) => d.costUsd));
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total cost" value={fmtUsd(data.totals.costUsd)} hint={`${fmtNum(data.totals.calls)} calls`} />
        <Stat label="Successful" value={fmtNum(data.totals.successful)} hint={`${data.totals.failed} failed`} />
        <Stat label="Total tokens" value={fmtNum(data.totals.totalTokens)} hint={`${fmtNum(data.totals.promptTokens)} in / ${fmtNum(data.totals.completionTokens)} out`} />
        <Stat label="Avg latency" value={`${data.totals.avgLatencyMs} ms`} />
      </div>

      <div>
        <h2 className="font-serif text-xl text-primary mb-3">Daily AI spend (last 30 days)</h2>
        <div className="border rounded-lg bg-card p-4 space-y-1">
          {data.daily.map((d) => (
            <div key={d.day} className="flex items-center gap-3 text-xs">
              <span className="w-24 text-muted-foreground">{new Date(d.day).toLocaleDateString()}</span>
              <div className="flex-1"><Bar value={d.costUsd} max={maxDaily} color="var(--accent, #C9971C)" /></div>
              <span className="w-20 text-right tabular-nums">{fmtUsd(d.costUsd)}</span>
              <span className="w-12 text-right text-muted-foreground tabular-nums">{d.calls}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-primary mb-3">By feature</h2>
        <div className="border rounded-lg bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left p-3">Kind</th><th className="text-right p-3">Calls</th><th className="text-right p-3">Tokens</th><th className="text-right p-3">Cost</th></tr></thead>
            <tbody>
              {data.byKind.map((k) => (
                <tr key={k.kind} className="border-t">
                  <td className="p-3 capitalize">{k.kind.replace(/_/g, " ")}</td>
                  <td className="p-3 text-right tabular-nums">{k.calls}</td>
                  <td className="p-3 text-right tabular-nums">{fmtNum(k.tokens)}</td>
                  <td className="p-3 text-right tabular-nums">{fmtUsd(k.costUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-primary mb-3">Top teachers by AI spend</h2>
        <div className="border rounded-lg bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left p-3">Teacher</th><th className="text-right p-3">Calls</th><th className="text-right p-3">Tokens</th><th className="text-right p-3">Cost</th></tr></thead>
            <tbody>
              {data.byTeacher.map((t, idx) => (
                <tr key={t.id ?? `unknown-${idx}`} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.email ?? ""}{t.schoolName ? ` · ${t.schoolName}` : ""}</div>
                  </td>
                  <td className="p-3 text-right tabular-nums">{t.calls}</td>
                  <td className="p-3 text-right tabular-nums">{fmtNum(t.tokens)}</td>
                  <td className="p-3 text-right tabular-nums">{fmtUsd(t.costUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PilotsTab({
  data,
  filter,
  onFilter,
  onUpdate,
}: {
  data: AdminPilots;
  filter: string;
  onFilter: (v: string) => void;
  onUpdate: (id: string, patch: { status?: PilotStatus; notes?: string | null }) => Promise<void>;
}) {
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of data.statusCounts) m.set(s.status, s.count);
    return m;
  }, [data.statusCounts]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {PILOT_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onFilter(s)}
            data-track="admin_pilot_filter"
            data-track-status={s}
            className={`border rounded-lg p-4 text-left transition ${filter === s ? "ring-2 ring-primary" : "hover:bg-muted/40"}`}
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.replace(/_/g, " ")}</div>
            <div className="font-serif text-2xl text-primary mt-1">{counts.get(s) ?? 0}</div>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => onFilter("all")} data-track="admin_pilot_filter" data-track-status="all">
          All ({data.pilots.length})
        </Button>
      </div>

      <div className="space-y-3">
        {data.pilots.length === 0 ? (
          <div className="border rounded-lg bg-card p-6 text-muted-foreground">No pilot requests match this filter.</div>
        ) : null}
        {data.pilots.map((p) => (
          <PilotCard key={p.id} pilot={p} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}

function PilotCard({
  pilot,
  onUpdate,
}: {
  pilot: AdminPilot;
  onUpdate: (id: string, patch: { status?: PilotStatus; notes?: string | null }) => Promise<void>;
}) {
  const [notes, setNotes] = useState(pilot.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function setStatus(s: PilotStatus) {
    setSaving(true);
    try { await onUpdate(pilot.id, { status: s }); } finally { setSaving(false); }
  }

  async function saveNotes() {
    setSaving(true);
    try { await onUpdate(pilot.id, { notes: notes || null }); } finally { setSaving(false); }
  }

  return (
    <div className="border rounded-lg bg-card p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-medium text-lg">{pilot.contactName}</div>
            <Badge className={statusColor(pilot.status)}>{pilot.status.replace(/_/g, " ")}</Badge>
            <span className="text-xs text-muted-foreground">source: {pilot.source}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            <a className="underline" href={`mailto:${pilot.contactEmail}`}>{pilot.contactEmail}</a>
            {pilot.organization ? ` · ${pilot.organization}` : ""}
            {pilot.schoolName ? ` · ${pilot.schoolName}` : ""}
            {pilot.country ? ` · ${pilot.country}` : ""}
            {pilot.gradeLevels ? ` · ${pilot.gradeLevels}` : ""}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Received {new Date(pilot.createdAt).toLocaleString()}
            {pilot.contactedAt ? ` · Contacted ${new Date(pilot.contactedAt).toLocaleString()}` : ""}
          </div>
          {pilot.sourcePath || pilot.sourceReferrer || pilot.sourceUtm ? (
            <div className="text-xs text-muted-foreground mt-1">
              {pilot.sourcePath ? <>From <code>{pilot.sourcePath}</code> </> : null}
              {pilot.sourceReferrer ? <>via <code>{pilot.sourceReferrer}</code> </> : null}
              {pilot.sourceUtm ? <>utm: <code>{JSON.stringify(pilot.sourceUtm)}</code></> : null}
            </div>
          ) : null}
        </div>
        <div className="w-56">
          <Select value={pilot.status} onValueChange={(v) => void setStatus(v as PilotStatus)} disabled={saving}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PILOT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {pilot.message ? (
        <div className="mt-3 text-sm whitespace-pre-wrap p-3 bg-muted/40 rounded">{pilot.message}</div>
      ) : null}
      <div className="mt-3">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Founder notes</label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Add notes about this lead (next step, decision-maker, timing)." className="mt-1" />
        <div className="flex justify-end mt-2">
          <Button size="sm" onClick={() => void saveNotes()} disabled={saving} data-track="admin_pilot_save_notes">Save notes</Button>
        </div>
      </div>
    </div>
  );
}
