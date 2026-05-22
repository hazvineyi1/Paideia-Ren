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

const foundingPartners = [
  { country: "United States", context: "Independent and public-district partnerships. Middle-school mathematics and high-school STEM, aligned to Common Core and state standards." },
  { country: "United Kingdom", context: "Multi-academy trust partnerships across England. Key Stage 3 and 4 mathematics and English, aligned to the National Curriculum and GCSE specifications." },
];

const inDesign = [
  "Germany", "Canada", "Ireland", "Netherlands",
];

export default function WhereWeWork() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-[120px] max-w-[820px] mx-auto px-6 text-center">
        <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">Where We Work</motion.p>
        <motion.h1 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8">
          Built for the world, starting where we can do it well.
        </motion.h1>
        <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[17px] text-foreground/80 leading-[1.75]">
          Paideia-Ren is designed alongside the teachers and students it serves. Our reach grows through partnership and evidence, not declaration. The places named below are where the work has already begun.
        </motion.p>
      </section>

      {/* Founding partners */}
      <section className="py-[80px]">
        <div className="max-w-[820px] mx-auto px-6">
          <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-10">
            Founding partner regions
          </motion.p>
          <div className="space-y-12">
            {foundingPartners.map((c, i) => (
              <motion.div key={c.country} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-10 pb-12 border-b border-border last:border-b-0">
                <div>
                  <h3 className="font-serif text-2xl text-primary mb-2">{c.country}</h3>
                  <p className="text-[12px] font-semibold uppercase tracking-widest text-accent">Partnership in design</p>
                </div>
                <p className="text-[16px] text-foreground/80 leading-[1.75]">{c.context}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* In design — quiet line */}
      <section className="pb-[120px]">
        <div className="max-w-[820px] mx-auto px-6">
          <motion.div {...fadeUp} className="border-l-2 border-gold pl-6">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Also in design
            </p>
            <p className="text-[17px] text-foreground/80 leading-[1.75]">
              Conversations with educators and partners are underway in {inDesign.slice(0, -1).join(", ")}, and {inDesign[inDesign.length - 1]}, alongside a small number of additional schools and networks we will name when the work is ready to be named.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[120px] bg-primary text-center">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-[48px] text-white leading-[1.2] mb-6">
            Bring Paideia-Ren to your school or district.
          </motion.h2>
          <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[17px] text-white/70 leading-[1.75] mb-10">
            We are actively seeking district leaders, multi-academy trusts, independent schools, and education foundations who share the conviction that every child deserves an excellent education.
          </motion.p>
          <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 px-10 h-14 text-base rounded-none">
              <Link href="/contact">
                Get in touch <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
