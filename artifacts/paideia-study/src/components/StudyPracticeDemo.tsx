import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

// A self-playing, looping demonstration of the real practice flow:
// a question appears, an answer is chosen, confidence is set, it's submitted,
// and the correct answer is revealed with a short explanation. The whole card
// is the entry point to a real practice set, so the value is shown, not told.

const QUESTION = {
  prompt: "Mitochondria are best known as the...",
  options: [
    "Control center of the cell",
    "Powerhouse of the cell",
    "Storage unit of the cell",
    "Outer barrier of the cell",
  ],
  correctIndex: 1,
  explanation: "Mitochondria generate most of the cell's energy as ATP.",
};

type Phase = "ask" | "pick" | "confidence" | "submit" | "reveal";

const SEQUENCE: { phase: Phase; ms: number }[] = [
  { phase: "ask", ms: 1100 },
  { phase: "pick", ms: 1000 },
  { phase: "confidence", ms: 900 },
  { phase: "submit", ms: 750 },
  { phase: "reveal", ms: 2800 },
];

const ORDER: Phase[] = ["ask", "pick", "confidence", "submit", "reveal"];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const fn = () => setReduced(m.matches);
    m.addEventListener?.("change", fn);
    return () => m.removeEventListener?.("change", fn);
  }, []);
  return reduced;
}

export default function StudyPracticeDemo() {
  const [, setLoc] = useLocation();
  const reduced = usePrefersReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(
      () => setStepIndex((i) => (i + 1) % SEQUENCE.length),
      SEQUENCE[stepIndex].ms,
    );
    return () => clearTimeout(t);
  }, [stepIndex, reduced]);

  const phase: Phase = reduced ? "reveal" : SEQUENCE[stepIndex].phase;
  const reached = (p: Phase) => ORDER.indexOf(phase) >= ORDER.indexOf(p);

  const picked = reached("pick");
  const confidenceChosen = reached("confidence");
  const pressing = phase === "submit";
  const revealed = phase === "reveal";

  return (
    <button
      type="button"
      onClick={() => setLoc("/practice")}
      aria-label="Start a practice set"
      className="group block w-full text-left rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-primary font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          Practice, in motion
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            {!reduced && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
            )}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          live preview
        </span>
      </div>

      {/* Mini session card, mirrors the real practice screen */}
      <div className="rounded-xl border border-border/50 bg-background p-4">
        <p className="font-medium text-[15px] text-foreground mb-3 leading-snug">
          {QUESTION.prompt}
        </p>

        <div className="space-y-2">
          {QUESTION.options.map((opt, i) => {
            const isCorrect = i === QUESTION.correctIndex;
            let cls = "border-border/60 bg-background text-foreground";
            if (revealed) {
              if (isCorrect) cls = "border-green-400/70 bg-green-50 text-green-800";
              else cls = "border-border/40 bg-muted/40 text-muted-foreground opacity-60";
            } else if (picked && isCorrect) {
              cls = "border-primary bg-primary/10 text-foreground";
            }
            return (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-300 ${cls}`}
              >
                <span className="font-semibold text-xs opacity-70">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="flex-1">{opt}</span>
                {revealed && isCorrect && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Confidence + submit, swapped for the result on reveal */}
        <div className="mt-3 min-h-[64px]">
          {!revealed ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {["Guess", "Pretty sure", "Certain"].map((label, i) => {
                  const active = confidenceChosen && i === 1;
                  return (
                    <div
                      key={label}
                      className={`rounded-md border px-2 py-1.5 text-center text-[11px] transition-colors duration-300 ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/60 text-muted-foreground"
                      }`}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
              <div
                className={`rounded-md bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground transition-transform duration-200 ${
                  pressing ? "scale-[0.97]" : ""
                }`}
              >
                Submit answer
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-1.5 mb-0.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-xs font-semibold text-green-800">Correct</span>
              </div>
              <p className="text-[11px] leading-snug text-green-700">
                {QUESTION.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Quick sets that find your blind spots and explain every answer.
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          Try it
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
