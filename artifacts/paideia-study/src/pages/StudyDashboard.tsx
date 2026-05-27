import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useStudyAuth } from "@/hooks/use-study-auth";
import { useDailySession, useStudyPaths } from "@/hooks/use-study-journey";
import {
  BookOpen, Zap, TrendingUp, ArrowRight, LogOut, Flame, Sparkles,
  Compass, Network, Clock, ChevronRight, Brain, Target, PlayCircle,
  CheckCircle2, Award, BarChart3, Lightbulb, Rocket
} from "lucide-react";

function Greeting({ name }: { name?: string }) {
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  return (
    <h1 className="text-2xl font-bold">
      {greeting}{name ? `, ${name.split(" ")[0]}` : ""}
    </h1>
  );
}

export default function StudyDashboard() {
  const [, setLoc] = useLocation();
  const { user, logout } = useStudyAuth();
  const { data: sessionData, isLoading: sessionLoading } = useDailySession();
  const { data: paths, isLoading: pathsLoading } = useStudyPaths();

  const activePath = paths?.find?.((p: any) => p.status === "active") ?? null;
  const hasActivePath = sessionData?.hasActivePath ?? false;
  const progress = sessionData?.progress ?? { completedSteps: 0, totalSteps: 0, percentComplete: 0, currentConcept: null };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="border-b px-4 md:px-6 py-3 flex items-center justify-between bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">Paideia</span>
            <span className="font-light text-sm text-muted-foreground ml-0.5">Study</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-xs" onClick={() => setLoc("/profile")}>
            <Target className="h-3.5 w-3.5" />
            Profile
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => { logout(); setLoc("/"); }}>
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Welcome */}
        <div>
          <Greeting name={user?.name} />
          <p className="text-sm text-muted-foreground mt-1">
            {hasActivePath
              ? "Your AI learning companion has prepared today's optimal session."
              : "Ready to start your personalized learning journey?"}
          </p>
        </div>

        {/* Main Action: Today's Session or Start Journey */}
        {sessionLoading || pathsLoading ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading your learning journey...</p>
            </CardContent>
          </Card>
        ) : hasActivePath ? (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="py-5 px-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Flame className="h-3 w-3 text-orange-500" />
                      Today's Session
                    </Badge>
                    {progress.currentConcept && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        <Compass className="h-3 w-3 mr-1" />
                        {progress.currentConcept}
                      </Badge>
                    )}
                  </div>
                  <h2 className="font-semibold text-lg mb-1">
                    {activePath?.title || "Continue Your Learning Path"}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      {progress.completedSteps} of {progress.totalSteps} steps done
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{sessionData?.session?.totalEstimatedMinutes ?? 0} min today
                    </span>
                  </div>
                  <Progress value={progress.percentComplete} className="h-2 mb-1" />
                  <p className="text-[10px] text-muted-foreground">{progress.percentComplete}% complete overall</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button className="gap-2" onClick={() => setLoc("/daily-session")}>
                    <PlayCircle className="h-4 w-4" />
                    Start Today's Session
                  </Button>
                  {activePath?.id && (
                    <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => setLoc(`/learning-path/${activePath.id}`)}>
                      <Compass className="h-3.5 w-3.5" />
                      View Full Path
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-primary/30 bg-primary/5">
            <CardContent className="py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Start Your Learning Journey</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Add your first study material, take a quick diagnostic assessment, and let AI build your personalized learning path.
              </p>
              <Button size="lg" className="gap-2" onClick={() => setLoc("/materials/new")}>
                <BookOpen className="h-4 w-4" />
                Add Your First Material
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> AI Assessment</span>
                <span className="flex items-center gap-1"><Compass className="h-3 w-3" /> Personalized Path</span>
                <span className="flex items-center gap-1"><Brain className="h-3 w-3" /> Adaptive Learning</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30" onClick={() => setLoc("/flashcards")}>
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Flashcards</h3>
                  <p className="text-[10px] text-muted-foreground">Spaced repetition</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30" onClick={() => setLoc("/practice")}>
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Target className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Practice</h3>
                  <p className="text-[10px] text-muted-foreground">Adaptive questions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30" onClick={() => setLoc("/tutor")}>
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">AI Tutor</h3>
                  <p className="text-[10px] text-muted-foreground">Socratic guidance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30" onClick={() => setLoc("/knowledge-map")}>
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Network className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Knowledge Map</h3>
                  <p className="text-[10px] text-muted-foreground">Concept web</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Paths List */}
        {paths && paths.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                Your Learning Paths
              </h2>
              <Button variant="ghost" size="sm" className="h-auto text-xs gap-1" onClick={() => setLoc("/materials/new")}>
                <Sparkles className="h-3 w-3" />
                New Path
              </Button>
            </div>
            <div className="space-y-2">
              {paths.slice(0, 3).map((path: any) => (
                <Card
                  key={path.id}
                  className={`cursor-pointer hover:shadow-sm transition-all ${path.status === "active" ? "border-primary/30" : ""}`}
                  onClick={() => setLoc(`/learning-path/${path.id}`)}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        path.status === "active" ? "bg-primary/10" : "bg-muted"
                      }`}>
                        {path.status === "completed" ? (
                          <Award className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Compass className={`h-4 w-4 ${path.status === "active" ? "text-primary" : "text-muted-foreground"}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium truncate">{path.title}</h3>
                          {path.status === "active" && (
                            <Badge variant="secondary" className="text-[10px] h-4">Active</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <Progress value={path.stats?.percentComplete ?? 0} className="h-1.5 w-24" />
                          <span className="text-[10px] text-muted-foreground">
                            {path.stats?.completed ?? 0}/{path.stats?.total ?? 0} steps
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="py-4 px-4 text-center">
              <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{progress.completedSteps}</p>
              <p className="text-[10px] text-muted-foreground">Steps Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 px-4 text-center">
              <Network className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{sessionData?.path?.nodeSequence?.length ?? (paths?.[0]?.stats?.total ?? 0)}</p>
              <p className="text-[10px] text-muted-foreground">Total Steps</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 px-4 text-center">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{progress.percentComplete}%</p>
              <p className="text-[10px] text-muted-foreground">Overall Progress</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
