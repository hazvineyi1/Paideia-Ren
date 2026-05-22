import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Activity, Users, Globe, Monitor, BookMarked, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const steps = [
  {
    number: "01",
    title: "Recognize",
    subtitle: "Multi-modal assessment",
    description: "Every learner begins with a diagnostic that assesses learning style, cognitive strengths, and prior knowledge, without ever making them feel tested. VARK, Felder-Silverman, and cognitive-load baselines are established invisibly, through the way they engage.",
  },
  {
    number: "02",
    title: "Adapt",
    subtitle: "Dynamic content delivery",
    description: "Content reshapes itself in real time across visual, auditory, reading/writing, and kinesthetic modalities. A learner who processes better through structured diagrams sees one; a learner who needs a narrative frame gets one. The curriculum stays constant. The path changes.",
  },
  {
    number: "03",
    title: "Challenge",
    subtitle: "Zone of proximal development",
    description: "Difficulty is calibrated to the learner's current developmental ceiling, never so easy that engagement collapses, never so hard that cognitive overload sets in. The system monitors cognitive load signals and adjusts within sessions, not just between them.",
  },
  {
    number: "04",
    title: "Connect",
    subtitle: "Teacher, community, family",
    description: "The platform surfaces rich dashboards for teachers: which students are struggling, where the class is collectively stuck, what intervention the system recommends. Peer cohorts enable dialogical learning. Family reports close the loop at home.",
  },
];

const diagnosticQuestions = [
  {
    question: "When learning something new, you most prefer to:",
    options: ["See a diagram or chart", "Listen to an explanation", "Read a detailed text", "Try it yourself first"],
    adaptedFor: ["Visual", "Auditory", "Reading/Writing", "Kinesthetic"],
  },
  {
    question: "When you are stuck on a problem, you typically:",
    options: ["Draw it out or map it", "Talk it through with someone", "Re-read instructions carefully", "Try a different approach"],
    adaptedFor: ["Visual", "Auditory", "Reading/Writing", "Kinesthetic"],
  },
];

const features = [
  { icon: Activity, title: "Adaptive Content Engine", description: "Real-time modality-responsive content delivery across every subject and grade level." },
  { icon: Users, title: "Teacher Co-Pilot", description: "Rich classroom dashboards, intervention signals, and suggested next steps, in the teacher's language." },
  { icon: CheckCircle2, title: "Cohort & Community Layer", description: "Peer learning cohorts, dialogical discussion prompts, and collaborative problem-solving tools." },
  { icon: Globe, title: "Built for Real Schools", description: "Designed alongside teachers in the United States, United Kingdom, and Europe. Plain English at launch." },
  { icon: Monitor, title: "Modern Browser Support", description: "Runs on Chromebooks, iPads, and standard desktops used in classrooms and at home. No installation required." },
  { icon: BookMarked, title: "Curriculum Alignment", description: "Common Core, state standards, the UK National Curriculum, IB, and Cambridge International, with district and trust tooling." },
  { icon: ShieldCheck, title: "Open Data & Privacy by Design", description: "FERPA, COPPA, GDPR, and UK GDPR compliant. Child-data minimization. No student surveillance." },
];

export default function Platform() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  function handleAnswer(optionIndex: number) {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);
    if (step < diagnosticQuestions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  }

  function resetDemo() {
    setStep(0);
    setAnswers([]);
    setShowResult(false);
  }

  const dominantStyle = showResult
    ? diagnosticQuestions[0].adaptedFor[answers[0]] || "Visual"
    : null;

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6 text-center">
        <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          The Platform
        </motion.p>
        <motion.h1 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8">
          How it works.
        </motion.h1>
        <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[17px] text-foreground/80 leading-[1.75]">
          Four moves. Every learner, every session.
        </motion.p>
      </section>

      {/* Four Steps */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {steps.map((s, i) => (
              <motion.div key={s.number} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}
                className="flex gap-8">
                <div className="flex-shrink-0">
                  <span className="font-serif text-[72px] text-primary/10 leading-none font-semibold">{s.number}</span>
                </div>
                <div className="pt-4">
                  <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{s.subtitle}</p>
                  <h2 className="font-serif text-3xl text-primary mb-4">{s.title}</h2>
                  <p className="text-[17px] text-foreground/80 leading-[1.75]">{s.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-[120px]">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.div {...fadeUp}>
            <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4 text-center">
              Interactive Demo
            </p>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-4 text-center leading-[1.2]">
              See the system adapt.
            </h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-12 text-center">
              Answer two brief questions and watch Paideia-Ren reconfigure itself around your learning style.
            </p>

            <div className="border border-border p-8 md:p-12">
              <AnimatePresence mode="wait">
                {!showResult ? (
                  <motion.div key={`q-${step}`}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}>
                    <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                      Question {step + 1} of {diagnosticQuestions.length}
                    </p>
                    <p className="font-serif text-xl md:text-2xl text-primary mb-8 leading-[1.4]">
                      {diagnosticQuestions[step].question}
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {diagnosticQuestions[step].options.map((opt, i) => (
                        <button key={i} data-testid={`demo-option-${i}`}
                          onClick={() => handleAnswer(i)}
                          className="text-left px-6 py-4 border border-border hover:border-primary hover:bg-secondary transition-all text-[16px] text-foreground">
                          {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="result"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}>
                    <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                      Adaptation complete
                    </p>
                    <p className="font-serif text-xl md:text-2xl text-primary mb-4 leading-[1.4]">
                      You have a <span className="text-accent">{dominantStyle}</span> learning profile.
                    </p>
                    <p className="text-[17px] text-foreground/80 leading-[1.75] mb-8">
                      {dominantStyle === "Visual" && "Content is now reorganized around diagrams, spatial layouts, and visual hierarchies. Textual explanations are shortened. Concept maps replace prose paragraphs."}
                      {dominantStyle === "Auditory" && "Explanations are now rephrased for spoken-word fluency. Discussion prompts appear. Rhythm and repetition structure the material."}
                      {dominantStyle === "Reading/Writing" && "Content is now delivered through structured reading passages and writing prompts. Bullet hierarchies replace diagrams. Definitions are foregrounded."}
                      {dominantStyle === "Kinesthetic" && "Content now leads with examples and hands-on challenges. Abstract concepts follow from concrete experience rather than preceding it."}
                    </p>
                    <div className="bg-secondary p-6 mb-8">
                      <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Your profile signals to the teacher</p>
                      <p className="text-[15px] text-foreground/80 leading-[1.6]">
                        Your classroom teacher sees a flag: this learner is {dominantStyle?.toLowerCase()}-dominant. The co-pilot suggests three in-class strategies. No other student's data is visible to you.
                      </p>
                    </div>
                    <button onClick={resetDemo} data-testid="demo-reset"
                      className="text-[15px] text-primary font-medium underline underline-offset-4 hover:text-terracotta transition-colors">
                      Try again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Assists Statement */}
      <section className="bg-primary py-[120px] text-center">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.h2 {...fadeUp}
            className="font-serif text-4xl md:text-[56px] text-white leading-[1.2] tracking-wide">
            "Our AI assists teachers. It does not replace them."
          </motion.h2>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-[40px] text-primary mb-16 text-center">
            Everything the platform does.
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}
                className="bg-white p-8 border border-border">
                <f.icon strokeWidth={1.5} size={28} className="text-primary mb-5" />
                <h3 className="text-[15px] font-semibold uppercase tracking-wide text-foreground mb-3">{f.title}</h3>
                <p className="text-[15px] text-foreground/70 leading-[1.6]">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
