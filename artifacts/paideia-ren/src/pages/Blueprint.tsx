import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const sections = [
  {
    number: "I",
    title: "Premise",
    body: "Every advanced economy is now living with a learning debt that conventional instruction was not designed to repay. Reading and mathematics scores in the United States, the United Kingdom, and across Europe have not recovered to pre-pandemic levels, and the children most affected are those whose schools have the least slack in the system. Paideia-Ren exists because the gap between what learning science knows and what most classrooms can deliver has become a moral, not a technical, problem.",
  },
  {
    number: "II",
    title: "Three Traditions, One Framework",
    body: "The platform is named for three educational traditions that converge on the same insight: a human being is formed in relationship, not in isolation. Paideia, the Greek conception of education as the cultivation of the whole person. Ren, the Confucian principle of benevolent relationality at the heart of learning. Ubuntu, the African philosophy that holds I am because we are. Adaptive technology built on this foundation does not replace the teacher, the cohort, or the community. It returns time to them.",
  },
  {
    number: "III",
    title: "Alignment with UNESCO SDG 4 and SDG 4.7",
    body: "The Blueprint situates adaptive AI within a rights-based, equity-first approach to universal quality education. SDG 4 commits the world to inclusive and equitable quality education and lifelong learning opportunities for all. SDG 4.7 commits us further: to education for sustainable development, human rights, gender equality, peace, global citizenship, and an appreciation of cultural diversity. Every product decision at Paideia-Ren is tested against both targets.",
  },
  {
    number: "IV",
    title: "Pedagogical Architecture",
    body: "The platform is organized around three pillars. Recognize: every learner begins with a brief evidence-based diagnostic that samples processing style, pace, and strength across recall, comprehension, and application items, alongside prior knowledge. We deliberately do not use VARK or other learning-styles labels, which are popular but not supported by evidence. Adapt: real-time pacing and scaffolding calibrated to the learner's zone of proximal development, with cognitive-load theory guiding difficulty. Connect: peer cohorts, dialogical discussion, and the Teaching Companion that keeps human relationship at the center of the experience.",
  },
  {
    number: "V",
    title: "Curriculum Alignment Strategy",
    body: "Paideia-Ren is built to work inside existing systems, not replace them. Content is aligned to Common Core, US state standards, the UK National Curriculum, the IB, and Cambridge International, with explicit mappings to GCSE, A-Level, and AP specifications. District, multi-academy trust, and state partners receive tooling for co-branded deployment, integration with the LMS layer they already run (LTI, OneRoster, SCORM, xAPI), and curriculum reporting that mirrors their own frameworks.",
  },
  {
    number: "VI",
    title: "Data Ethics Charter",
    body: "Child-data minimization is the default, not a setting. The platform collects only what is required to personalize learning, retains it only for as long as it serves the learner, and never sells, brokers, or repurposes student data for advertising or any commercial third party. Compliance with FERPA, COPPA, GDPR, UK GDPR, and PIPEDA is the floor, not the ceiling. There is no student surveillance, ever. Open, anonymized research datasets are published where doing so is ethical and strengthens the global evidence base.",
  },
  {
    number: "VII",
    title: "Partnership Model",
    body: "Paideia-Ren partners with school districts, multi-academy trusts, independent schools, state and provincial education authorities, and the foundations that fund them. Engagements move through three stages: a co-designed pilot with a founding cohort, a rigorous pre and post evaluation conducted with an independent evaluator, and a sustained multi-year deployment that builds local educator capacity and contributes back to the open evidence base.",
  },
  {
    number: "VIII",
    title: "Theory of Change",
    body: "Inputs: catalytic philanthropic capital, subscription revenue from districts and trusts, research partnerships. Activities: adaptive platform development, Teaching Companion deployment, curriculum alignment, independent evaluation. Outputs: students served, teachers supported, schools and districts onboarded, RCT-grade evidence produced. Outcomes: measurable learning gains, teacher capacity built, equity gaps narrowed, education systems strengthened. Impact: a scalable, evidence-led model that contributes directly to SDG 4 and SDG 4.7.",
  },
  {
    number: "IX",
    title: "Research Agenda",
    body: "Every deployment is also a study. Paideia-Ren commits to publishing what it learns, including the findings that complicate its own assumptions. The five-year research agenda is anchored in rigorous quasi-experimental and randomized designs, conducted in partnership with university research centers, and reported in plain English alongside the academic record. We are building evidence in public.",
  },
  {
    number: "X",
    title: "Invitation",
    body: "This Blueprint is a working document. It will be revised in dialogue with the educators, researchers, district leaders, and funders who choose to build alongside us. If the framework speaks to your institution's work, we would be honored to hear from you, and to share the full document and supporting appendices in confidence.",
  },
];

export default function Blueprint() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-[120px] max-w-[820px] mx-auto px-6">
        <motion.div {...fadeUp}>
          <Link href="/research" className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-terracotta mb-8">
            <ArrowLeft size={14} /> Back to Research
          </Link>
          <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">The Paideia-Ren Blueprint</p>
          <h1 className="font-serif text-5xl md:text-[64px] text-primary leading-[1.1] tracking-wide mb-8">
            Reimagining Education with a Global Technological Lens
          </h1>
          <p className="text-[19px] text-foreground/80 leading-[1.7] font-serif italic">
            A strategic framework aligning adaptive artificial intelligence with UNESCO's Sustainable Development Goal 4 and 4.7, situating learning technology within a rights-based, equity-first approach to universal quality education.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-2"><FileText size={14} strokeWidth={1.5} /> Working document</span>
            <span>Version 1.0, in review</span>
            <span>Paideia-Ren Inc.</span>
          </div>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="max-w-[820px] mx-auto px-6">
        <div className="border-t border-border" />
      </div>

      {/* Sections */}
      <section className="py-[80px]">
        <div className="max-w-[820px] mx-auto px-6 space-y-16">
          {sections.map((s) => (
            <motion.article key={s.number} {...fadeUp} className="grid grid-cols-[80px_1fr] gap-8 items-start">
              <p className="font-serif text-[44px] text-accent leading-none">{s.number}</p>
              <div>
                <h2 className="font-serif text-2xl md:text-3xl text-primary mb-5 leading-[1.25]">{s.title}</h2>
                <p className="text-[17px] text-foreground/80 leading-[1.8]">{s.body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Request the full PDF */}
      <section className="py-[120px] bg-primary">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-white/60 mb-6">
            Request the full PDF
          </motion.p>
          <motion.h2 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-3xl md:text-[44px] text-white leading-[1.2] mb-6">
            The complete Blueprint, with appendices.
          </motion.h2>
          <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.15 }}
            className="text-[17px] text-white/70 leading-[1.75] mb-10">
            The full document includes the data ethics charter, partnership playbook, theory of change at full resolution, and the five-year research agenda. We share it on request with district leaders, trust executives, education researchers, and funding partners.
          </motion.p>
          <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 px-8 h-14 text-base rounded-none">
              <Link href="/contact">
                <Mail size={18} strokeWidth={1.5} className="mr-2" /> Request the full PDF
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white px-8 h-14 text-base rounded-none">
              <Link href="/contact">
                Collaborate with our research office <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
