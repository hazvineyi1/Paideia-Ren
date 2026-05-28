import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StudyAuthProvider, useStudyAuth } from "@/hooks/use-study-auth";
import { useEffect, type ComponentType } from "react";

import NotFound from "@/pages/not-found";
import StudyLanding from "@/pages/StudyLanding";
import StudyLogin from "@/pages/StudyLogin";
import StudySignup from "@/pages/StudySignup";
import StudyDashboard from "@/pages/StudyDashboard";
import StudyMaterials from "@/pages/StudyMaterials";
import StudyMaterialNew from "@/pages/StudyMaterialNew";
import StudyFlashcards from "@/pages/StudyFlashcards";
import StudyPractice from "@/pages/StudyPractice";
import StudyPracticeSession from "@/pages/StudyPracticeSession";
import StudyExams from "@/pages/StudyExams";
import StudyExamTake from "@/pages/StudyExamTake";
import StudyTutor from "@/pages/StudyTutor";
import StudyTutorChat from "@/pages/StudyTutorChat";
import StudyProfile from "@/pages/StudyProfile";
import StudyBriefs from "@/pages/StudyBriefs";
import StudyKnowledgeMap from "@/pages/StudyKnowledgeMap";
import StudyMaterialView from "@/pages/StudyMaterialView";
import StudyAssessment from "@/pages/StudyAssessment";
import StudyDailySession from "@/pages/StudyDailySession";
import StudyLearningPath from "@/pages/StudyLearningPath";
import StudyLearningStyle from "@/pages/StudyLearningStyle";
import StudyStrategy from "@/pages/StudyStrategy";

const queryClient = new QueryClient();

function Protected({ component: Component }: { component: ComponentType }) {
  const { user, loading } = useStudyAuth();
  const [, setLoc] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLoc("/login");
    }
  }, [loading, user, setLoc]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={StudyLanding} />
      <Route path="/login" component={StudyLogin} />
      <Route path="/signup" component={StudySignup} />
      <Route path="/dashboard" component={() => <Protected component={StudyDashboard} />} />
      <Route path="/materials" component={() => <Protected component={StudyMaterials} />} />
      <Route path="/materials/new" component={() => <Protected component={StudyMaterialNew} />} />
      <Route path="/materials/:materialId" component={() => <Protected component={StudyMaterialView} />} />
      <Route path="/flashcards" component={() => <Protected component={StudyFlashcards} />} />
      <Route path="/practice" component={() => <Protected component={StudyPractice} />} />
      <Route path="/practice/:sessionId" component={StudyPracticeSession} />
      <Route path="/exams" component={() => <Protected component={StudyExams} />} />
      <Route path="/exams/:examId/take" component={StudyExamTake} />
      <Route path="/tutor" component={() => <Protected component={StudyTutor} />} />
      <Route path="/tutor/:conversationId" component={StudyTutorChat} />
      <Route path="/profile" component={() => <Protected component={StudyProfile} />} />
      <Route path="/briefs" component={() => <Protected component={StudyBriefs} />} />
      <Route path="/knowledge-map" component={() => <Protected component={StudyKnowledgeMap} />} />
      <Route path="/assessment/:id" component={() => <Protected component={StudyAssessment} />} />
      <Route path="/daily-session" component={() => <Protected component={StudyDailySession} />} />
      <Route path="/learning-path/:id" component={() => <Protected component={StudyLearningPath} />} />
      <Route path="/learning-style" component={() => <Protected component={StudyLearningStyle} />} />
      <Route path="/strategy/:materialId" component={() => <Protected component={StudyStrategy} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StudyAuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </StudyAuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
