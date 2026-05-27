import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Brain, Eye, Ear, BookOpen as BookIcon, Dumbbell, ArrowRight } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const features = [
  {
    icon: MessageCircle,
    title: "Grounded in your class",
    description: "The tutor knows the worksheets, quizzes, and lesson plans your teacher assigned. Every answer cites the exact source.",
  },
  {
    icon: Brain,
    title: "Socratic mode",
    description: "Flip a switch and the tutor stops explaining. Instead, it asks you questions that make you think deeper — definitions, examples, assumptions, and consequences.",
  },
  {
    icon: Eye,
    title: "VARK learning style",
    description: "A built-in diagnostic discovers how you learn best — visual, auditory, reading, or kinesthetic. The tutor then adapts every explanation to match your style.",
  },
];

const varkStyles = [
  { icon: Eye, label: "Visual", desc: "Diagrams, charts, and spatial reasoning" },
  { icon: Ear, label: "Auditory", desc: "Narratives, discussions, and rhythm" },
  { icon: BookIcon, label: "Reading", desc: "Text, lists, and structured notes" },
  { icon: Dumbbell, label: "Kinesthetic", desc: "Hands-on examples and movement-based analogies" },
];

export default function StudyTutor() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-[120px] max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary text-[13px] font-semibold uppercase tracking-widest mb-6">
                <span>New</span>
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span>AI Study Tutor</span>
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8"
            >
              Learn with a tutor that knows your classroom.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-[17px] text-foreground/80 leading-[1.75] mb-10 max-w-[560px]"
            >
              The Paideia-Ren Study Tutor is a conversational AI that answers questions about your actual class material — not generic internet answers. It cites your worksheets, quizzes, and lesson plans, and adapts to how you learn best.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 h-14 text-base rounded-none"
              >
                <a href="/app/student/login">Open Study Tutor</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5 px-8 h-14 text-base rounded-none"
              >
                <a href="/app/student/login">Student sign-in</a>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="bg-white rounded-none border shadow-sm p-8 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary text-sm font-semibold">AI</span>
                </div>
                <div className="bg-muted rounded-lg rounded-tl-none px-4 py-3 text-sm max-w-[85%]">
                  <p className="text-foreground leading-relaxed">
                    What is photosynthesis and how does it relate to the worksheet we did last week?
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <div className="bg-primary/10 rounded-lg rounded-tr-none px-4 py-3 text-sm max-w-[85%]">
                  <p className="text-foreground leading-relaxed">
                    Photosynthesis is the process plants use to convert sunlight into energy. Based on your Worksheet 3 on plant biology, plants take in CO2 and release oxygen...
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-white border text-muted-foreground">Concept: Photosynthesis</span>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-white border text-muted-foreground">Source: Worksheet 3</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-[40px] text-primary mb-16">
            What makes it different.
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="w-12 h-12 bg-white border border-border flex items-center justify-center mb-6">
                  <f.icon strokeWidth={1.5} size={22} className="text-primary" />
                </div>
                <h3 className="text-[15px] font-semibold uppercase tracking-wide text-foreground mb-3">
                  {f.title}
                </h3>
                <p className="text-[17px] text-foreground/80 leading-[1.75]">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VARK */}
      <section className="py-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div {...fadeUp} className="max-w-[720px]">
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-4">
              Four ways to learn. One tutor that adapts.
            </h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-12">
              Every student takes a quick VARK diagnostic when they first sign in. The Study Tutor then tailors every explanation to match the dominant learning style.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {varkStyles.map((v, i) => (
              <motion.div
                key={v.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white border p-8"
              >
                <v.icon strokeWidth={1.5} size={24} className="text-primary mb-4" />
                <h3 className="font-serif text-xl text-primary mb-2">{v.label}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[120px] bg-primary">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-3xl md:text-[40px] text-white mb-6 leading-[1.2]">
              Ready to study smarter?
            </h2>
            <p className="text-[17px] text-white/80 leading-[1.75] mb-10">
              Sign in with your student account to start chatting with your personal tutor.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white px-10 h-14 text-base rounded-none"
            >
              <a href="/app/student/login">
                Open Study Tutor <ArrowRight size={16} className="ml-2" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
