import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BookOpen, BrainCircuit, Zap, Award, TrendingUp,
  Layers, Sparkles, ArrowRight
} from "lucide-react";

export default function StudyLanding() {
  const [, setLoc] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="px-6 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Paideia Study</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setLoc("/login")}>
            Sign In
          </Button>
          <Button size="sm" onClick={() => setLoc("/signup")}>
            Get Started
          </Button>
        </div>
      </header>

      <main>
        <section className="text-center px-6 py-20 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Your AI-Powered Study Companion
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Upload any material and get adaptive flashcards, a Socratic AI tutor, mock exams,
            and personalized progress briefs. Built for independent learners.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" onClick={() => setLoc("/signup")}>
              Start Learning Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => setLoc("/login")}>
              Sign In
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-16 bg-muted/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10">Everything you need to ace your exams</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-background p-6 rounded-lg border">
                <Sparkles className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">AI Concept Extraction</h3>
                <p className="text-sm text-muted-foreground">
                  Paste notes or a link and watch AI automatically extract key concepts and generate flashcards.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg border">
                <Zap className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Spaced Repetition Flashcards</h3>
                <p className="text-sm text-muted-foreground">
                  SM-2 powered review scheduling. Study at the exact moment your brain is ready to learn.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg border">
                <BrainCircuit className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Socratic AI Tutor</h3>
                <p className="text-sm text-muted-foreground">
                  Ask anything. Your tutor knows your materials, concepts, and learning profile.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg border">
                <Award className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Mock Exams</h3>
                <p className="text-sm text-muted-foreground">
                  Simulate real exam conditions with timed tests generated from your materials.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg border">
                <TrendingUp className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Weekly Progress Briefs</h3>
                <p className="text-sm text-muted-foreground">
                  AI-generated summaries of your progress, strengths, and what to focus on next.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg border">
                <Layers className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Learner Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Customize your exam target, study style, interests, and daily goals for personalized learning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to start learning?</h2>
          <p className="text-muted-foreground mb-6">Free to start. Upgrade when you want unlimited AI features.</p>
          <Button size="lg" onClick={() => setLoc("/signup")}>
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </section>
      </main>
    </div>
  );
}
