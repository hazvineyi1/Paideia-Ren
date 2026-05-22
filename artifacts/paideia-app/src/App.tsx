import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useEffect, type ComponentType } from "react";

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

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
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
      <Route path="/settings">{() => <Protected component={Settings} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
