import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { StudentAuthProvider } from "@/hooks/use-student-auth";
import { useEffect, useRef, type ComponentType } from "react";
import { initAnalytics, track } from "@/lib/analytics";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import PlanNew from "@/pages/PlanNew";
import PlanView from "@/pages/PlanView";
import WorksheetNew from "@/pages/WorksheetNew";
import WorksheetView from "@/pages/WorksheetView";
import ParentDraftNew from "@/pages/ParentDraftNew";
import ParentDraftView from "@/pages/ParentDraftView";
import QuizNew from "@/pages/QuizNew";
import QuizView from "@/pages/QuizView";
import { SamplesList, SampleViewer } from "@/pages/Samples";
import Settings from "@/pages/Settings";
import Classes from "@/pages/Classes";
import ClassView from "@/pages/ClassView";
import StudentProfile from "@/pages/StudentProfile";
import AssignmentView from "@/pages/AssignmentView";
import PublicTake from "@/pages/PublicTake";
import StudentLogin from "@/pages/student/StudentLogin";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentTake from "@/pages/student/StudentTake";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Protected({ component: Component }: { component: ComponentType }) {
  const { teacher, loading } = useAuth();
  const [, setLoc] = useLocation();
  useEffect(() => {
    if (!loading && !teacher) setLoc("/login");
  }, [loading, teacher, setLoc]);
  if (loading || !teacher) return null;
  return <Component />;
}

function AnalyticsTracker() {
  const [loc] = useLocation();
  const inited = useRef(false);
  const prev = useRef<string | null>(null);
  useEffect(() => {
    if (!inited.current) {
      initAnalytics({ surface: "app" });
      inited.current = true;
      prev.current = loc;
      track("page_view", { initial: true });
      return;
    }
    if (prev.current !== loc) {
      prev.current = loc;
      track("page_view", { trigger: "spa" });
    }
  }, [loc]);
  return null;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/take/:code" component={PublicTake} />
      <Route path="/student/login" component={StudentLogin} />
      <Route path="/student/assignments/:id" component={StudentTake} />
      <Route path="/student" component={StudentDashboard} />
      <Route path="/dashboard">{() => <Protected component={Dashboard} />}</Route>
      <Route path="/plans/new">{() => <Protected component={PlanNew} />}</Route>
      <Route path="/plans/:id">{() => <Protected component={PlanView} />}</Route>
      <Route path="/worksheets/new">{() => <Protected component={WorksheetNew} />}</Route>
      <Route path="/worksheets/:id">{() => <Protected component={WorksheetView} />}</Route>
      <Route path="/parent-drafts/new">{() => <Protected component={ParentDraftNew} />}</Route>
      <Route path="/parent-drafts/:id">{() => <Protected component={ParentDraftView} />}</Route>
      <Route path="/quizzes/new">{() => <Protected component={QuizNew} />}</Route>
      <Route path="/quizzes/:id">{() => <Protected component={QuizView} />}</Route>
      <Route path="/samples/:id">{() => <Protected component={SampleViewer} />}</Route>
      <Route path="/samples">{() => <Protected component={SamplesList} />}</Route>
      <Route path="/classes/:id/students/:studentId">{() => <Protected component={StudentProfile} />}</Route>
      <Route path="/classes/:id">{() => <Protected component={ClassView} />}</Route>
      <Route path="/classes">{() => <Protected component={Classes} />}</Route>
      <Route path="/assignments/:id">{() => <Protected component={AssignmentView} />}</Route>
      <Route path="/settings">{() => <Protected component={Settings} />}</Route>
      <Route path="/admin">{() => <Protected component={Admin} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <StudentAuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AnalyticsTracker />
              <AppRoutes />
            </WouterRouter>
            <Toaster />
          </StudentAuthProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
