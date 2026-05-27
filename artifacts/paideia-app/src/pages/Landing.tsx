import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

const TEACHER_FEATURES = [
  {
    title: "Lesson planner",
    body: "Differentiated lesson plans with starters, main tasks, exit tickets and common misconceptions, ready in under a minute.",
  },
  {
    title: "Worksheet generator",
    body: "Practice sheets with mixed question types and full answer keys, sized to your class and difficulty level.",
  },
  {
    title: "Parent update drafts",
    body: "Warm, professional emails to parents and carers, drafted from a few notes you provide.",
  },
  {
    title: "Quizzes and exit tickets",
    body: "Quick formative checks with multiple choice, short answer and true or false items, graded across difficulty.",
  },
];

const STUDENT_FEATURES = [
  {
    title: "Study Tutor",
    body: "AI tutor grounded in your actual class assignments. Ask questions about worksheets, quizzes, and lesson plans. Toggle Socratic mode for deeper reasoning.",
  },
  {
    title: "VARK Diagnostic",
    body: "Discover your learning style — visual, auditory, reading, or kinesthetic — and get personalized explanations that match how you learn best.",
  },
];

export default function Landing() {
  const { teacher, loading } = useAuth();
  const [, setLoc] = useLocation();
  useEffect(() => {
    if (!loading && teacher) setLoc("/dashboard");
  }, [loading, teacher, setLoc]);
  const go = (path: string) => () => setLoc(path);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-8 py-6 border-b bg-card flex items-center justify-between">
        <div>
          <div className="font-serif text-2xl text-primary leading-tight">Paideia-Ren</div>
          <div className="text-xs tracking-wider uppercase text-muted-foreground">Teaching Companion</div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={go("/student/login")}>Student sign in</Button>
          <Button variant="ghost" onClick={go("/login")}>Teacher sign in</Button>
          <Button onClick={go("/signup")}>Create free account</Button>
        </div>
      </header>

      {/* Study Tutor — standalone student tool, front and center */}
      <section className="px-8 py-16 bg-primary/5 border-b">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <span>New</span>
              <span>AI Study Tutor</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-primary leading-tight mb-4">
              Study Tutor
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              An AI tutor grounded in your actual class assignments. Ask questions about worksheets, quizzes, and lesson plans. Toggle Socratic mode for deeper reasoning, and get explanations tailored to your VARK learning style.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={go("/student/login")}>Open Study Tutor</Button>
              <Button size="lg" variant="outline" onClick={go("/student/login")}>Student sign in</Button>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary text-sm font-semibold">AI</span>
              </div>
              <div className="bg-muted rounded-lg rounded-tl-none px-4 py-3 text-sm">
                <p className="text-foreground">What is photosynthesis and how does it relate to the worksheet we did last week?</p>
              </div>
            </div>
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <div className="bg-primary/10 rounded-lg rounded-tr-none px-4 py-3 text-sm">
                <p className="text-foreground">Photosynthesis is the process plants use to convert sunlight into energy. Based on your Worksheet 3 on plant biology [Source: Worksheet], plants take in CO2 and release oxygen...</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-background border text-muted-foreground">Concept: Photosynthesis</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-background border text-muted-foreground">Source: Worksheet 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-20 max-w-5xl mx-auto text-center">
        <h1 className="font-serif text-5xl md:text-6xl text-primary leading-tight mb-6">
          Your planning, drafting, and assessment partner.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Built for teachers, lecturers, and trainers across primary, secondary, higher education, adult learning, and vocational training in the US, UK, Europe, Africa, and Asia. Generate lesson plans, worksheets, learner updates, and quizzes that respect your curriculum and your time.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" className="px-8" onClick={go("/signup")}>Start for free</Button>
          <Button size="lg" variant="outline" onClick={go("/login")}>Teacher sign in</Button>
        </div>
        <div className="mt-4">
          <Button size="lg" variant="ghost" className="text-primary underline-offset-4 hover:underline" onClick={go("/samples/public")}>Browse free samples</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-6">No credit card. No student data. English at launch.</p>
      </section>

      {/* Teacher Tools Section */}
      <section className="px-8 py-16 max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="font-serif text-3xl text-primary">For Teachers</h2>
          <p className="text-muted-foreground mt-1">Cut planning time and deliver richer, more differentiated lessons.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEACHER_FEATURES.map((f) => (
            <div key={f.title} className="bg-card border rounded-lg p-6">
              <h3 className="font-serif text-2xl text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-8 py-8 border-t text-center text-xs text-muted-foreground">
        Paideia-Ren Inc. A teacher tool. No student personal data is collected in v1.
      </footer>
    </div>
  );
}
