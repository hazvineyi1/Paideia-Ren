import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDailySession, useStartPathStep, useCompletePathStep } from "@/hooks/use-study-journey";
import {
  Brain, BookOpen, Zap, Target, MessageCircle, CheckCircle2,
  ArrowRight, Clock, ChevronRight, Flame, Sparkles, Loader2,
  Lock, PlayCircle, TrendingUp, RotateCcw, Award
} from "lucide-react";

const stepTypeConfig: Record<string, { icon: typeof Brain; label: string; color: string; bg: string; action: string }> = {
  read_material: { icon: BookOpen, label: "Read & Understand", color: "text-blue-600", bg: "bg-blue-50", action: "Read" },
  flashcard_review: { icon: Zap, label: "Active Recall", color: "text-amber-600", bg: "bg-amber-50", action: "Review" },
  practice_questions: { icon: Target, label: "Apply Knowledge", color: "text-emerald-600", bg: "bg-emerald-50", action: "Practice" },
  tutor_session: { icon: MessageCircle, label: "Deep Dive", color: "text-purple-600", bg: "bg-purple-50", action: "Discuss" },
  mastery_check: { icon: Award, label: "Mastery Check", color: "text-orange-600", bg: "bg-orange-50", action: "Check" },
  spaced_review: { icon: RotateCcw, label: "Spaced Review", color: "text-teal-600", bg: "bg-teal-50", action: "Review" },
};

export default function StudyDailySession() {
  const [, setLoc] = useLocation();
  const { data: sessionData, isLoading } = useDailySession();
  const startStep = useStartPathStep();
  const completeStep = useCompletePathStep();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Brain className="h-8 w-8 text-primary animate-pulse mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Preparing today's session...</p>
        </div>
      </div>
    );
  }

  if (!sessionData?.hasActivePath) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Start Your Learning Journey</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Add your first study material and take a quick diagnostic assessment. AI will build your personalized learning path.
          </p>
          <Button size="lg" className="gap-2" onClick={() => setLoc("/materials/new")}>
            <BookOpen className="h-4 w-4" />
            Add Study Material
            <ArrowRight className="h-4 w-4" />
          </Button>
        </main>
      </div>
    );
  }

  const { path, session, progress } = sessionData;
  const steps = session?.steps ?? [];
  const totalMinutes = session?.totalEstimatedMinutes ?? 0;

  const handleStepAction = (step: any) => {
    if (step.status === "locked") return;

    if (step.status === "available") {
      startStep.mutate({ pathId: path.id, stepId: step.id }, {
        onSuccess: () => navigateToStep(step),
      });
    } else {
      navigateToStep(step);
    }
  };

  const navigateToStep = (step: any) => {
    const ref = step.contentRef || step.conceptId;
    const stepParams = `?pathId=${encodeURIComponent(path.id)}&pathStepId=${encodeURIComponent(step.id)}`;
    switch (step.stepType) {
      case "read_material":
        setLoc(ref ? `/materials/${ref}${stepParams}` : `/materials${stepParams}`);
        break;
      case "flashcard_review":
        setLoc(`/flashcards${stepParams}`);
        break;
      case "practice_questions":
        setLoc(`/practice${stepParams}`);
        break;
      case "tutor_session":
        setLoc(`/tutor${stepParams}`);
        break;
      default:
        setLoc("/dashboard");
    }
  };

  const handleCompleteStep = (step: any) => {
    completeStep.mutate(
      { pathId: path.id, stepId: step.id, masteryScore: 0.7 },
      { onSuccess: () => {/* session refreshes automatically */} }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-4 py-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-sm">Today's Learning Session</h1>
                <p className="text-[10px] text-muted-foreground">{path.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Clock className="h-3 w-3" />
                ~{totalMinutes} min
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Path Progress</span>
                <span className="font-medium">{progress.percentComplete}%</span>
              </div>
              <Progress value={progress.percentComplete} className="h-2" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Session Overview */}
        <div className="flex items-center gap-3 text-sm mb-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="font-medium">{steps.length} steps for today</span>
          <span className="text-muted-foreground">• {progress.completedSteps} of {progress.totalSteps} completed overall</span>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step: any, index: number) => {
            const config = stepTypeConfig[step.stepType] || stepTypeConfig.read_material;
            const Icon = config.icon;
            const isLocked = step.status === "locked";
            const isCompleted = step.status === "completed";
            const isInProgress = step.status === "in_progress";
            const isAvailable = step.status === "available";

            return (
              <Card
                key={step.id}
                className={`transition-all ${
                  isCompleted
                    ? "border-l-4 border-l-emerald-400 opacity-70"
                    : isInProgress
                    ? "border-l-4 border-l-primary ring-1 ring-primary/20"
                    : isAvailable
                    ? "border-l-4 border-l-blue-400 cursor-pointer hover:shadow-md"
                    : "opacity-50"
                }`}
                onClick={() => !isLocked && handleStepAction(step)}
              >
                <CardContent className="py-4 px-5">
                  <div className="flex items-start gap-4">
                    {/* Status Indicator */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCompleted ? "bg-emerald-100" :
                      isInProgress ? "bg-primary/10" :
                      isAvailable ? config.bg : "bg-muted"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : isLocked ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Icon className={`h-5 w-5 ${isInProgress || isAvailable ? config.color : "text-muted-foreground"}`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Step {index + 1}</span>
                        <Badge variant="outline" className={`text-[10px] h-5 ${config.bg} ${config.color}`}>
                          {config.label}
                        </Badge>
                        {isInProgress && (
                          <Badge variant="default" className="text-[10px] h-5 gap-1">
                            <PlayCircle className="h-3 w-3" />
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <h3 className={`font-semibold text-sm ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {step.title}
                      </h3>
                      {step.description && (
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                      )}
                      {step.node && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span>Mastery: {Math.round((step.node.masteryLevel ?? 0) * 100)}%</span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {step.estimatedMinutes}m
                      </span>
                      {isInProgress && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={(e) => { e.stopPropagation(); handleCompleteStep(step); }}
                          disabled={completeStep.isPending}
                        >
                          {completeStep.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                          Complete
                        </Button>
                      )}
                      {isAvailable && !isInProgress && (
                        <Button size="sm" className="h-7 text-xs gap-1">
                          {config.action}
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                      {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* All Done / Next Actions */}
        {steps.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">All Steps Complete!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Great work today. Come back tomorrow for your next session.
              </p>
              <Button variant="outline" size="sm" onClick={() => setLoc("/dashboard")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
