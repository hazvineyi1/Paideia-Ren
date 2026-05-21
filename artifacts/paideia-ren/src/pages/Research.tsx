import { motion } from "framer-motion";
import { Link } from "wouter";
import { ExternalLink, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const studies = [
  {
    stat: "0.37 SD math · 0.23 SD Hindi",
    period: "in 4.5 months",
    title: "Mindspark Computer-Aided Learning, India",
    authors: "Muralidharan, Singh & Ganimian",
    citation: "NBER Working Paper w22923, 2019",
    doi: "https://doi.org/10.3386/w22923",
    summary: "A randomized evaluation of a software-based learning aid in Delhi found effects of 0.37 standard deviations in mathematics and 0.23 SD in Hindi after just 4.5 months of supplemental use. Effect sizes are comparable to intensive human tutoring at a fraction of the cost.",
  },
  {
    stat: "2–2.5× learning gains",
    period: "vs. control",
    title: "Korbit AI Tutor, Computer Science",
    authors: "Serban, Shubhendu, Bhatt et al.",
    citation: "arXiv:2203.03724",
    doi: "https://arxiv.org/abs/2203.03724",
    summary: "Learners using the Korbit AI tutoring system achieved 2–2.5× the learning gains of a control group. Course completion rates rose to 40.9% from 18.5% in the control condition — a result with significant equity implications for online learning.",
  },
  {
    stat: "+4pp overall · +9pp",
    period: "for lower-rated tutors",
    title: "Tutor CoPilot RCT, Title I Schools",
    authors: "Wang, Ribeiro, Robinson, Loeb & Demszky",
    citation: "arXiv:2410.03017, October 2024",
    doi: "https://arxiv.org/abs/2410.03017",
    summary: "A randomized controlled trial across 9 Title I schools with 1,787 eligible students and 900 tutors found that AI co-pilot support raised student outcomes by 4 percentage points overall — and 9 percentage points for students working with lower-rated tutors, the students with the greatest need.",
  },
  {
    stat: "2× as much learning",
    period: "in less time",
    title: "Harvard PS2 Pal AI Tutoring System",
    authors: "Kestin, Miller, McCarty, Callaghan & Deslauriers",
    citation: "Scientific Reports, 2025 (n≈194)",
    doi: "#",
    summary: "Students using the PS2 Pal AI tutor at Harvard learned 'more than twice as much in less time' compared to traditional instruction (n≈194, Harvard undergraduates). Note: a promising result from a single elite-institution sample — promising, not yet definitive at population scale.",
    caveat: true,
  },
  {
    stat: "2σ aspiration",
    period: "mastery learning at scale",
    title: "The 2-Sigma Problem",
    authors: "Benjamin Bloom",
    citation: "Educational Researcher, 1984",
    doi: "#",
    summary: "Bloom's landmark paper established that one-on-one tutoring produces learning outcomes 2 standard deviations above conventional instruction. This remains the aspiration that motivates all adaptive learning technology — a goal we treat as a frame, not a replicated effect size.",
    caveat: true,
  },
];

export default function Research() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6 text-center">
        <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Research & Impact
        </motion.p>
        <motion.h1 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8">
          Evidence, not assertion.
        </motion.h1>
        <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[17px] text-foreground/80 leading-[1.75]">
          The Jacobs Foundation found that only 21% of edtech products rely on rigorous evidence. We are committed to being in that 21%.
        </motion.p>
      </section>

      {/* Evidence Statement */}
      <section className="bg-primary py-[80px]">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <motion.p {...fadeUp}
            className="font-serif text-2xl md:text-3xl text-white leading-[1.5] italic">
            "We are committed to being in the 21% of edtech products that the Jacobs Foundation found rely on rigorous evidence."
          </motion.p>
        </div>
      </section>

      {/* Why Adaptive Tutoring Works */}
      <section className="py-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div {...fadeUp} className="mb-16">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Evidence Base
            </p>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary leading-[1.2]">
              Why adaptive tutoring works.
            </h2>
          </motion.div>

          <div className="space-y-12">
            {studies.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}
                className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 pb-12 border-b border-border last:border-b-0">
                <div>
                  <p className="font-serif text-3xl text-primary mb-1 leading-[1.1]">{s.stat}</p>
                  <p className="text-[13px] text-muted-foreground">{s.period}</p>
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold uppercase tracking-wide text-foreground mb-2">{s.title}</h3>
                  <p className="text-[14px] text-muted-foreground mb-4">{s.authors} — {s.citation}</p>
                  <p className="text-[16px] text-foreground/80 leading-[1.75] mb-4">{s.summary}</p>
                  {s.caveat && (
                    <p className="text-[13px] text-muted-foreground italic mb-4 border-l-2 border-border pl-3">
                      Methodological note: Treated here as a frame and aspiration, not a definitive population-level effect size.
                    </p>
                  )}
                  {s.doi !== "#" && (
                    <a href={s.doi} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[13px] text-primary hover:text-terracotta transition-colors">
                      <ExternalLink size={14} strokeWidth={1.5} /> View paper
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Agenda */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.div {...fadeUp}>
            <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Our Research Agenda
            </p>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-8 leading-[1.2]">
              What we will measure.
            </h2>
            <div className="space-y-6">
              {[
                "Effect sizes by region and demographic — disaggregated, not averaged away.",
                "Equity gap closure across income, gender, language, and disability status.",
                "Teacher time saved and professional confidence gained.",
                "Long-term knowledge retention at 3, 6, and 12 months.",
                "Cost-effectiveness per standard deviation of learning gain.",
                "Student wellbeing and intrinsic motivation over time.",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary text-white mt-0.5">
                    <span className="text-[11px] font-semibold">{i + 1}</span>
                  </div>
                  <p className="text-[17px] text-foreground/80 leading-[1.75]">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blueprint & Collaboration */}
      <section className="py-[120px]">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-6 leading-[1.2]">
              The Paideia-Ren Blueprint
            </h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-10">
              <em>"Reimagining Education with a Global Technological Lens"</em> — our strategic framework aligning adaptive AI with UNESCO's SDG 4 and SDG 4.7. Available for review and collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" variant="outline"
                className="border-primary text-primary hover:bg-primary/5 px-8 h-14 text-base rounded-none inline-flex items-center gap-3">
                <Download size={18} strokeWidth={1.5} /> Download Blueprint (PDF)
              </Button>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 h-14 text-base rounded-none">
                <Link href="/contact">
                  Collaborate with our research office <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
