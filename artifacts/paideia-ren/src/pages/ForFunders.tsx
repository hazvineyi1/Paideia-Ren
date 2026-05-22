import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const tocSteps = [
  { label: "Inputs", items: ["Grant & philanthropy capital", "SaaS subscription revenue", "District & trust contracts", "Research partnerships"] },
  { label: "Activities", items: ["Adaptive platform development", "Teacher co-pilot deployment", "Curriculum alignment", "Research & evaluation"] },
  { label: "Outputs", items: ["Students served", "Teachers supported", "Schools & districts onboarded", "RCT evidence produced"] },
  { label: "Outcomes", items: ["Improved learning outcomes", "Teacher capacity built", "Equity gaps narrowed", "Education systems strengthened"] },
  { label: "Impact", items: ["SDG 4: Quality education for all", "SDG 4.7: Global citizenship & equity", "Cost-per-learning-gain reduced", "Scalable model demonstrated"] },
];

const fundingLevels = [
  {
    name: "Seed",
    amount: "$250,000 – $500,000",
    description: "Founding-partner pilots",
    outcomes: ["Full platform deployment with 2 founding partner schools or districts", "Rigorous pre/post evaluation", "Published research outputs", "Iterative product learning with pilot teachers"],
  },
  {
    name: "Growth",
    amount: "$1M – $5M",
    description: "50 schools across regions",
    outcomes: ["District-level and multi-academy-trust deployments", "RCT co-design with independent evaluator", "Teacher professional learning programs", "Open-source curriculum modules"],
    featured: true,
  },
  {
    name: "Scale",
    amount: "$5M+",
    description: "Network or state-wide partnership",
    outcomes: ["State, network, or trust-wide deployment", "Curriculum alignment across multiple state and national standards", "Educator capacity-building program", "Sustained 5-year research agenda"],
  },
];

const aspirationalFunders = [
  "Jacobs Foundation", "Mastercard Foundation", "Hilton Foundation",
  "Gates Foundation", "MacArthur Foundation", "World Bank SIEF",
  "Yidan Prize", "WISE Award", "Rockefeller Foundation", "Omidyar Network",
  "Open Society Foundations", "Hewlett Foundation",
];

export default function ForFunders() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6 text-center">
        <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">For Funders & Partners</motion.p>
        <motion.h1 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8">
          Catalytic capital.<br />Lasting equity.
        </motion.h1>
        <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[17px] text-foreground/80 leading-[1.75]">
          We are a nonprofit hybrid. Catalytic philanthropy unlocks the equity mission; earned revenue from licensed schools and corporate training partners makes us sustainable.
        </motion.p>
      </section>

      {/* Why Now */}
      <section className="bg-primary py-[120px]">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-white/60 mb-8 text-center">Why now</motion.p>
          <motion.blockquote {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }} className="border-l-2 border-accent pl-8">
            <p className="font-serif text-2xl md:text-3xl text-white italic leading-[1.5] mb-6">
              Reading and math scores in the United States, the United Kingdom, and across Europe have not recovered to pre-pandemic levels. The classrooms of every advanced economy are now living with a learning debt that conventional instruction was not designed to repay.
            </p>
            <cite className="text-[13px] text-white/60 not-italic">
              Paideia-Ren Inc., on the case for catalytic capital
            </cite>
          </motion.blockquote>
        </div>
      </section>

      {/* Theory of Change */}
      <section className="py-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div {...fadeUp} className="mb-16">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Theory of Change</p>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary leading-[1.2]">From inputs to impact.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-0">
            {tocSteps.map((step, i) => (
              <motion.div key={step.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`p-6 border border-border ${i < tocSteps.length - 1 ? "border-r-0" : ""} ${i === tocSteps.length - 1 ? "bg-secondary" : "bg-white"}`}>
                <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">{step.label}</p>
                <ul className="space-y-2">
                  {step.items.map((item) => (
                    <li key={item} className="text-[14px] text-foreground/80 leading-[1.5]">{item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-[13px] text-muted-foreground">Aligned to UN Sustainable Development Goal 4 and SDG Target 4.7</p>
          </div>
        </div>
      </section>

      {/* Funding Levels */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-[40px] text-primary mb-16 text-center">Investment levels.</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fundingLevels.map((level, i) => (
              <motion.div key={level.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`p-10 border ${level.featured ? "bg-primary border-primary" : "bg-white border-border"}`}>
                <p className={`text-[13px] font-semibold uppercase tracking-widest mb-2 ${level.featured ? "text-white/60" : "text-muted-foreground"}`}>{level.description}</p>
                <h3 className={`font-serif text-3xl mb-2 ${level.featured ? "text-white" : "text-primary"}`}>{level.name}</h3>
                <p className={`font-serif text-lg italic mb-8 ${level.featured ? "text-accent" : "text-muted-foreground"}`}>{level.amount}</p>
                <ul className="space-y-3">
                  {level.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${level.featured ? "bg-accent" : "bg-primary"}`} />
                      <span className={`text-[15px] leading-[1.6] ${level.featured ? "text-white/80" : "text-foreground/80"}`}>{o}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Aspirational Funders */}
      <section className="py-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Organizations We Admire</p>
            <p className="text-[15px] text-muted-foreground">Named aspirationally: not confirmed partners.</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-6">
            {aspirationalFunders.map((f, i) => (
              <motion.div key={f} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="border border-border px-5 py-3">
                <p className="text-[15px] text-foreground/70">{f}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[120px] bg-secondary text-center">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-[40px] text-primary mb-6">Schedule a conversation.</motion.h2>
          <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[17px] text-foreground/80 leading-[1.75] mb-10">
            We build relationships before we make asks. If you are moved by this mission, let us begin with a conversation.
          </motion.p>
          <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white px-10 h-14 text-base rounded-none">
              <Link href="/contact">
                Schedule a call <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
