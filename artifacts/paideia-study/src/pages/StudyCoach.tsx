import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useStudyAuth } from "@/hooks/use-study-auth";
import { useStudyProfile, useDailySession, fetchApi } from "@/hooks/use-study-journey";
import { useStudySubscription, useStudyBillingConfig } from "@/hooks/use-study-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, BookOpen, BarChart3, FileText, User, Loader2, Sparkles, Check } from "lucide-react";

type Personality = "drill" | "socratic" | "warm" | "analyst";

const COACH_META: Record<Personality, { name: string; opener: (firstName: string) => string; cta: string }> = {
  drill: {
    name: "Coach",
    opener: (n) => `${n}. No warm-up. We pick up where we left off, what's the first thing you want to attack today?`,
    cta: "Tell me what you're working on.",
  },
  socratic: {
    name: "Mentor",
    opener: (n) => `Welcome back, ${n}. Before we open anything new, what's the question still sitting with you from last time?`,
    cta: "What are you wondering about?",
  },
  warm: {
    name: "Coach",
    opener: (n) => `Hey ${n}, glad you're back. We don't have to do much today, but let's do something. What's been on your mind?`,
    cta: "What's on your mind?",
  },
  analyst: {
    name: "Coach",
    opener: (n) => `Welcome back, ${n}. Based on where you left off, here's what I'd suggest, but tell me what you actually want to work on first.`,
    cta: "What would be most useful right now?",
  },
};

