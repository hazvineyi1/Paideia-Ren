import { motion } from "framer-motion";
import { ShieldCheck, FileText, Users, Database } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const ethicsCharter = [
  { title: "No surveillance of students or teachers", body: "Paideia-Ren will never use student data to build behavioral profiles for advertising, never share data with commercial third parties, and never monitor teacher performance for punitive purposes. The platform's data use is bounded exclusively to improving that student's learning." },
  { title: "Child-data minimization", body: "We collect only the data necessary to adapt instruction. We retain it only as long as necessary. We anonymize all research datasets before publication. We will never monetize student data." },
  { title: "Explainable adaptation", body: "Every adaptive decision the system makes can be explained in plain language to the teacher and, where age-appropriate, to the student. There are no black-box decisions that affect a child's learning path without a human being able to understand and override them." },
  { title: "Human-in-the-loop on all consequential decisions", body: "Paideia-Ren AI makes recommendations. Humans make decisions. No placement, assessment outcome, or intervention is implemented automatically. Every consequential decision in a student's educational path requires a human educator's informed judgment." },
  { title: "Open dataset commitments where ethical", body: "Where student privacy is fully protected, we commit to publishing anonymized research datasets, methodology documentation, and evaluation instruments, contributing to the global evidence base rather than hoarding it." },
];

const dataProtection = [
  { law: "FERPA", jurisdiction: "United States", description: "Family Educational Rights and Privacy Act, governing access to and privacy of student education records for US-based institutions." },
  { law: "GDPR", jurisdiction: "European Union", description: "General Data Protection Regulation, the global gold standard for data privacy, applied to all EU data subjects regardless of where data is processed." },
  { law: "POPIA", jurisdiction: "South Africa", description: "Protection of Personal Information Act, South Africa's comprehensive data protection law, aligned with GDPR principles." },
  { law: "Kenya DPA 2019", jurisdiction: "Kenya", description: "Kenya Data Protection Act 2019, establishing the Office of the Data Protection Commissioner and governing personal data processing." },
  { law: "COPPA", jurisdiction: "United States", description: "Children's Online Privacy Protection Act, applicable where Paideia-Ren serves children under 13 in the United States." },
];

export default function Transparency() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6 text-center">
        <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">Transparency & Governance</motion.p>
        <motion.h1 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8">
          Open by principle.
        </motion.h1>
        <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[17px] text-foreground/80 leading-[1.75]">
          Accountability is not a compliance requirement for us. It is a moral obligation to the students and teachers who trust us.
        </motion.p>
      </section>

      {/* Organizational Status */}
      <section className="py-[80px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: "501(c)(3) Status", value: "Application in progress", detail: "Form 1023 filing underway. IRS determination letter expected Q4 2026." },
              { icon: Users, title: "Board of Directors", value: "Forming", detail: "Board composition announcement expected at public launch. Commitment to gender parity and geographic diversity." },
              { icon: Database, title: "Financial Reporting", value: "Coming at launch", detail: "Annual Form 990 will be published here upon filing. Audited financials will follow in Year 2." },
            ].map((item) => (
              <motion.div key={item.title} {...fadeUp}
                className="bg-white p-8 border border-border">
                <item.icon strokeWidth={1.5} size={28} className="text-primary mb-5" />
                <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{item.title}</p>
                <p className="font-serif text-xl text-primary mb-3">{item.value}</p>
                <p className="text-[14px] text-foreground/70 leading-[1.6]">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Ethics Charter */}
      <section className="py-[120px]">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-4 mb-8">
              <ShieldCheck strokeWidth={1.5} size={32} className="text-primary" />
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">AI Ethics</p>
                <h2 className="font-serif text-3xl text-primary">Our Ethics Charter</h2>
              </div>
            </div>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-12">
              The following commitments govern every design decision, every data practice, and every partnership we enter. They are not aspirations. They are constraints.
            </p>
            <div className="space-y-10">
              {ethicsCharter.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="border-l-gold">
                  <h3 className="text-[15px] font-semibold uppercase tracking-wide text-foreground mb-3">{item.title}</h3>
                  <p className="text-[17px] text-foreground/80 leading-[1.75]">{item.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div {...fadeUp} className="mb-16">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Data Protection</p>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary leading-[1.2]">
              Compliant across jurisdictions.
            </h2>
          </motion.div>
          <div className="space-y-0">
            {dataProtection.map((item, i) => (
              <motion.div key={item.law} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="grid grid-cols-1 md:grid-cols-[120px_140px_1fr] gap-4 items-start py-6 border-b border-border last:border-b-0">
                <p className="font-serif text-xl text-primary">{item.law}</p>
                <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground pt-1">{item.jurisdiction}</p>
                <p className="text-[16px] text-foreground/80 leading-[1.75]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section className="py-[120px]">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.div {...fadeUp}>
            <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Accessibility</p>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-6 leading-[1.2]">WCAG 2.2 AA committed.</h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75]">
              Paideia-Ren is committed to WCAG 2.2 AA accessibility across all product surfaces, including semantic HTML, skip-links, focus-visible states, alt text on every image, captions on every video, and no color-only signaling. Accessibility is not an afterthought; it is a prerequisite for serving the learners we exist to serve.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
