import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useRef } from "react";
import { initAnalytics, track } from "@/lib/analytics";
import NotFound from "@/pages/not-found";

import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Team from "@/pages/Team";
import Platform from "@/pages/Platform";
import Research from "@/pages/Research";
import Blueprint from "@/pages/Blueprint";
import ForSchools from "@/pages/ForSchools";
import ForFunders from "@/pages/ForFunders";
import ForEducators from "@/pages/ForEducators";
import WhereWeWork from "@/pages/WhereWeWork";
import News from "@/pages/News";
import Transparency from "@/pages/Transparency";
import Contact from "@/pages/Contact";

const queryClient = new QueryClient();

function AnalyticsTracker() {
  const [loc] = useLocation();
  const inited = useRef(false);
  const prev = useRef<string | null>(null);
  useEffect(() => {
    if (!inited.current) {
      initAnalytics({ surface: "site" });
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

function Router() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <AnalyticsTracker />
      <Nav />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/team" component={Team} />
          <Route path="/platform" component={Platform} />
          <Route path="/research" component={Research} />
          <Route path="/blueprint" component={Blueprint} />
          <Route path="/for-schools" component={ForSchools} />
          <Route path="/for-funders" component={ForFunders} />
          <Route path="/for-educators" component={ForEducators} />
          <Route path="/where-we-work" component={WhereWeWork} />
          <Route path="/news" component={News} />
          <Route path="/transparency" component={Transparency} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
