import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetStudyDashboard, useGetStudyReviewQueue } from "@workspace/api-client-react";
import { useStudyAuth } from "@/hooks/use-study-auth";
import {
  BookOpen, Layers, Zap, TrendingUp, Target, BrainCircuit,
  BarChart3, Award, ArrowRight, User, LogOut, Flame
} from "lucide-react";

export default function StudyDashboard() {
  const [, setLoc] = useLocation();
  const { user, logout } = useStudyAuth();
  const { data: dashboard, isLoading: dashLoading } = useGetStudyDashboard();
  const { data: queue, isLoading: queueLoading } = useGetStudyReviewQueue();

  const totalDue = queue?.totalDue ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Paideia Study</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={() => setLoc("/profile")}>
            <User className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { logout(); setLoc("/"); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setLoc("/materials/new")}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">Add Material</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setLoc("/flashcards")}
          >
            <Zap className="h-5 w-5" />
            <span className="text-xs">Flashcards</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setLoc("/practice")}
          >
            <BrainCircuit className="h-5 w-5" />
            <span className="text-xs">Practice</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => setLoc("/exams")}
          >
            <Award className="h-5 w-5" />
            <span className="text-xs">Mock Exam</span>
          </Button>
        </div>

        {/* Stats Row */}
        {dashLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : dashboard ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold">{dashboard.materialCount}</p>
                <p className="text-xs text-muted-foreground">Materials</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold">{dashboard.conceptCount}</p>
                <p className="text-xs text-muted-foreground">Concepts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold">{dashboard.flashcardCount}</p>
                <p className="text-xs text-muted-foreground">Flashcards</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <p className="text-2xl font-bold">{dashboard.currentStreak}</p>
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Review Alert */}
        {totalDue > 0 && (
          <Card className="mb-8 border-primary">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{totalDue} flashcard{totalDue > 1 ? "s" : ""} due for review</p>
                  <p className="text-sm text-muted-foreground">Keep your streak alive!</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setLoc("/flashcards")}>
                Review Now <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Secondary Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover-elevate" onClick={() => setLoc("/tutor")}>
            <CardContent className="py-5 flex items-center gap-4">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold">AI Study Tutor</h3>
                <p className="text-sm text-muted-foreground">Chat with your Socratic tutor about any concept.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover-elevate" onClick={() => setLoc("/briefs")}>
            <CardContent className="py-5 flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold">Weekly Brief</h3>
                <p className="text-sm text-muted-foreground">See your progress, strengths, and next steps.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
