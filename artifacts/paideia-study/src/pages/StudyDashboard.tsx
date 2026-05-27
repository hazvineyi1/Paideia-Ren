import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGetStudyDashboard, useGetStudyReviewQueue } from "@workspace/api-client-react";
import { useStudyAdaptiveRecommendations, useStudyKnowledgeGraph } from "@/hooks/use-study-api";
import { useStudyAuth } from "@/hooks/use-study-auth";
import { useEffect, useState } from "react";
import {
  BookOpen, Layers, Zap, TrendingUp, Target, BrainCircuit,
  BarChart3, Award, ArrowRight, User, LogOut, Flame, Sparkles,
  Lightbulb, Compass, Network, FileText, Clock, ChevronRight,
  Brain, Target as TargetIcon, ChevronDown, Star
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

function AdaptiveCard({
  icon: Icon,
  title,
  description,
  action,
  onClick,
  variant = "default",
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  variant?: "primary" | "default" | "urgent";
}) {
  const bgClass = variant === "primary"
    ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"
    : variant === "urgent"
    ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
    : "bg-card hover:bg-accent/50";

  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md ${bgClass}`} onClick={onClick}>
      <CardContent className="py-5 px-5">
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl ${variant === "primary" ? "bg-primary/10" : variant === "urgent" ? "bg-orange-100" : "bg-muted"}`}>
            <Icon className={`h-5 w-5 ${variant === "primary" ? "text-primary" : variant === "urgent" ? "text-orange-600" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
            <div className="flex items-center gap-1 mt-2.5 text-xs font-medium text-primary">
              {action}
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MasteryRing({ label, value, color = "primary" }: { label: string; value: number; color?: string }) {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-[44px] h-[44px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
          <circle
            cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={color === "primary" ? "text-primary" : color === "orange" ? "text-orange-500" : color === "green" ? "text-emerald-500" : "text-blue-500"}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{Math.round(value)}%</span>
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[60px]">{label}</span>
    </div>
  );
}

export default function StudyDashboard() {
  const [, setLoc] = useLocation();
  const { user, logout } = useStudyAuth();
  const { data: dashboard, isLoading: dashLoading } = useGetStudyDashboard();
  const { data: queue, isLoading: queueLoading } = useGetStudyReviewQueue();
  const { data: adaptive, isLoading: adaptiveLoading } = useStudyAdaptiveRecommendations();
  const { data: kgraph } = useStudyKnowledgeGraph();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const totalDue = queue?.totalDue ?? 0;
  const newCards = queue?.newCards?.length ?? 0;

  // Build recommendations from real adaptive API
  const recs = adaptive?.recommendations ?? [];
  const iconMap: Record<string, typeof Zap> = {
    flashcard_review: Zap,
    practice_weak: BrainCircuit,
    practice: BrainCircuit,
    learning_path: Compass,
    exam: Award,
  };

  const recommendations = recs.slice(0, 4).map((r) => ({
    icon: iconMap[r.type] ?? Lightbulb,
    title: r.title,
    description: r.description,
    action: r.action.includes("flashcard") ? "Start Review"
      : r.action.includes("practice") ? "Begin Practice"
      : r.action.includes("exam") ? "Take Exam"
      : r.action.includes("knowledge") ? "View Map"
      : "Go",
    onClick: () => setLoc(r.action),
    variant: r.priority >= 9 ? "urgent" : r.priority >= 7 ? "primary" : "default" as "primary" | "default" | "urgent",
  }));

  // If no real recommendations, show defaults
  if (recommendations.length === 0) {
    recommendations.push(
      { icon: Zap, title: "Review Due Flashcards", description: `${totalDue} cards waiting.`, action: "Start Review", onClick: () => setLoc("/flashcards"), variant: totalDue > 5 ? "urgent" : "primary" },
      { icon: BrainCircuit, title: "Adaptive Practice", description: "AI-selected questions targeting weak areas.", action: "Begin Practice", onClick: () => setLoc("/practice"), variant: "primary" },
      { icon: Network, title: "Explore Knowledge Map", description: "Discover connections between concepts.", action: "View Map", onClick: () => setLoc("/knowledge-map"), variant: "default" },
    );
  }

  // Build mastery areas from knowledge graph nodes
  const nodeCategories: Record<string, { total: number; sum: number }> = {};
  for (const n of kgraph?.nodes ?? []) {
    const cat = n.category || "General";
    if (!nodeCategories[cat]) nodeCategories[cat] = { total: 0, sum: 0 };
    nodeCategories[cat].total++;
    nodeCategories[cat].sum += (n.masteryLevel ?? 0) * 100;
  }

  const masteryAreas = Object.entries(nodeCategories).slice(0, 4).map(([label, v]) => ({
    label,
    value: v.total > 0 ? Math.round(v.sum / v.total) : 0,
    color: label.toLowerCase().includes("biolog") || label.toLowerCase().includes("chem") ? "primary"
      : label.toLowerCase().includes("genetic") ? "orange"
      : label.toLowerCase().includes("physio") ? "green"
      : "blue" as string,
  }));

  // Fallback mastery areas if no knowledge nodes yet
  if (masteryAreas.length === 0) {
    masteryAreas.push(
      { label: "Cell Biology", value: 72, color: "primary" },
      { label: "Organic Chem", value: 45, color: "orange" },
      { label: "Physiology", value: 88, color: "green" },
      { label: "Genetics", value: 60, color: "blue" },
    );
  }

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
            <TargetIcon className="h-3.5 w-3.5" />
            Goals
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => { logout(); setLoc("/"); }}>
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Welcome + Quick Stats */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <Greeting name={user?.name} />
            <p className="text-sm text-muted-foreground mt-1">
              Your AI learning companion has prepared today's optimal study plan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {dashboard && (
              <>
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {dashboard.currentStreak} day streak
                </Badge>
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  <Clock className="h-3 w-3" />
                  {Math.round((dashboard.practiceSessionsThisWeek * 15 + dashboard.flashcardCount * 2) / 60)}h this week
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Main Grid: Recommendations + Mastery + Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Adaptive Recommendations */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">Recommended for You</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {recommendations.map((rec, i) => (
                <AdaptiveCard key={i} {...rec} />
              ))}
            </div>

            {/* Study Path Preview */}
            <Card className="border-dashed">
              <CardContent className="py-4 px-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Today's Learning Path</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">~25 min estimated</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Review flashcards", done: totalDue === 0, time: "8 min", icon: Zap },
                    { label: "Adaptive practice: Cell Biology", done: false, time: "12 min", icon: BrainCircuit },
                    { label: "Read: Cell Division chapter", done: false, time: "5 min", icon: BookOpen },
                  ].map((step, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${step.done ? "bg-muted/50" : "bg-primary/5"}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step.done ? "bg-green-100 text-green-700" : "bg-primary text-primary-foreground"}`}>
                        {step.done ? "✓" : i + 1}
                      </div>
                      <span className={`text-sm flex-1 ${step.done ? "line-through text-muted-foreground" : ""}`}>{step.label}</span>
                      <span className="text-xs text-muted-foreground">{step.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Mastery + Stats */}
          <div className="space-y-4">
            {/* Concept Mastery */}
            <Card>
              <CardContent className="py-4 px-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Network className="h-4 w-4 text-primary" />
                    Concept Mastery
                  </h3>
                  <Button variant="ghost" size="sm" className="h-auto text-xs px-2 py-1" onClick={() => setLoc("/knowledge-map")}>
                    View All
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {masteryAreas.map((area) => (
                    <MasteryRing key={area.label} {...area} />
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Overall Mastery</span>
                    <span className="font-semibold">66%</span>
                  </div>
                  <Progress value={66} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card>
              <CardContent className="py-4 px-5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  This Week
                </h3>
                {dashLoading ? (
                  <div className="h-24 flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : dashboard ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Flashcards</span>
                      <span className="font-medium">{dashboard.flashcardCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Practice Sessions</span>
                      <span className="font-medium">{dashboard.practiceSessionsThisWeek}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Mock Exams</span>
                      <span className="font-medium">{dashboard.mockExamsTaken}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Accuracy</span>
                      <span className="font-medium">{Math.round(dashboard.averageAccuracy * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tutor Chats</span>
                      <span className="font-medium">{dashboard.tutorMessagesThisWeek}</span>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Quick Add */}
            <Card className="bg-primary/5 border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setLoc("/materials/new")}>
              <CardContent className="py-4 px-5 flex items-center gap-3">
                <div className="bg-primary/15 p-2 rounded-lg">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Add New Material</h3>
                  <p className="text-xs text-muted-foreground">PDF, URL, image, or paste text</p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom: Materials Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Your Materials
            </h2>
            <Button variant="ghost" size="sm" className="h-auto text-xs" onClick={() => setLoc("/materials")}>
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { title: "Advanced Cell Biology", type: "PDF", concepts: 12, progress: 60, color: "bg-blue-50 border-blue-100" },
              { title: "Organic Chemistry Notes", type: "Text", concepts: 24, progress: 35, color: "bg-amber-50 border-amber-100" },
              { title: "Human Physiology", type: "URL", concepts: 8, progress: 80, color: "bg-emerald-50 border-emerald-100" },
              { title: "Genetics Fundamentals", type: "PDF", concepts: 15, progress: 20, color: "bg-purple-50 border-purple-100" },
            ].map((mat, i) => (
              <Card key={i} className={`cursor-pointer hover:shadow-md transition-all ${mat.color}`} onClick={() => setLoc("/materials")}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-[10px] h-5">{mat.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{mat.concepts} concepts</span>
                  </div>
                  <h4 className="font-medium text-sm truncate">{mat.title}</h4>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{mat.progress}%</span>
                    </div>
                    <Progress value={mat.progress} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
