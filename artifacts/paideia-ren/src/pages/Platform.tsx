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
    subtitle: "Cognitive diagnostic",
    description: "Every learner begins with a short adaptive diagnostic. Rather than asking how they prefer to learn - a self-report approach the research has discredited - the system infers a cognitive profile from how they actually answer: accuracy across Bloom levels (recall, comprehension, application), response timing, and how performance trends across a session. The profile is labeled with its own confidence so early signals are never treated as fixed traits.",
  },
  {
    number: "02",
    title: "Adapt",
    subtitle: "Sequencing and pacing",
    description: "Content reshapes itself in real time - not by switching sensory channel, but by adjusting what the learner sees next. A learner who is strong at recall but weak at application gets more worked examples before novel problems. A learner who fatigues mid-session gets shorter chunks. A fast, accurate learner skips ahead. The curriculum stays constant. The path changes.",
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

// Live cognitive items, not VARK self-report. Each item has a correct answer
// and is labeled with its Bloom level. The demo infers a profile from
// accuracy + response time across the two items.
type DemoItem = {
  bloom: "recall" | "comprehension" | "application";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const demoItems: DemoItem[] = [
  {
    bloom: "recall",
    prompt: "Photosynthesis converts light energy into which form of stored chemical energy?",
    options: ["Heat", "Glucose", "Oxygen", "Water"],
    correctIndex: 1,
    explanation: "Plants store light energy as glucose; oxygen and water are by-products, not the stored form.",
  },
  {
    bloom: "application",
    prompt: "A potted plant is moved to a dim closet for two weeks. Which outcome best fits what you know about photosynthesis?",
    options: [
      "Mass increases as it makes more glucose to survive",
      "Mass stays roughly constant; the plant simply pauses",
      "Mass decreases as the plant burns stored glucose without replacing it",
      "Mass increases briefly, then drops sharply on day 14",
    ],
    correctIndex: 2,
    explanation: "Without enough light, photosynthesis slows but respiration continues - the plant consumes stored glucose, so mass falls.",
  },
];

const features = [
  { icon: Activity, title: "Adaptive Content Engine", description: "Real-time modality-responsive content delivery across every subject and grade level." },
  { icon: Users, title: "Synops Teacher", description: "Rich classroom dashboards, intervention signals, and suggested next steps, in the teacher's language." },
  { icon: CheckCircle2, title: "Cohort & Community Layer", description: "Peer learning cohorts, dialogical discussion prompts, and collaborative problem-solving tools." },
  { icon: Globe, title: "Built for Real Schools", description: "Designed alongside teachers in the United States, United Kingdom, and Europe. Plain English at launch." },
  { icon: Monitor, title: "Modern Browser Support", description: "Runs on Chromebooks, iPads, and standard desktops used in classrooms and at home. No installation required." },
  { icon: BookMarked, title: "Curriculum Alignment", description: "Common Core, state standards, the UK National Curriculum, IB, and Cambridge International, with district and trust tooling." },
  { icon: ShieldCheck, title: "Open Data & Privacy by Design", description: "FERPA, COPPA, GDPR, and UK GDPR compliant. Child-data minimization. No student surveillance." },
];

type DemoResponse = { itemIndex: number; chosenIndex: number; correct: boolean; elapsedMs: number };

export default function Platform() {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<DemoResponse[]>([]);
  const [questionStart, setQuestionStart] = useState<number>(() => Date.now());
  const [showResult, setShowResult] = useState(false);

  function handleAnswer(optionIndex: number) {
    const item = demoItems[step];
    const elapsedMs = Date.now() - questionStart;
    const next = [...responses, { itemIndex: step, chosenIndex: optionIndex, correct: optionIndex === item.correctIndex, elapsedMs }];
    setResponses(next);
    if (step < demoItems.length - 1) {
      setStep(step + 1);
      setQuestionStart(Date.now());
    } else {
      setShowResult(true);
    }
  }

  function resetDemo() {
    setStep(0);
    setResponses([]);
    setQuestionStart(Date.now());
    setShowResult(false);
  }

  // Inference: same logic family as the real Study app, scaled down to 2 items.
  const recallResp = responses.find((r) => demoItems[r.itemIndex].bloom === "recall");
  const applicationResp = responses.find((r) => demoItems[r.itemIndex].bloom === "application");
  const avgMs = responses.length ? Math.round(responses.reduce((s, r) => s + r.elapsedMs, 0) / responses.length) : 0;

  const processingStyle: "sequential" | "conceptual" | "mixed" =
    applicationResp?.correct && !recallResp?.correct ? "conceptual"
    : recallResp?.correct && !applicationResp?.correct ? "sequential"
    : "mixed";

  const pace: "quick" | "deliberate" | "moderate" =
    avgMs < 8000 ? "quick" : avgMs > 25000 ? "deliberate" : "moderate";

  const correctCount = responses.filter((r) => r.correct).length;

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
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-3 text-center">
              Answer two short questions. The system infers a profile from <em>how</em> you answer - accuracy across question types and response timing - not from a self-report quiz.
            </p>
            <p className="text-[13px] text-muted-foreground mb-12 text-center">
              Two items is only an early signal. The full diagnostic uses many more.
            </p>

            <div className="border border-border p-8 md:p-12">
              <AnimatePresence mode="wait">
                {!showResult ? (
                  <motion.div key={`q-${step}`}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Question {step + 1} of {demoItems.length}
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                        {demoItems[step].bloom} item
                      </p>
                    </div>
                    <p className="font-serif text-xl md:text-2xl text-primary mb-8 leading-[1.4]">
                      {demoItems[step].prompt}
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {demoItems[step].options.map((opt, i) => (
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
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Inferred profile
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 border border-amber-300 px-2 py-0.5 rounded">
                        Early signal · 2 items
                      </p>
                    </div>
                    <p className="font-serif text-xl md:text-2xl text-primary mb-6 leading-[1.4]">
                      Processing style: <span className="text-accent capitalize">{processingStyle}</span> · Pace: <span className="text-accent capitalize">{pace}</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      <div className="p-4 bg-secondary">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Accuracy</p>
                        <p className="text-[15px] text-foreground">{correctCount} of {demoItems.length} correct {recallResp ? `(recall ${recallResp.correct ? "✓" : "✗"}, application ${applicationResp?.correct ? "✓" : "✗"})` : ""}</p>
                      </div>
                      <div className="p-4 bg-secondary">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Avg response time</p>
                        <p className="text-[15px] text-foreground">{(avgMs / 1000).toFixed(1)} seconds per item</p>
                      </div>
                    </div>

                    <p className="text-[17px] text-foreground/80 leading-[1.75] mb-6">
                      {processingStyle === "conceptual" && "You handled an application item more confidently than a recall item - a pattern that suggests you reason from principles. The full system would lead with worked examples and let definitions emerge from cases."}
                      {processingStyle === "sequential" && "You handled the recall item more confidently than the application item - a pattern that suggests you prefer to anchor facts before extending them. The full system would front-load definitions and scaffold up to application problems."}
                      {processingStyle === "mixed" && "Your two items moved together. The full system needs more evidence before specializing - it would run more diagnostic items first rather than commit to a sequencing strategy."}
                    </p>

                    <div className="bg-secondary p-6 mb-8 border-l-2 border-accent">
                      <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Honesty note</p>
                      <p className="text-[15px] text-foreground/80 leading-[1.6]">
                        This is a two-item demo. Real profiles use many more items, track how performance trends across a session, and carry a confidence score so the system never overcommits on thin evidence. We deliberately do not use VARK-style sensory preferences - that model has not held up in peer-reviewed research.
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
