import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetStudyExam,
  useSubmitStudyExam,
} from "@workspace/api-client-react";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Award } from "lucide-react";

export default function StudyExamTake() {
  const { examId } = useParams<{ examId: string }>();
  const [, setLoc] = useLocation();
  const { data: exam, isLoading, refetch } = useGetStudyExam(examId);
  const submitMutation = useSubmitStudyExam();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState(0);

  const question = exam?.questions?.[currentIndex];

  useEffect(() => {
    if (!exam || exam.status === "completed") return;
    const total = exam.timeLimitMinutes * 60;
    setTimeLeft(total);
  }, [exam]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
      setTimeSpent((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Exam not found.</p>
      </div>
    );
  }

  if (exam.status === "completed" || summary) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => setLoc("/exams")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exams
          </Button>
        </header>
        <main className="max-w-lg mx-auto px-6 py-12 text-center">
          <Award className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Exam Complete!</h2>
          {exam.score !== null && exam.score !== undefined ? (
            <p className="text-lg mb-6">
              Score: {exam.score} / {exam.maxScore} ({Math.round((exam.score / (exam.maxScore || 1)) * 100)}%)
            </p>
          ) : summary ? (
            <p className="text-lg mb-6">
              Score: {summary.score} / {summary.maxScore} ({Math.round((summary.score / (summary.maxScore || 1)) * 100)}%)
            </p>
          ) : (
            <p className="text-muted-foreground">Exam already completed.</p>
          )}
          <Button onClick={() => setLoc("/exams")}>Back to Exams</Button>
        </main>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Processing your results...</p>
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  const progress = ((currentIndex) / exam.questionCount) * 100;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const handleAnswer = async () => {
    if (selectedIndex === null) return;
    const res = await submitMutation.mutateAsync({
      examId,
      data: {
        answers: [{ questionId: question.id, selectedOptionIndex: selectedIndex }],
        timeSpentSeconds: timeSpent,
      },
    });
    setResult(res);
    setSubmitted(true);
  };

  const handleNext = async () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= exam.questionCount) {
      setSummary(result);
      await refetch();
    }
    setCurrentIndex(nextIdx);
    setSelectedIndex(null);
    setSubmitted(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setLoc("/exams")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit Exam
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className={`font-mono ${timeLeft < 300 ? "text-red-500 font-bold" : ""}`}>
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        <div className="w-full bg-muted rounded-full h-2 mb-8">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }} />
        </div>

        <p className="text-sm text-muted-foreground mb-2">
          Question {currentIndex + 1} of {exam.questionCount}
        </p>

        <Card className="mb-6">
          <CardContent className="py-6">
            <p className="font-medium text-lg mb-6">{question.prompt}</p>
            <div className="space-y-2">
              {question.options.map((opt: string, i: number) => {
                let bg = "bg-background border hover:bg-muted";
                if (submitted) {
                  if (i === question.correctOptionIndex) bg = "bg-green-50 border-green-300";
                  else if (i === selectedIndex) bg = "bg-red-50 border-red-300";
                  else bg = "bg-muted border-muted opacity-50";
                } else if (i === selectedIndex) {
                  bg = "bg-primary/10 border-primary";
                }
                return (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelectedIndex(i)}
                    disabled={submitted}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${bg}`}
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {submitted && result && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  {result.correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{result.correct ? "Correct!" : "Incorrect"}</span>
                </div>
                <p className="text-sm text-muted-foreground">{result.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {!submitted ? (
          <Button className="w-full" onClick={handleAnswer} disabled={selectedIndex === null}>
            Submit Answer
          </Button>
        ) : (
          <Button className="w-full" onClick={handleNext}>
            {currentIndex + 1 >= exam.questionCount ? "Finish Exam" : "Next Question"}
          </Button>
        )}
      </main>
    </div>
  );
}
