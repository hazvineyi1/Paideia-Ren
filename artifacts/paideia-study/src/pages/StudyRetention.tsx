import { useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import {
  useListStudyFlashcards,
  useGetStudyProfile,
} from "@workspace/api-client-react";
import StudyNav from "@/components/StudyNav";
import { useStudyKnowledgeGraph } from "@/hooks/use-study-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Activity, Clock, Layers, AlertCircle, Sparkles,
  TrendingUp, Loader2, Headphones, Eye, FileText, Hand,
  Zap, Calendar, Target, ChevronRight, Info,
} from "lucide-react";

interface LearningStyleProfile {
  textPref: number;
  audioPref: number;
  visualPref: number;
  practicePref: number;
  pace?: string | null;
  preferredSessionMinutes?: number | null;
  focusMinutes?: number | null;
  motivationType?: string | null;
  aiSummary?: string | null;
}

function useLearningStyleProfile() {
  return useQuery<LearningStyleProfile | null>({
    queryKey: ["learningStyleProfile"],
    queryFn: () => customFetch<LearningStyleProfile | null>("/api/study/learning-style/profile"),
  });
}

function bandColor(m: number) {
  if (m < 0.4) return "bg-rose-500";
  if (m < 0.75) return "bg-amber-500";
  return "bg-emerald-500";
}

const PACE_META: Record<string, { label: string; desc: string }> = {
  deliberate: { label: "Deliberate", desc: "You learn carefully and thoroughly. The system spaces reviews wider and avoids overload." },
  moderate:   { label: "Moderate",   desc: "Balanced pacing. Standard intervals and difficulty progression." },
  quick:      { label: "Quick",      desc: "You pick things up fast. The system pushes difficulty earlier and tightens the spacing." },
};

const MODALITY_META = [
  { key: "textPref" as const,     label: "Reading",   icon: FileText,   color: "bg-blue-500"   },
  { key: "audioPref" as const,    label: "Audio",     icon: Headphones, color: "bg-purple-500" },
  { key: "visualPref" as const,   label: "Visual",    icon: Eye,        color: "bg-pink-500"   },
  { key: "practicePref" as const, label: "Practice",  icon: Hand,       color: "bg-emerald-500"},
];

