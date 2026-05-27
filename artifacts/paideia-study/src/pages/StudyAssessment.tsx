import { useState, useEffect, useCallback, createElement } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useStudyAssessment, useCompleteAssessment } from "@/hooks/use-study-journey";
import {
  Brain, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Sparkles, Clock, Target, Zap, BookOpen, Trophy,
  ChevronRight, Loader2, TrendingUp, Lightbulb
} from "lucide-react";

interface Answer {
  questionId: string;
  selectedOptionIndex: number;
  timeSpentSeconds: number;
  correct?: boolean;
}

export default function StudyAssessment() {
  const [, params] = useRoute("/assessment/:id");
  const [, setLoc] = useLocation();
  const assessmentId = params?.id;
  const { data: assessment, isLoading } = useStudyAssessment(assessmentId);
  const completeMutation = useCompleteAssessment();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const questions = assessment?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setSelectedOption(null);
    setShowExplanation(false);
  }, [currentIndex]);

  const handleSelectOption = (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = useCallback(() => {
    if (selectedOption === null || !currentQuestion) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;

    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedOptionIndex: selectedOption,
      timeSpentSeconds: timeSpent,
      correct: isCorrect,
    };

    setAnswers((prev) => [...prev, answer]);
    setShowExplanation(true);
  }, [selectedOption, currentQuestion, questionStartTime]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Submit all answers
      setIsSubmitting(true);
      completeMutation.mutate(
        {
          id: assessmentId!,
          answers: answers.map(({ correct, ...a }) => a),
        },
        {
          onSuccess: (data) => {
            setResults(data);
            setIsSubmitting(false);
          },
          onError: () => setIsSubmitting(false),
        },
      );
    }
  }, [currentIndex, questions.length, answers, assessmentId, completeMutation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Brain className="h-8 w-8 text-primary animate-pulse mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Preparing your diagnostic assessment...</p>
        </div>
      </div>
    );
  }

  // Results screen
  if (results) {
    const { score, detectedDifficulty, recommendedPathType, accuracyByConcept } = results.results ?? {};
    const conceptAccuracies = Object.entries(accuracyByConcept ?? {}).map(([id, acc]) => ({
      name: assessment?.questions?.find((q: any) => q.conceptId === id)?.conceptId ?? "Concept",
      accuracy: acc as number,
    }));

    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Assessment Complete</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Your Learning Profile</h1>
            <p className="text-muted-foreground">AI has analyzed your diagnostic results and prepared a personalized learning journey.</p>
          </div>

          {/* Score Circle */}
          <Card className="mb-6 border-primary/20">
            <CardContent className="py-8 px-6">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
                      strokeLinecap="round"
                      className={score >= 70 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-orange-500"}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{score}%</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Score</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs text-center">
                  {score >= 70
                    ? "Strong foundation! Your personalized path will build on this with advanced connections and deeper applications."
                    : score >= 50
                    ? "Good start. Your path focuses on solidifying fundamentals before building to more complex concepts."
                    : "No worries — everyone starts somewhere. Your path is designed to gently build from the ground up."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detected Profile */}
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            <Card>
              <CardContent className="py-4 px-5">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Detected Level</span>
                </div>
                <Badge variant={detectedDifficulty === "advanced" ? "default" : detectedDifficulty === "intermediate" ? "secondary" : "outline"}>
                  {detectedDifficulty?.charAt(0).toUpperCase() + detectedDifficulty?.slice(1)}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 px-5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Path Type</span>
                </div>
                <Badge variant="secondary">
                  {recommendedPathType === "gentle" ? "Gentle Pace" : recommendedPathType === "intensive" ? "Intensive" : "Standard"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Concept Breakdown */}
          {conceptAccuracies.length > 0 && (
            <Card className="mb-6">
              <CardContent className="py-4 px-5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Concept Mastery
                </h3>
                <div className="space-y-3">
                  {conceptAccuracies.map((c, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Concept {i + 1}</span>
                        <span className={`font-medium ${c.accuracy >= 70 ? "text-emerald-600" : c.accuracy >= 50 ? "text-amber-600" : "text-orange-600"}`}>
                          {c.accuracy}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${c.accuracy >= 70 ? "bg-emerald-500" : c.accuracy >= 50 ? "bg-amber-500" : "bg-orange-500"}`}
                          style={{ width: `${c.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" className="gap-2" onClick={() => setLoc("/dashboard")}>
              <Trophy className="h-4 w-4" />
              Start Your Learning Journey
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Your personalized path is ready with {detectedDifficulty === "beginner" ? "gentle" : "structured"} steps tailored to your level.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Assessment in progress
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">All questions answered!</p>
          <Button className="mt-4" onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Assessment
          </Button>
        </div>
      </div>
    );
  }

  const difficultyColor =
    currentQuestion.difficulty === "easy" ? "text-emerald-600 bg-emerald-50" :
    currentQuestion.difficulty === "hard" ? "text-orange-600 bg-orange-50" :
    "text-amber-600 bg-amber-50";

  const typeIcon =
    currentQuestion.type === "recall" ? BookOpen :
    currentQuestion.type === "application" ? Target :
    Lightbulb;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Diagnostic Assessment</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Question {currentIndex + 1} of {questions.length}</span>
          </div>
        </div>
        <Progress value={progress} className="h-1 mt-3 max-w-2xl mx-auto" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="py-6 px-5">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className={`text-[10px] h-5 gap-1 ${difficultyColor}`}>
                {typeIcon ? createElement(typeIcon, { className: "h-3 w-3" }) : null}
                {currentQuestion.type}
              </Badge>
              <Badge variant="outline" className={`text-[10px] h-5 ${difficultyColor}`}>
                {currentQuestion.difficulty}
              </Badge>
            </div>

            <h2 className="text-lg font-semibold leading-relaxed mb-6">
              {currentQuestion.questionText}
            </h2>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt: string, idx: number) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctOptionIndex;
                const showCorrectness = showExplanation;

                let btnClass = "border hover:border-primary/50 hover:bg-primary/5";
                if (showCorrectness) {
                  if (isCorrect) btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900";
                  else if (isSelected && !isCorrect) btnClass = "border-red-400 bg-red-50 text-red-900";
                  else btnClass = "border-muted bg-muted/30";
                } else if (isSelected) {
                  btnClass = "border-primary bg-primary/10 text-primary";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${btnClass}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      showCorrectness
                        ? isCorrect
                          ? "bg-emerald-500 text-white"
                          : isSelected
                          ? "bg-red-400 text-white"
                          : "bg-muted text-muted-foreground"
                        : isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {showCorrectness && isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                       showCorrectness && isSelected && !isCorrect ? <XCircle className="h-3.5 w-3.5" /> :
                       String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Explanation */}
        {showExplanation && (
          <Card className={`mb-6 border-l-4 ${answers[answers.length - 1]?.correct ? "border-l-emerald-500" : "border-l-amber-500"}`}>
            <CardContent className="py-4 px-5">
              <div className="flex items-start gap-3">
                {answers[answers.length - 1]?.correct ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${answers[answers.length - 1]?.correct ? "text-emerald-700" : "text-amber-700"}`}>
                    {answers[answers.length - 1]?.correct ? "Correct!" : "Not quite — here's why:"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{currentQuestion.explanation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {answeredCount} of {questions.length} answered
          </div>
          {!showExplanation ? (
            <Button
              size="lg"
              className="gap-2"
              disabled={selectedOption === null}
              onClick={handleSubmitAnswer}
            >
              Submit Answer
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="gap-2"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {currentIndex < questions.length - 1 ? (
                <>Next Question <ChevronRight className="h-4 w-4" /></>
              ) : (
                <>Finish Assessment <CheckCircle2 className="h-4 w-4" /></>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
