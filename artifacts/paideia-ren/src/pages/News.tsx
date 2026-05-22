import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const categories = ["Research", "Field Notes", "Philosophy"] as const;
type Category = typeof categories[number];

const articles: Record<Category, { title: string; excerpt: string; status: string }[]> = {
  Research: [
    { title: "Adaptive tutoring and the 2-sigma gap: what the evidence actually says", excerpt: "A careful review of the RCT evidence on AI tutoring systems, what holds up, what is overstated, and what Paideia-Ren's research agenda will add to the field.", status: "Coming at launch" },
    { title: "Cognitive-load theory in low-bandwidth classrooms: a practitioner's guide", excerpt: "Translating Sweller's cognitive-load research into classroom practice in Sub-Saharan Africa, South Asia, and Latin America, and what it means for content design.", status: "Coming at launch" },
    { title: "Why 79% of edtech has no evidence, and what the 21% do differently", excerpt: "The Jacobs Foundation finding that most edtech lacks rigorous evidence is a design challenge, not a statistical curiosity. We map the path forward.", status: "Coming at launch" },
  ],
  "Field Notes": [
    { title: "What teachers in low-connectivity classrooms taught us about offline-first design", excerpt: "Classroom observation in rural settings revealed that offline-first is a values statement, not only a technical specification.", status: "Coming at launch" },
    { title: "When the platform encounters a learner who defies every modality assumption", excerpt: "Field notes from our first pilots on what happens when adaptive assumptions meet the full complexity of a real student.", status: "Coming at launch" },
    { title: "On what happens when a teacher is freed from the labor of differentiation", excerpt: "What becomes possible for a teacher when the system handles the adaptation layer and returns time for human attention.", status: "Coming at launch" },
  ],
  Philosophy: [
    { title: "Paideia in the age of artificial intelligence", excerpt: "What would Plato make of an AI tutor? A philosophical examination of whether adaptive technology can genuinely turn the soul, or only simulate doing so.", status: "Coming at launch" },
    { title: "Ren, relational AI, and the ethics of tutoring at scale", excerpt: "Confucius wrote that ren is realized in relationship. What does it mean to build AI that holds this as a design principle rather than a marketing claim?", status: "Coming at launch" },
    { title: "Ubuntu pedagogy: why 'I am because we are' is a curriculum design principle", excerpt: "On dialogical learning, communal knowledge, and why African educational philosophy offers a corrective to purely individualistic models of adaptive learning.", status: "Coming at launch" },
  ],
};

const signupSchema = z.object({
  email: z.string().email("Valid email required"),
  interests: z.array(z.string()).min(1, "Select at least one topic"),
});
type SignupValues = z.infer<typeof signupSchema>;

const interestOptions = [
  { id: "research", label: "Research & Evidence" },
  { id: "schools", label: "Schools & Partnerships" },
  { id: "funding", label: "Funding & Impact" },
];

export default function News() {
  const [activeCategory, setActiveCategory] = useState<Category>("Research");
  const { toast } = useToast();
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", interests: [] },
  });

  function onSubmit(_: SignupValues) {
    toast({ title: "Subscribed", description: "You will receive updates according to your selected interests." });
    form.reset();
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6 text-center">
        <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">News & Insights</motion.p>
        <motion.h1 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8">
          Thinking in public.
        </motion.h1>
        <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[17px] text-foreground/80 leading-[1.75]">
          Research, field notes, and philosophy: the three registers in which Paideia-Ren does its thinking.
        </motion.p>
      </section>

      {/* Category Tabs */}
      <section className="py-[80px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex gap-0 border-b border-border mb-16">
            {categories.map((cat) => (
              <button key={cat} data-testid={`tab-${cat.toLowerCase().replace(" ", "-")}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-4 text-[15px] font-semibold transition-colors border-b-2 -mb-[1px] ${
                  activeCategory === cat
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles[activeCategory].map((article, i) => (
              <motion.div key={article.title}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border border-border p-8 flex flex-col">
                <p className="text-[12px] font-semibold uppercase tracking-widest text-accent mb-4">{activeCategory}</p>
                <h3 className="font-serif text-xl text-primary mb-4 leading-[1.4] flex-1">{article.title}</h3>
                <p className="text-[15px] text-foreground/70 leading-[1.6] mb-6">{article.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-[12px] text-muted-foreground">{article.status}</p>
                  <button className="flex items-center gap-1 text-[13px] text-muted-foreground font-medium cursor-default">
                    Read <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-4 leading-[1.2]">Stay in the conversation.</h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-12">
              New thinking from the Paideia-Ren team, delivered to your inbox. Select the topics that matter most to you.
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Email Address</FormLabel>
                    <FormControl><Input {...field} type="email" placeholder="your@email.com" className="rounded-none h-12" data-testid="input-newsletter-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="interests" render={() => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Topics</FormLabel>
                    <div className="space-y-3 mt-2">
                      {interestOptions.map((option) => (
                        <FormField key={option.id} control={form.control} name="interests" render={({ field }) => (
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <Checkbox
                                data-testid={`newsletter-checkbox-${option.id}`}
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(checked ? [...current, option.id] : current.filter((v) => v !== option.id));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-[16px] cursor-pointer">{option.label}</FormLabel>
                          </FormItem>
                        )} />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" size="lg" data-testid="button-newsletter-subscribe"
                  className="bg-primary hover:bg-primary/90 text-white px-10 h-14 text-base rounded-none">
                  Subscribe
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