export default function StudyRetention() {
  const [, setLoc] = useLocation();
  const kg = useStudyKnowledgeGraph();
  const styleQ = useLearningStyleProfile();
  const profileQ = useGetStudyProfile();
  const fcQ = useListStudyFlashcards();
  const { data: knowledge, isLoading: kgLoading } = kg;
  const { data: style, isLoading: styleLoading } = styleQ;
  const { data: profile, isLoading: profileLoading } = profileQ;
  const { data: flashcards, isLoading: fcLoading } = fcQ;

  const loading = kgLoading || styleLoading || profileLoading || fcLoading;
  const anyError = kg.isError || styleQ.isError || profileQ.isError || fcQ.isError;
  const retryAll = () => {
    kg.refetch(); styleQ.refetch(); profileQ.refetch(); fcQ.refetch();
  };

  // ─── Mastery summary ───
  const mastery = useMemo(() => {
    const nodes = (knowledge?.nodes ?? []).map((n) => ({
      label: n.label,
      m: typeof n.masteryLevel === "number" ? n.masteryLevel : 0,
    }));
    if (!nodes.length) return { avg: 0, total: 0, gaps: 0, developing: 0, strong: 0, top: [] as typeof nodes };
    let gaps = 0, dev = 0, strong = 0, sum = 0;
    for (const n of nodes) {
      sum += n.m;
      if (n.m < 0.4) gaps++;
      else if (n.m < 0.75) dev++;
      else strong++;
    }
    return {
      avg: sum / nodes.length,
      total: nodes.length,
      gaps, developing: dev, strong,
      top: [...nodes].sort((a, b) => b.m - a.m).slice(0, 5),
    };
  }, [knowledge]);

  // ─── Modality preferences (normalize to %) ───
  const modality = useMemo(() => {
    if (!style) return null;
    const raw = MODALITY_META.map((m) => ({ ...m, value: Math.max(0, style[m.key] ?? 0) }));
    const total = raw.reduce((s, x) => s + x.value, 0) || 1;
    return raw.map((m) => ({ ...m, pct: m.value / total }));
  }, [style]);

  const dominantModality = useMemo(() => {
    if (!modality) return null;
    return [...modality].sort((a, b) => b.pct - a.pct)[0];
  }, [modality]);

  // ─── Pace ───
  const pace = useMemo(() => {
    const p =
      style?.pace ||
      (profile as unknown as { learningProfile?: { pace?: string } } | undefined)?.learningProfile?.pace ||
      "moderate";
    return PACE_META[p] ?? PACE_META.moderate;
  }, [style, profile]);

  // ─── Forgetting curve / SRS ───
  const srs = useMemo(() => {
    const cards = flashcards ?? [];
    if (!cards.length) {
      return {
        total: 0, dueToday: 0, dueThisWeek: 0, mature: 0, young: 0, fresh: 0,
        avgEase: 0, avgInterval: 0, stabilityPct: 0,
      };
    }
    const now = Date.now();
    const weekFromNow = now + 7 * 86400_000;
    let dueToday = 0, dueWeek = 0, mature = 0, young = 0, fresh = 0;
    let easeSum = 0, intervalSum = 0;
    for (const c of cards) {
      const ease = typeof c.easeFactor === "number" ? c.easeFactor : 2.5;
      const interval = typeof c.intervalDays === "number" ? c.intervalDays : 0;
      easeSum += ease;
      intervalSum += interval;
      const next = c.nextReviewAt ? new Date(c.nextReviewAt).getTime() : 0;
      if (!next || next <= now) dueToday++;
      else if (next <= weekFromNow) dueWeek++;
      if (interval >= 21) mature++;
      else if (interval >= 7) young++;
      else fresh++;
    }
    // Retention stability proxy: % of cards currently in young+mature buckets
    const stabilityPct = (mature + young) / cards.length;
    return {
      total: cards.length,
      dueToday,
      dueThisWeek: dueWeek,
      mature, young, fresh,
      avgEase: easeSum / cards.length,
      avgInterval: intervalSum / cards.length,
      stabilityPct,
    };
  }, [flashcards]);

  // ─── Misconceptions / weak areas ───
  const weakAreas: string[] = useMemo(() => {
    const p = profile as unknown as { weakAreas?: string[] } | undefined;
    return Array.isArray(p?.weakAreas) ? p!.weakAreas! : [];
  }, [profile]);

  const aiSummary = style?.aiSummary?.trim() || null;

  return (
    <div className="min-h-screen bg-background">
      <StudyNav />
      <main className="max-w-5xl mx-auto px-3 sm:px-5 py-5 sm:py-6 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">Retention Profile</h1>
              <Badge className="text-[10px] h-4 px-1.5 bg-primary/15 text-primary border-0 hover:bg-primary/15">
                <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Live
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              How you learn — mastery × modality × pace × forgetting curve. Updates after every interaction.
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={() => setLoc("/learning-style")}>
              Re-take learning style
            </Button>
            <Button size="sm" onClick={() => setLoc("/progress")}>
              See progress
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : anyError ? (
          <Card className="border-rose-200 bg-rose-50/40">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-500" />
              <div>
                <div className="font-semibold text-sm">Couldn't load your retention profile</div>
                <div className="text-xs text-muted-foreground mt-1 max-w-md">
                  One or more data sources didn't respond. Your real numbers are safe — this is just a fetch problem.
                </div>
              </div>
              <Button size="sm" onClick={retryAll}>Try again</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ─── Top: four pillar cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Mastery pillar */}
              <Card className="bg-gradient-to-br from-emerald-50/60 to-transparent border-emerald-100">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">
                    <Target className="h-3 w-3" /> Mastery
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tabular-nums">{Math.round(mastery.avg * 100)}<span className="text-base font-medium text-muted-foreground">%</span></span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {mastery.total} concepts • {mastery.gaps} gap{mastery.gaps !== 1 && "s"}
                  </div>
                </CardContent>
              </Card>

              {/* Modality pillar */}
              <Card className="bg-gradient-to-br from-pink-50/60 to-transparent border-pink-100">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-pink-700 font-semibold uppercase tracking-wider">
                    <Layers className="h-3 w-3" /> Modality
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold">
                      {dominantModality?.label ?? "Mixed"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {dominantModality
                      ? `${Math.round(dominantModality.pct * 100)}% of your preference`
                      : "Take learning style to set"}
                  </div>
                </CardContent>
              </Card>

              {/* Pace pillar */}
              <Card className="bg-gradient-to-br from-amber-50/60 to-transparent border-amber-100">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold uppercase tracking-wider">
                    <Activity className="h-3 w-3" /> Pace
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold">{pace.label}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Session ~{style?.preferredSessionMinutes ?? 25} min · focus ~{style?.focusMinutes ?? 20} min
                  </div>
                </CardContent>
              </Card>

              {/* Forgetting curve pillar */}
              <Card className="bg-gradient-to-br from-blue-50/60 to-transparent border-blue-100">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold uppercase tracking-wider">
                    <Brain className="h-3 w-3" /> Retention
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tabular-nums">{Math.round(srs.stabilityPct * 100)}<span className="text-base font-medium text-muted-foreground">%</span></span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    stable across {srs.total} card{srs.total !== 1 && "s"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ─── AI summary banner ─── */}
            {aiSummary && (
              <Card className="border-primary/20 bg-primary/[0.03]">
                <CardContent className="p-4 flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm leading-relaxed text-foreground/90">{aiSummary}</div>
                </CardContent>
              </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-4">
              {/* ─── Modality breakdown ─── */}
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-pink-600" />
                      <h2 className="font-semibold text-sm">Modality preferences</h2>
                    </div>
                    <span className="text-[10px] text-muted-foreground">how you absorb best</span>
                  </div>
                  {modality ? (
                    <div className="space-y-2.5">
                      {[...modality].sort((a, b) => b.pct - a.pct).map((m) => {
                        const Icon = m.icon;
                        return (
                          <div key={m.key} className="flex items-center gap-3">
                            <div className="w-20 flex items-center gap-1.5 text-xs font-medium shrink-0">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                              {m.label}
                            </div>
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div className={`h-full ${m.color}`} style={{ width: `${Math.max(4, m.pct * 100)}%` }} />
                            </div>
                            <span className="text-xs font-semibold tabular-nums w-10 text-right">{Math.round(m.pct * 100)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-2">
                      <Info className="h-5 w-5 text-muted-foreground mx-auto" />
                      <div className="text-sm text-muted-foreground">No learning style data yet.</div>
                      <Button size="sm" onClick={() => setLoc("/learning-style")}>
                        Take the 5-min profile
                      </Button>
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground border-t pt-2.5">
                    Adaptive delivery weighs these to choose between text explanations, audio, visuals, and practice items.
                  </p>
                </CardContent>
              </Card>

              {/* ─── Pace + cadence ─── */}
              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-amber-600" />
                      <h2 className="font-semibold text-sm">Pace &amp; cadence</h2>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5 border-amber-500/30 text-amber-700">
                      {pace.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pace.desc}</p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="rounded-md border bg-card p-2.5 text-center">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-0.5" />
                      <div className="text-base font-bold tabular-nums">{style?.preferredSessionMinutes ?? 25}m</div>
                      <div className="text-[10px] text-muted-foreground">session</div>
                    </div>
                    <div className="rounded-md border bg-card p-2.5 text-center">
                      <Zap className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-0.5" />
                      <div className="text-base font-bold tabular-nums">{style?.focusMinutes ?? 20}m</div>
                      <div className="text-[10px] text-muted-foreground">focus block</div>
                    </div>
                    <div className="rounded-md border bg-card p-2.5 text-center">
                      <Target className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-0.5" />
                      <div className="text-base font-bold capitalize">{style?.motivationType ?? "mastery"}</div>
                      <div className="text-[10px] text-muted-foreground">driver</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ─── Forgetting curve detail ─── */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <h2 className="font-semibold text-sm">Forgetting curve</h2>
                    <Badge variant="outline" className="text-[10px] h-5">{srs.total} cards</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 h-7" onClick={() => setLoc("/flashcards")}>
                    <Calendar className="h-3 w-3" />
                    Review {srs.dueToday > 0 ? `${srs.dueToday} now` : "queue"}
                  </Button>
                </div>

                {srs.total === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <Brain className="h-6 w-6 text-muted-foreground mx-auto" />
                    <div className="text-sm text-muted-foreground">No flashcards yet — spaced repetition kicks in once you create some.</div>
                    <Button size="sm" onClick={() => setLoc("/materials")}>Open materials</Button>
                  </div>
                ) : (
                  <>
                    {/* Stacked bar of card maturity */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">Memory stability distribution</span>
                        <span className="text-[11px] tabular-nums text-muted-foreground">avg interval {Math.round(srs.avgInterval)}d · ease {srs.avgEase.toFixed(2)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                        <div
                          className="h-full bg-rose-400"
                          style={{ width: `${(srs.fresh / srs.total) * 100}%` }}
                          title={`${srs.fresh} fresh (<7d)`}
                        />
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${(srs.young / srs.total) * 100}%` }}
                          title={`${srs.young} young (7-21d)`}
                        />
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${(srs.mature / srs.total) * 100}%` }}
                          title={`${srs.mature} mature (21d+)`}
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[11px]">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400" /> Fresh {srs.fresh}</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Young {srs.young}</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Mature {srs.mature}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t">
                      <div className="space-y-0.5">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Due today</div>
                        <div className="text-xl font-bold tabular-nums text-rose-600">{srs.dueToday}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Due this week</div>
                        <div className="text-xl font-bold tabular-nums text-amber-600">{srs.dueThisWeek}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg interval</div>
                        <div className="text-xl font-bold tabular-nums">{Math.round(srs.avgInterval)}<span className="text-xs text-muted-foreground"> d</span></div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Recall ease</div>
                        <div className="text-xl font-bold tabular-nums">{srs.avgEase.toFixed(2)}</div>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground border-t pt-2.5">
                      Cards graduate from <span className="text-rose-600 font-medium">Fresh</span> → <span className="text-amber-600 font-medium">Young</span> → <span className="text-emerald-600 font-medium">Mature</span> as you successfully recall them across longer gaps. Higher ease = the system is widening intervals because you remember reliably.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* ─── Misconceptions ─── */}
            {(weakAreas.length > 0 || mastery.gaps > 0) && (
              <Card className="border-rose-100 bg-gradient-to-br from-rose-50/40 to-transparent">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-500" />
                      <h2 className="font-semibold text-sm">Misconceptions &amp; weak areas</h2>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5 h-7" onClick={() => setLoc("/progress")}>
                      Full breakdown <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                  {weakAreas.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {weakAreas.slice(0, 12).map((w) => (
                        <Badge key={w} variant="outline" className="border-rose-300 text-rose-700 bg-rose-50/60 font-normal">
                          {w}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {mastery.gaps} concept{mastery.gaps !== 1 && "s"} below 40% mastery. As you practice more, the system will pinpoint specific misconceptions here.
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground border-t pt-2.5">
                    Each wrong answer in practice gets logged with its error type. Spotted patterns appear here and drive targeted re-attempts.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ─── Top mastered ─── */}
            {mastery.top.length > 0 && (
              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <h2 className="font-semibold text-sm">Best-retained concepts</h2>
                  </div>
                  <div className="space-y-1.5">
                    {mastery.top.map((n) => {
                      const pct = Math.round(n.m * 100);
                      return (
                        <div key={n.label} className="flex items-center gap-3">
                          <div className="flex-1 text-sm truncate">{n.label}</div>
                          <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden shrink-0">
                            <div className={`h-full ${bandColor(n.m)}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold tabular-nums w-9 text-right text-emerald-600">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