export default function StudyCoach() {
  const [, setLoc] = useLocation();
  const { user, loading: authLoading } = useStudyAuth();
  const profileQuery = useStudyProfile();
  const { data: profile, isLoading: profileLoading, isFetching: profileFetching, isSuccess: profileSettled } = profileQuery;
  const { data: session } = useDailySession();
  const { data: subscription } = useStudySubscription();
  const { data: billingConfig } = useStudyBillingConfig();
  const [draft, setDraft] = useState("");
  const [opening, setOpening] = useState(false);

  // Auth gate
  useEffect(() => {
    if (!authLoading && !user) setLoc("/login");
  }, [authLoading, user, setLoc]);

  // Onboarding gate, only act on a *settled, fresh* profile so we don't bounce a complete
  // user on stale cache while the real fetch is mid-flight.
  useEffect(() => {
    if (profileSettled && !profileFetching && profile && !profile.diagnosticComplete) {
      setLoc("/intake");
    }
  }, [profileSettled, profileFetching, profile, setLoc]);

  if (authLoading || profileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  const personality = (profile.coachPersonality as Personality) ?? "warm";
  const meta = COACH_META[personality] ?? COACH_META.warm;
  const firstName = (user?.name ?? user?.email ?? "there").split(/[ @]/)[0];
  const primaryStep = session?.session?.primaryStep ?? null;

  // Upgrade nudge. Pro is the ceiling, so we always pitch toward it and pull the
  // real Pro feature list from billing config so the benefits stay accurate.
  const currentTier = subscription?.tier ?? "free";
  const showUpgrade = currentTier !== "pro";
  const isPlus = currentTier === "plus";
  const proTier = billingConfig?.tiers.find((t) => t.id === "pro");
  const upgradeBenefits = (proTier?.features ?? [
    "Unlimited coaching, whenever you need it",
    "Deeper feedback on every answer you give",
    "A study plan that adapts to you each day",
  ]).slice(0, 3);

  async function openConversation(seed: string) {
    if (opening) return;
    setOpening(true);
    let convId: string | null = null;
    try {
      // Coach voice is applied server-side from profile.coachPersonality.
      // socraticMode only controls "never give direct answers", we tie it to the socratic coach.
      const conv: any = await fetchApi("/study/tutor/conversations", {
        method: "POST",
        body: JSON.stringify({
          title: seed.slice(0, 60) || "Today's session",
          socraticMode: personality === "socratic",
          scope: "all_material",
        }),
      });
      convId = conv?.id ?? null;
      if (convId && seed.trim()) {
        // Seed message is best-effort, the conversation already exists with a greeting,
        // so a failure here must NOT strand the user on /coach.
        try {
          await fetchApi(`/study/tutor/conversations/${convId}/messages`, {
            method: "POST",
            body: JSON.stringify({ content: seed.trim() }),
          });
        } catch (seedErr) {
          console.warn("seed message failed; opening conversation anyway", seedErr);
        }
      }
    } catch (err) {
      console.error("failed to create coach conversation", err);
    } finally {
      if (convId) {
        setLoc(`/tutor/${convId}`);
      } else {
        setOpening(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/40">
        <div className="font-serif text-lg tracking-tight">Synops</div>
        <Button variant="ghost" size="sm" onClick={() => setLoc("/profile")} aria-label="Profile">
          <User className="h-4 w-4" />
        </Button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        {/* Coach greeting, the home is a conversation */}
        <section className="mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Your {meta.name}</p>
          <h1 className="font-serif text-3xl md:text-4xl leading-tight text-foreground">
            {meta.opener(firstName)}
          </h1>
        </section>

        {/* Today's plan card, quiet, sits beside the conversation, doesn't take over */}
        {primaryStep && (
          <section className="mb-10 border border-border/60 rounded-lg p-5 bg-card">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2">Today's next step</p>
            <h2 className="font-serif text-xl text-card-foreground mb-1">{primaryStep.title ?? "Continue where you left off"}</h2>
            {primaryStep.description && (
              <p className="text-sm text-muted-foreground mb-4">{primaryStep.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {typeof primaryStep.estimatedMinutes === "number" && (
                <span>~{primaryStep.estimatedMinutes} min</span>
              )}
              {session?.progress?.totalSteps ? (
                <span>· {session.progress.completedSteps}/{session.progress.totalSteps} done</span>
              ) : null}
            </div>
          </section>
        )}

        {/* Inline conversation start, the primary surface */}
        <section className="mb-8">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={meta.cta}
            rows={4}
            className="resize-none bg-card border-border/60 text-base font-serif focus-visible:ring-primary/40"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                openConversation(draft);
              }
            }}
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">⌘/Ctrl + Enter to send</p>
            <Button
              onClick={() => openConversation(draft)}
              disabled={opening}
              className="gap-2"
            >
              {opening ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Start today's session
            </Button>
          </div>
        </section>

        {/* Upgrade card, prominent and benefit-led so the path to Pro is obvious */}
        {showUpgrade && (
          <section className="mt-14">
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
                  <Sparkles className="h-4 w-4 text-primary" />
                </span>
                <p className="text-xs uppercase tracking-[0.18em] text-primary font-medium">
                  {isPlus ? "Coach Pro" : "Unlock Coach Pro"}
                </p>
              </div>

              <h2 className="font-serif text-2xl md:text-3xl leading-snug text-foreground mb-2">
                {isPlus
                  ? "You're one step from your full potential"
                  : "Great results are built, not wished for"}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-lg">
                {isPlus
                  ? "Pro gives you the deepest version of your coach. Go all in on the term ahead."
                  : "The students who pull ahead don't do it alone. Pro turns your coach into a full study partner that pushes you every single day."}
              </p>

              <ul className="grid gap-2.5 mb-7 max-w-lg">
                {upgradeBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-4">
                <Button onClick={() => setLoc("/upgrade")} size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {isPlus ? "Step up to Pro" : "See what Pro unlocks"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  Pay with mobile money or card. Cancel anytime.
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Quiet links, power-user shortcuts, not the main surface */}
        <nav className="mt-12 pt-6 border-t border-border/40 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <button onClick={() => setLoc("/materials")} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Materials
          </button>
          <button onClick={() => setLoc("/practice")} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Practice
          </button>
          <button onClick={() => setLoc("/progress")} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Progress
          </button>
          <button
            onClick={() => setLoc("/dashboard")}
            className="hover:text-foreground transition-colors ml-auto"
          >
            Open full dashboard →
          </button>
        </nav>
      </main>
    </div>
  );
}
