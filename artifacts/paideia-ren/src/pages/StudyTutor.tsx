import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Brain, Sparkles, Layers, Gauge, Target, TrendingUp, ArrowRight } from "lucide-react";

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
    description: "Flip a switch and the tutor stops explaining. Instead, it asks you questions that make you think deeper - definitions, examples, assumptions, and consequences.",
  },
  {
    icon: Sparkles,
    title: "Adapts to how you think",
    description: "A short diagnostic infers your cognitive profile from how you actually answer - accuracy across question types and response timing. No self-report quiz, no VARK. The tutor sequences explanations and pacing to fit.",
  },
];

const profileAxes = [
  { icon: Layers, label: "Processing style", desc: "Sequential learners get definitions first, then examples. Conceptual learners get worked examples, then the rule." },
  { icon: Gauge, label: "Pace", desc: "Quick learners skip ahead; deliberate learners get more time and shorter chunks before moving on." },
  { icon: Target, label: "Strength by question type", desc: "Strong at recall but weak at application? You get more practice problems. Reverse pattern? You get more foundational anchoring." },
  { icon: TrendingUp, label: "Confidence pattern", desc: "If accuracy drops late in a session, sessions get shorter. If it climbs, the tutor extends and stretches you." },
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
              The Paideia-Ren Study Tutor is a conversational AI that adapts to how you actually think. It paces explanations, scaffolds the next step, and refines its read of you as you study, rather than handing you finished answers.
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
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <div className="bg-primary/10 rounded-lg rounded-tr-none px-4 py-3 text-sm max-w-[85%]">
                  <p className="text-foreground leading-relaxed">
                    I keep getting quadratic equations wrong. Can you just give me the formula?
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary text-sm font-semibold">AI</span>
                </div>
                <div className="bg-muted rounded-lg rounded-tl-none px-4 py-3 text-sm max-w-[85%]">
                  <p className="text-foreground leading-relaxed">
                    I could, but your profile says you retain better when we build up first. Quick check: in x squared plus 5x plus 6, what two numbers multiply to 6 and add to 5? Start there and I'll meet you at the formula.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-white border text-muted-foreground">Pace: deliberate</span>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-white border text-muted-foreground">Style: sequential</span>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-white border text-muted-foreground">Gap: factoring</span>
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

      {/* Cognitive profile axes */}
      <section className="py-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div {...fadeUp} className="max-w-[760px]">
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-4">
              Four signals. One tutor that adapts.
            </h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-3">
              A short diagnostic reads four cognitive signals from <em>how</em> you answer, not from a self-report quiz. The Study Tutor uses them to sequence explanations, pick the next step, and pace the session. The profile carries its own confidence score and refines as you study.
            </p>
            <p className="text-[13px] text-muted-foreground mb-12">
              We deliberately don't use VARK (visual/auditory/reading/kinesthetic), because that model has not held up in peer-reviewed research.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {profileAxes.map((v, i) => (
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
                Student sign-in <ArrowRight size={16} className="ml-2" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
