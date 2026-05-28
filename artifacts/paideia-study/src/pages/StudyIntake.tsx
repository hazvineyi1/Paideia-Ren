import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Sparkles } from "lucide-react";
import {
  useStudyProfile,
  useUpdateStudyProfile,
} from "@/hooks/use-study-journey";

type Step =
  | "goal"
  | "examDate"
  | "hoursPerWeek"
  | "baseline"
  | "calibration"
  | "failureMode"
  | "review";

const STEPS: Step[] = [
  "goal",
  "examDate",
  "hoursPerWeek",
  "baseline",
  "calibration",
  "failureMode",
  "review",
];

const BASELINE_OPTIONS = [
  { value: "zero", label: "Brand new to this", hint: "Starting from scratch" },
  { value: "foundations", label: "Some foundations", hint: "I've seen the basics" },
  { value: "rusty", label: "Studied before, rusty now", hint: "I need a refresher" },
  { value: "solid", label: "Solid base, polishing", hint: "I'm refining edges" },
];

const CALIBRATION_OPTIONS = [
  { value: "high", label: "Confident I'll do well", hint: "I expect strong results" },
  { value: "mid", label: "Cautiously optimistic", hint: "I think I'm on track" },
  { value: "low", label: "Pretty unsure", hint: "I'm worried I'll fall short" },
  { value: "under", label: "Underestimating myself", hint: "I always think I'll fail and don't" },
];

const FAILURE_MODE_OPTIONS = [
  { value: "passive", label: "I re-read but don't really practice", hint: "Mostly highlighting & reviewing" },
  { value: "cram", label: "I cram right before the test", hint: "Big push at the end" },
  { value: "avoid", label: "I avoid the hard topics", hint: "I skip what makes me uncomfortable" },
  { value: "scattered", label: "I jump between topics", hint: "Hard to stick with one thing" },
  { value: "perfect", label: "I get stuck perfecting one topic", hint: "I can't move on until it feels mastered" },
];

