import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const schema = z.object({
  schoolName: z.string().min(2, "School name is required"),
  country: z.string().min(2, "Country is required"),
  gradeLevels: z.string().min(1, "Please select grade levels"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Valid email required"),
});

type FormValues = z.infer<typeof schema>;

const tiers = [
  {
    name: "Pilot",
    description: "Free",
    features: ["One school, one term", "Full platform access", "Research participation required", "Dedicated onboarding support", "Outcome reporting included"],
    cta: "Apply for a pilot",
  },
  {
    name: "District / Regional License",
    description: "Per-student SaaS",
    features: ["Unlimited schools within district", "Priority support", "Teacher professional learning", "Custom curriculum alignment", "District-level analytics"],
    cta: "Contact us",
    featured: true,
  },
  {
    name: "National / Ministry Partnership",
    description: "Custom, multi-year",
    features: ["Ministry-level deployment", "Capacity-building program", "Multi-year technical support", "National curriculum integration", "Co-branded research outputs"],
    cta: "Schedule a call",
  },
];

const regions = [
  { country: "Kenya", region: "Sub-Saharan Africa", status: "Pilot underway", context: "Urban and peri-urban schools. Focus: mathematics and English literacy at upper primary level." },
  { country: "Colombia", region: "Latin America", status: "Partnership in design", context: "Secondary mathematics aligned to national curriculum framework." },
  { country: "India", region: "South Asia", status: "Pilot planned Q3 2026", context: "Rural low-bandwidth deployment. Offline-first configuration. Hindi and English dual-language." },
];

export default function ForSchools() {
  const { toast } = useToast();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { schoolName: "", country: "", gradeLevels: "", contactName: "", contactEmail: "" } });

  function onSubmit(_: FormValues) {
    toast({ title: "Request received", description: "Our partnerships team will contact you within 2 business days." });
    form.reset();
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6 text-center">
        <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">For Schools & Ministries</motion.p>
        <motion.h1 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8">
          Built for national scale.
        </motion.h1>
        <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[17px] text-foreground/80 leading-[1.75]">
          Curriculum-aligned, teacher-augmenting, and designed for the realities of low-bandwidth classrooms from Nairobi to Bogotá to Rajasthan.
        </motion.p>
      </section>

      {/* Platform Credentials */}
      <section className="py-[80px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Interoperability", value: "LTI · OneRoster · SCORM · xAPI" },
              { label: "Languages", value: "English at launch · More planned" },
              { label: "Connectivity", value: "Offline-first, 2G capable" },
              { label: "Data Protection", value: "FERPA · GDPR · POPIA · Kenya DPA 2019" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">{item.label}</p>
                <p className="font-serif text-lg text-primary leading-[1.4]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Positioning */}
      <section className="py-[120px]">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-8 leading-[1.2]">What we offer schools.</h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-6">
              Paideia-Ren is designed to work inside your existing systems, not replace them. Our platform is curriculum-aligned to national syllabi, IB, Cambridge International, Common Core, and CAPS, with a ministry partnership tooling layer that enables co-branded deployment at national scale.
            </p>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-8">
              Every deployment is teacher-augmenting by design. The platform surfaces actionable intelligence for teachers, not generic reports. It flags which students need attention, where the class is collectively stuck, and what the research suggests as the most effective intervention for this cohort.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["Interoperable with your LMS (LTI, OneRoster, SCORM, xAPI)", "Offline-first, functional on 2G networks", "FERPA, GDPR, POPIA, Kenya DPA 2019 compliant", "WCAG 2.2 AA accessible", "Child-data minimization by default", "No student surveillance, ever"].map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <CheckCircle2 strokeWidth={1.5} size={18} className="text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-[15px] text-foreground/80">{f}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tier Matrix */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-[40px] text-primary mb-16 text-center">Partnership tiers.</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, i) => (
              <motion.div key={tier.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`p-10 border ${tier.featured ? "bg-primary border-primary text-white" : "bg-white border-border"}`}>
                <p className={`text-[13px] font-semibold uppercase tracking-widest mb-2 ${tier.featured ? "text-white/60" : "text-muted-foreground"}`}>{tier.description}</p>
                <h3 className={`font-serif text-2xl mb-8 ${tier.featured ? "text-white" : "text-primary"}`}>{tier.name}</h3>
                <ul className="space-y-3 mb-10">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 strokeWidth={1.5} size={16} className={`flex-shrink-0 mt-0.5 ${tier.featured ? "text-accent" : "text-primary"}`} />
                      <span className={`text-[15px] ${tier.featured ? "text-white/80" : "text-foreground/80"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 px-6 text-[15px] font-medium border transition-colors ${tier.featured ? "border-white text-white hover:bg-white hover:text-primary" : "border-primary text-primary hover:bg-primary hover:text-white"}`}>
                  {tier.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="py-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-[40px] text-primary mb-16">Current and planned pilots.</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {regions.map((c, i) => (
              <motion.div key={c.country} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                className="border border-border p-8">
                <p className="text-[13px] font-semibold uppercase tracking-widest text-accent mb-2">{c.status}</p>
                <h3 className="font-serif text-2xl text-primary mb-1">{c.country}</h3>
                <p className="text-[13px] text-muted-foreground mb-4">{c.region}</p>
                <p className="text-[15px] text-foreground/80 leading-[1.6]">{c.context}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilot Request Form */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-4 leading-[1.2]">Request a pilot.</h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-12">
              Tell us about your school or district. Our partnerships team will respond within two business days.
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="schoolName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">School or Institution Name</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. Nairobi Academy" className="rounded-none h-12" data-testid="input-school-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Country</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. Kenya" className="rounded-none h-12" data-testid="input-country" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gradeLevels" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Grade Levels</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-none h-12" data-testid="select-grade-levels">
                          <SelectValue placeholder="Select grade levels" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="primary">Primary (K–6)</SelectItem>
                        <SelectItem value="middle">Middle School (7–9)</SelectItem>
                        <SelectItem value="secondary">Secondary (10–12)</SelectItem>
                        <SelectItem value="tertiary">Tertiary / University</SelectItem>
                        <SelectItem value="mixed">Mixed / All Levels</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField control={form.control} name="contactName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Contact Name</FormLabel>
                      <FormControl><Input {...field} placeholder="Full name" className="rounded-none h-12" data-testid="input-contact-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="contactEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Contact Email</FormLabel>
                      <FormControl><Input {...field} type="email" placeholder="name@school.org" className="rounded-none h-12" data-testid="input-contact-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" size="lg" data-testid="button-submit-pilot"
                  className="bg-primary hover:bg-primary/90 text-white px-10 h-14 text-base rounded-none w-full">
                  Submit pilot request
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
