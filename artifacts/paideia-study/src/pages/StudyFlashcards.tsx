import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetStudyReviewQueue,
  useReviewStudyFlashcard,
  getGetStudyReviewQueueQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RotateCcw, Eye, EyeOff, ChevronRight, Flame } from "lucide-react";
import type { StudyFlashcard } from "@workspace/api-client-react";

export default function StudyFlashcards() {
  const [, setLoc] = useLocation();
  const { data: queue, isLoading } = useGetStudyReviewQueue();
  const reviewMutation = useReviewStudyFlashcard();
  const queryClient = useQueryClient();

  const allCards = [
    ...(queue?.dueToday ?? []),
    ...(queue?.newCards ?? []),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!allCards || allCards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => setLoc("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </header>
        <main className="max-w-md mx-auto px-6 py-16 text-center">
          <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">All caught up!</h2>
          <p className="text-muted-foreground mb-4">
            No flashcards due for review. Check back later or add new material.
          </p>
          <Button onClick={() => setLoc("/materials/new")}>Add Material</Button>
        </main>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b px-6 py-4">
          <Button variant="ghost" size="sm" onClick={() => setLoc("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </header>
        <main className="max-w-md mx-auto px-6 py-16 text-center">
          <Flame className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Review Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You reviewed {allCards.length} flashcards. Great job keeping your streak alive.
          </p>
          <Button onClick={() => setLoc("/dashboard")}>Back to Dashboard</Button>
        </main>
      </div>
    );
  }

  const currentCard = allCards[currentIndex];
  const progress = ((currentIndex) / allCards.length) * 100;

  const handleReview = async (quality: number) => {
    await reviewMutation.mutateAsync({
      flashcardId: currentCard.id,
      data: { quality },
    });
    setShowBack(false);
    if (currentIndex + 1 >= allCards.length) {
      setSessionComplete(true);
      queryClient.invalidateQueries({ queryKey: getGetStudyReviewQueueQueryKey() });
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setLoc("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-orange-500" />
          <span>
            {currentIndex + 1} / {allCards.length}
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        {/* Progress */}
        <div className="w-full bg-muted rounded-full h-2 mb-8">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flashcard */}
        <Card
          className="min-h-[280px] flex flex-col cursor-pointer hover-elevate"
          onClick={() => !showBack && setShowBack(true)}
        >
          <CardContent className="flex-1 flex flex-col items-center justify-center py-8 text-center">
            {showBack ? (
              <>
                <p className="text-sm text-muted-foreground mb-2">Answer</p>
                <p className="text-lg">{currentCard.back}</p>
                {currentCard.hint && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Hint: {currentCard.hint}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">Question</p>
                <p className="text-xl font-medium">{currentCard.front}</p>
                <p className="text-sm text-muted-foreground mt-6">
                  Click or tap to reveal answer
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Rating buttons */}
        {showBack ? (
          <div className="grid grid-cols-3 gap-2 mt-6">
            <Button variant="outline" onClick={() => handleReview(1)}>
              Again
            </Button>
            <Button variant="outline" onClick={() => handleReview(3)}>
              Good
            </Button>
            <Button onClick={() => handleReview(5)}>
              Easy
            </Button>
          </div>
        ) : (
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={() => setShowBack(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Show Answer
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