export default function StudyIntake() {
  const [, setLoc] = useLocation();
  const { data: profile } = useStudyProfile();
  const updateMutation = useUpdateStudyProfile();

  const [stepIdx, setStepIdx] = useState(0);
  const [goal, setGoal] = useState<string>(profile?.examTarget ?? "");
  const [examDate, setExamDate] = useState<string>(
    profile?.examDate ? new Date(profile.examDate).toISOString().slice(0, 10) : "",
  );
  const [hoursPerWeek, setHoursPerWeek] = useState<number | "">(
    profile?.hoursPerWeek ?? "",
  );
  const [baseline, setBaseline] = useState<string>(profile?.baselineLevel ?? "");
  const [calibration, setCalibration] = useState<string>(profile?.calibrationSelfRating ?? "");
  const [failureMode, setFailureMode] = useState<string>(profile?.failureMode ?? "");
  const [saving, setSaving] = useState(false);

  const step = STEPS[stepIdx];
  const totalQuestions = STEPS.length - 1; // exclude review
  const progress = Math.min(stepIdx, totalQuestions) / totalQuestions;

  const canAdvance = (() => {
    switch (step) {
      case "goal": return goal.trim().length > 0;
      case "examDate": return true; // optional
      case "hoursPerWeek": return typeof hoursPerWeek === "number" && hoursPerWeek > 0;
      case "baseline": return baseline.length > 0;
      case "calibration": return calibration.length > 0;
      case "failureMode": return failureMode.length > 0;
      case "review": return true;
      default: return false;
    }
  })();

  const next = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIdx((i) => Math.max(0, i - 1));

  const submit = async () => {
    setSaving(true);
    try {
      await updateMutation.mutateAsync({
        examTarget: goal.trim() || null,
        examDate: examDate ? new Date(examDate).toISOString() : null,
        hoursPerWeek: typeof hoursPerWeek === "number" ? hoursPerWeek : null,
        baselineLevel: baseline || null,
        calibrationSelfRating: calibration || null,
        failureMode: failureMode || null,
      });
      setLoc("/dashboard");
    } catch {
      setSaving(false);
      alert("Couldn't save your intake. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-blue-700 font-semibold mb-2">
          <Compass className="w-4 h-4" /> Tune your study plan
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          A few quick questions
        </h1>
        <p className="text-sm text-gray-600 mb-5">
          Your answers shape the AI's daily plan, exam pacing, and which weak spots get re-queued.
        </p>

        <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <Card>
          <CardContent className="p-6">
            {step === "goal" && (
              <Section title="What are you preparing for?" hint="Be specific — exam name, course, certification, etc.">
                <Input
                  autoFocus
                  placeholder="e.g., CompTIA Security+, MCAT Biology, Calc II final"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canAdvance && next()}
                />
              </Section>
            )}

            {step === "examDate" && (
              <Section
                title="When's your exam or deadline?"
                hint="Leave blank if you're learning without a fixed date."
              >
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </Section>
            )}

            {step === "hoursPerWeek" && (
              <Section
                title="How many hours a week can you realistically study?"
                hint="Be honest — under-promising is fine. We adapt as you go."
              >
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={80}
                    placeholder="e.g., 6"
                    value={hoursPerWeek}
                    onChange={(e) => {
                      const v = e.target.value;
                      setHoursPerWeek(v === "" ? "" : Math.max(1, Math.min(80, Number(v))));
                    }}
                    className="max-w-[120px]"
                  />
                  <span className="text-sm text-gray-600">hours / week</span>
                </div>
              </Section>
            )}

            {step === "baseline" && (
              <Section title="Where would you say you're starting from?" hint="Your honest baseline — not where you wish you were.">
                <OptionList options={BASELINE_OPTIONS} selected={baseline} onSelect={setBaseline} />
              </Section>
            )}

            {step === "calibration" && (
              <Section
                title="How well do you usually predict your test performance?"
                hint="This tells us how much to trust your own confidence ratings during practice."
              >
                <OptionList options={CALIBRATION_OPTIONS} selected={calibration} onSelect={setCalibration} />
              </Section>
            )}

            {step === "failureMode" && (
              <Section
                title="When studying goes wrong for you, it usually looks like…"
                hint="No judgement — knowing your pattern lets us route around it."
              >
                <OptionList options={FAILURE_MODE_OPTIONS} selected={failureMode} onSelect={setFailureMode} />
              </Section>
            )}

            {step === "review" && (
              <div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-3">
                  <Sparkles className="w-5 h-5" /> Ready to tune your plan
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Here's what we'll use:
                </p>
                <ReviewRow label="Goal" value={goal || "(none)"} />
                <ReviewRow label="Exam date" value={examDate || "Open-ended"} />
                <ReviewRow label="Hours/week" value={String(hoursPerWeek || "—")} />
                <ReviewRow label="Baseline" value={labelOf(BASELINE_OPTIONS, baseline)} />
                <ReviewRow label="Self-prediction style" value={labelOf(CALIBRATION_OPTIONS, calibration)} />
                <ReviewRow label="Failure pattern" value={labelOf(FAILURE_MODE_OPTIONS, failureMode)} />
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={back}
                disabled={stepIdx === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              {step !== "review" ? (
                <Button onClick={next} disabled={!canAdvance}>
                  {step === "examDate" && !examDate ? "Skip" : "Next"} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={saving}>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {saving ? "Saving…" : "Tune my plan"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-4">
          Takes about a minute. Your answers shape every plan we generate.
        </p>
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
      {hint && <p className="text-sm text-gray-500 mb-4">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function OptionList({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string; hint: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition ${
              active
                ? "bg-blue-50 border-blue-400 ring-1 ring-blue-200"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium text-gray-900 text-sm">{opt.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{opt.hint}</div>
          </button>
        );
      })}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-2 border-b last:border-b-0 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function labelOf(opts: { value: string; label: string }[], v: string): string {
  return opts.find((o) => o.value === v)?.label ?? "—";
}
