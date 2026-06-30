import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useStudyAuth } from "@/hooks/use-study-auth";
import { useStudyProfile, useDailySession, fetchApi } from "@/hooks/use-study-journey";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, BookOpen, BarChart3, FileText, User, Loader2 } from "lucide-react";

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

        {/* Quiet links, power-user shortcuts, not the main surface */}
        <nav className="mt-16 pt-6 border-t border-border/40 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <button onClick={() => setLoc("/materials")} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Materials
          </button>
          <button onClick={() => setLoc("/practice")} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Practice
          </button>
          <button onClick={() => setLoc("/progress")} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Progress
          </button>
          <button onClick={() => setLoc("/dashboard")} className="hover:text-foreground transition-colors ml-auto">
            Open full dashboard →
          </button>
        </nav>
      </main>
    </div>
  );
}
