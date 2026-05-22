import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

function Router() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
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
