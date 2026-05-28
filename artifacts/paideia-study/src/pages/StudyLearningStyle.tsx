import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Brain, ArrowRight, ArrowLeft, BookOpen, Headphones, Eye,
  CheckCircle2, Loader2, Sparkles,
} from "lucide-react";
import {
  useLearningStyleTasks,
  useSubmitLearningStyle,
  useLearningStyleProfile,
} from "@/hooks/use-study-journey";

type Question = {
  id: string;
  prompt: string;
  options: Array<{ id: string; label: string }>;
};

type MiniTask = {
  id: "read" | "listen" | "visual";
  modality: string;
  title: string;
  instruction: string;
  passage: string;
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
  }>;
};

const TASK_ICONS = {
  read: BookOpen,
  listen: Headphones,
  visual: Eye,
} as const;

export default function StudyLearningStyle() {
  const [, setLoc] = useLocation();
  const { data: existing } = useLearningStyleProfile();
  const { data: tasks, isLoading, error: tasksError } = useLearningStyleTasks();
  const submit = useSubmitLearningStyle();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [miniAnswers, setMiniAnswers] = useState<
    Record<string, Record<string, number>>
  >({});
  const [step, setStep] = useState(0);
  const [retaking, setRetaking] = useState(false);
  const [showPassage, setShowPassage] = useState(true);

  const questionnaire: Question[] = tasks?.questionnaire ?? [];
  const miniTasks: MiniTask[] = tasks?.miniTasks ?? [];
  const totalSteps = questionnaire.length + miniTasks.length + 1; // +1 = results

  const progress = useMemo(() => Math.round((step / Math.max(totalSteps - 1, 1)) * 100), [step, totalSteps]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (tasksError || !tasks) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center">
            <h2 className="font-bold text-lg mb-2">We couldn't load your diagnostic</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {tasksError instanceof Error ? tasksError.message : "Please sign in and try again."}
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setLoc("/login")}>Go to sign in</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already completed → bounce
  if (existing && step === 0 && !retaking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <h2 className="font-bold text-lg mb-2">You've already completed this</h2>
            {existing.aiSummary && (
              <p className="text-sm text-muted-foreground mb-5">{existing.aiSummary}</p>
            )}
            <div className="flex flex-col gap-2">
              <Button onClick={() => setLoc("/materials/new")}>
                Upload material <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRetaking(true);
                  setStep(0);
                  setAnswers({});
                  setMiniAnswers({});
                }}
              >
                Retake the diagnostic
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLoc("/dashboard")}>
                Back to dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isQuestionnaireStep = step < questionnaire.length;
  const miniIndex = step - questionnaire.length;
  const isMiniStep = miniIndex >= 0 && miniIndex < miniTasks.length;
  const isResultsStep = step >= questionnaire.length + miniTasks.length;

  const currentQuestion = isQuestionnaireStep ? questionnaire[step] : null;
  const currentMini = isMiniStep ? miniTasks[miniIndex] : null;

  const canAdvance = (() => {
    if (isQuestionnaireStep && currentQuestion) return !!answers[currentQuestion.id];
    if (isMiniStep && currentMini) {
      if (showPassage) return true;
      const ma = miniAnswers[currentMini.id] ?? {};
      return currentMini.questions.every((q) => ma[q.id] !== undefined);
    }
    return true;
  })();

  const goNext = () => {
    if (isMiniStep && showPassage) {
      setShowPassage(false);
      return;
    }
    setStep((s) => s + 1);
    setShowPassage(true);
  };

  const goBack = () => {
    if (isMiniStep && !showPassage) {
      setShowPassage(true);
      return;
    }
    setStep((s) => Math.max(0, s - 1));
    setShowPassage(true);
  };

  const handleSubmit = async () => {
    const miniTaskAnswers: Record<string, Array<{ questionId: string; selectedOptionIndex: number }>> = {};
    for (const [taskId, qa] of Object.entries(miniAnswers)) {
      miniTaskAnswers[taskId] = Object.entries(qa).map(([qid, idx]) => ({
        questionId: qid,
        selectedOptionIndex: idx,
      }));
    }
    try {
      await submit.mutateAsync({ answers, miniTaskAnswers });
      setStep(totalSteps); // results
    } catch (err: any) {
      alert(err?.message || "Could not save your profile. Try again.");
    }
  };

  // ─── Results ───
  if (step >= totalSteps) {
    const profile = submit.data ?? existing;
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-lg mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your learning profile is ready</h1>
            <p className="text-sm text-muted-foreground">
              This is how the app will personalize every study session for you.
            </p>
          </div>
          {profile?.aiSummary && (
            <Card className="border-primary/20 bg-primary/5 mb-5">
              <CardContent className="py-5 px-5">
                <p className="text-sm leading-relaxed">{profile.aiSummary}</p>
              </CardContent>
            </Card>
          )}
          {profile && (
            <Card className="mb-6">
              <CardContent className="py-5 px-5 space-y-3">
                <h3 className="text-sm font-semibold">How you learn best</h3>
                {[
                  { label: "Reading", value: profile.textPref, icon: BookOpen },
                  { label: "Listening", value: profile.audioPref, icon: Headphones },
                  { label: "Visual / diagrams", value: profile.visualPref, icon: Eye },
                  { label: "Hands-on practice", value: profile.practicePref, icon: Brain },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <row.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        {row.label}
                      </span>
                      <span className="text-muted-foreground">{Math.round((row.value ?? 0) * 100)}%</span>
                    </div>
                    <Progress value={(row.value ?? 0) * 100} className="h-1.5" />
                  </div>
                ))}
                <div className="pt-3 border-t flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{profile.pace} pace</Badge>
                  <Badge variant="outline" className="text-[10px]">{profile.preferredSessionMinutes}-min sessions</Badge>
                  <Badge variant="outline" className="text-[10px]">{profile.motivationType}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
          <Button size="lg" className="w-full gap-2" onClick={() => setLoc("/materials/new")}>
            Now upload your material <ArrowRight className="h-4 w-4" />
          </Button>
        </main>
      </div>
    );
  }

  // ─── Step UI ───
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-3 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold">Learning Style Diagnostic</p>
            <p className="text-[10px] text-muted-foreground">
              Step {Math.min(step + 1, totalSteps)} of {totalSteps}
            </p>
          </div>
          <Progress value={progress} className="h-1.5 w-20" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {step === 0 && Object.keys(answers).length === 0 && (
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">First, let's learn how you learn</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              A few quick questions and three short tasks. The app uses this to build a study plan
              that actually fits you — before you even upload any material.
            </p>
          </div>
        )}

        {isQuestionnaireStep && currentQuestion && (
          <Card>
            <CardContent className="py-6 px-5">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                Question {step + 1}
              </p>
              <h2 className="font-bold text-lg mb-5 leading-snug">{currentQuestion.prompt}</h2>
              <div className="space-y-2">
                {currentQuestion.options.map((opt) => {
                  const selected = answers[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [currentQuestion.id]: opt.id }))}
                      style={{ WebkitTapHighlightColor: "rgba(0,0,0,0.05)", touchAction: "manipulation" }}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer touch-manipulation select-none active:scale-[0.99] ${
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:border-primary/30 hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${selected ? "border-primary" : "border-muted-foreground/30"}`}>
                          {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className="text-sm">{opt.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {isMiniStep && currentMini && (
          <Card>
            <CardContent className="py-6 px-5">
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const Icon = TASK_ICONS[currentMini.id];
                  return <Icon className="h-4 w-4 text-primary" />;
                })()}
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Mini-task {miniIndex + 1} of {miniTasks.length}
                </p>
              </div>
              <h2 className="font-bold text-lg mb-1 leading-snug">{currentMini.title}</h2>
              <p className="text-xs text-muted-foreground mb-4">{currentMini.instruction}</p>

              {showPassage ? (
                <div className="bg-muted/40 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {currentMini.passage}
                </div>
              ) : (
                <div className="space-y-5">
                  {currentMini.questions.map((q) => {
                    const chosen = miniAnswers[currentMini.id]?.[q.id];
                    return (
                      <div key={q.id}>
                        <p className="text-sm font-medium mb-2">{q.prompt}</p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, idx) => {
                            const selected = chosen === idx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setMiniAnswers((m) => ({
                                    ...m,
                                    [currentMini.id]: { ...(m[currentMini.id] ?? {}), [q.id]: idx },
                                  }))
                                }
                                style={{ WebkitTapHighlightColor: "rgba(0,0,0,0.05)", touchAction: "manipulation" }}
                                className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all cursor-pointer touch-manipulation select-none active:scale-[0.99] ${
                                  selected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/30 hover:bg-accent/50"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${selected ? "border-primary" : "border-muted-foreground/30"}`}>
                                    {selected && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                  </div>
                                  <span>{opt}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            disabled={step === 0 && showPassage}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          {isResultsStep ? null : step >= questionnaire.length + miniTasks.length - 1 &&
            isMiniStep && !showPassage ? (
            <Button onClick={handleSubmit} disabled={!canAdvance || submit.isPending} className="gap-1.5">
              {submit.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Building your profile...</>
              ) : (
                <>Finish <Sparkles className="h-4 w-4" /></>
              )}
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!canAdvance} className="gap-1.5">
              {isMiniStep && showPassage ? "I'm ready" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
