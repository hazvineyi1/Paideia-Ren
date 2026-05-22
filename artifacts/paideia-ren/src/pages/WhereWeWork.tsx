import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const countries = [
  { country: "United States", region: "North America", status: "Partnership in design", context: "Independent and public-district partnerships. Focus on middle-school mathematics and high-school STEM, aligned to Common Core and state standards.", color: "#1F2A5C" },
  { country: "United Kingdom", region: "Europe", status: "Partnership in design", context: "Multi-academy trust partnerships across England. Key Stage 3 and 4 mathematics and English, aligned to the National Curriculum and GCSE specifications.", color: "#1F2A5C" },
  { country: "Germany", region: "Europe", status: "Pilot planned", context: "Gymnasium and Gesamtschule partnerships. English-medium deployment with state-level curriculum alignment under design.", color: "#C9971C" },
  { country: "Canada", region: "North America", status: "Pilot planned", context: "English-medium deployment with provincial standards alignment under design. Initial focus on Ontario and British Columbia.", color: "#C9971C" },
  { country: "Ireland", region: "Europe", status: "Pilot planned", context: "Post-primary mathematics and science, aligned to the Junior Cycle and Leaving Certificate frameworks.", color: "#C9971C" },
  { country: "Netherlands", region: "Europe", status: "Pilot planned", context: "VWO and HAVO partnerships. English-medium deployment with curriculum alignment under design.", color: "#C9971C" },
];

export default function WhereWeWork() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6 text-center">
        <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">Where We Work</motion.p>
        <motion.h1 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8">
          Global reach. Local roots.
        </motion.h1>
        <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[17px] text-foreground/80 leading-[1.75]">
          Paideia-Ren is built alongside the teachers and students it serves. We design with context, not just for it.
        </motion.p>
      </section>

      {/* Map Visualization */}
      <section className="py-[80px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="border border-border bg-white overflow-hidden" style={{ aspectRatio: "16/7" }}>
            <div className="w-full h-full relative flex items-center justify-center bg-[#F8F8F8]">
              {/* Stylized world map placeholder */}
              <svg viewBox="0 0 800 400" className="w-full h-full opacity-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="40" y="80" width="160" height="200" rx="4" fill="#1F2A5C" />
                <rect x="220" y="60" width="200" height="220" rx="4" fill="#1F2A5C" />
                <rect x="440" y="80" width="140" height="180" rx="4" fill="#1F2A5C" />
                <rect x="600" y="90" width="160" height="160" rx="4" fill="#1F2A5C" />
                <rect x="80" y="290" width="120" height="80" rx="4" fill="#1F2A5C" />
                <rect x="460" y="280" width="100" height="100" rx="4" fill="#1F2A5C" />
              </svg>
              {/* Region labels */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-8 px-12 w-full">
                  {["United States", "United Kingdom", "European Union", "Canada"].map((region) => (
                    <div key={region} className="text-center">
                      <div className="w-3 h-3 bg-primary rounded-full mx-auto mb-2" />
                      <p className="text-[13px] font-semibold uppercase tracking-wide text-primary">{region}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="text-[13px] text-muted-foreground text-center mt-4">
            Interactive map with verified geolocation data coming at public launch.
          </p>
        </div>
      </section>

      {/* Country List */}
      <section className="py-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-[40px] text-primary mb-16">Country by country.</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {countries.map((c, i) => (
              <motion.div key={c.country} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="border border-border p-8 flex gap-5">
                <MapPin strokeWidth={1.5} size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-serif text-xl text-primary">{c.country}</h3>
                    <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 ${c.status === "Active pilot" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground mb-3">{c.region}</p>
                  <p className="text-[15px] text-foreground/80 leading-[1.6]">{c.context}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
