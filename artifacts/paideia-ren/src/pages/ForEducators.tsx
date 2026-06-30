import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BarChart2, Clock, Heart, Lightbulb } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const educatorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  country: z.string().min(2),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
});

const learnerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  gradeLevel: z.string().min(1),
  country: z.string().min(2),
});

type EducatorValues = z.infer<typeof educatorSchema>;
type LearnerValues = z.infer<typeof learnerSchema>;

const workflows = [
  { icon: Clock, title: "Saves you time on differentiation", description: "The platform handles the adaptation layer, identifying which students need more support, which need a harder path, and which need a different modality. You make the pedagogical decisions. The system does the labor." },
  { icon: BarChart2, title: "Surfaces what you cannot see", description: "A class of 35 has 35 individual learning trajectories. Synops makes the hidden visible: who is in the productive struggle zone, who is cognitively overloaded, who has stopped trying. You see it. You act on it." },
  { icon: Lightbulb, title: "Respects your professional judgment", description: "Every recommendation the system makes is a suggestion, never an instruction. You override it. You contextualize it. The AI defers to you, always. Your professional expertise is the irreplaceable element in every classroom." },
  { icon: Heart, title: "Built with teachers, for teachers", description: "Every feature in Synops was designed in dialogue with practicing teachers across the United States, United Kingdom, and Europe. We ran user testing in classrooms before we ran it in conference rooms." },
];

const interestOptions = [
  { id: "research", label: "Research Panel" },
  { id: "webinars", label: "Monthly Webinars" },
  { id: "early-access", label: "Early Access to Features" },
];

export default function ForEducators() {
  const { toast } = useToast();

  const educatorForm = useForm<EducatorValues>({
    resolver: zodResolver(educatorSchema),
    defaultValues: { name: "", email: "", country: "", interests: [] },
  });

  const learnerForm = useForm<LearnerValues>({
    resolver: zodResolver(learnerSchema),
    defaultValues: { name: "", email: "", gradeLevel: "", country: "" },
  });

  function onEducatorSubmit(_: EducatorValues) {
    toast({ title: "Welcome to the Educator Network", description: "You will hear from us within one week with next steps." });
    educatorForm.reset();
  }

  function onLearnerSubmit(_: LearnerValues) {
    toast({ title: "Learner registration received", description: "We will be in touch as cohort spots open in your region." });
    learnerForm.reset();
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6 text-center">
        <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">For Educators & Learners</motion.p>
        <motion.h1 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8">
          Your companion, not your replacement.
        </motion.h1>
        <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[17px] text-foreground/80 leading-[1.75]">
          Synops exists because of educators. It works because of educators. And it will only ever answer to educators.
        </motion.p>
      </section>

      {/* Teacher Workflows */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-[40px] text-primary mb-16">What it does for teachers.</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {workflows.map((w, i) => (
              <motion.div key={w.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-white border border-border flex items-center justify-center">
                  <w.icon strokeWidth={1.5} size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold uppercase tracking-wide text-foreground mb-3">{w.title}</h3>
                  <p className="text-[17px] text-foreground/80 leading-[1.75]">{w.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Coming */}
      <section className="py-[120px]">
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">From the Classroom</p>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-6 leading-[1.2]">
              Educator voices coming at launch.
            </h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75]">
              We are currently in pilot with teachers across the United States, United Kingdom, and Europe. Their words will speak for themselves when the platform launches publicly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Educator Network Form */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-4 leading-[1.2]">Join the Educator Network.</h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-12">
              A free professional learning community: monthly webinars, early access to features, and a voice in our research agenda.
            </p>
            <Form {...educatorForm}>
              <form onSubmit={educatorForm.handleSubmit(onEducatorSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField control={educatorForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Full Name</FormLabel>
                      <FormControl><Input {...field} placeholder="Your name" className="rounded-none h-12" data-testid="input-educator-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={educatorForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Email</FormLabel>
                      <FormControl><Input {...field} type="email" placeholder="name@school.org" className="rounded-none h-12" data-testid="input-educator-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={educatorForm.control} name="country" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Country</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. United States" className="rounded-none h-12" data-testid="input-educator-country" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={educatorForm.control} name="interests" render={() => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">I am interested in</FormLabel>
                    <div className="space-y-3 mt-2">
                      {interestOptions.map((option) => (
                        <FormField key={option.id} control={educatorForm.control} name="interests" render={({ field }) => (
                          <FormItem className="flex items-center gap-3">
                            <FormControl>
                              <Checkbox
                                data-testid={`checkbox-${option.id}`}
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
                <Button type="submit" size="lg" data-testid="button-submit-educator"
                  className="bg-primary hover:bg-primary/90 text-white px-10 h-14 text-base rounded-none w-full">
                  Join the Educator Network
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </section>

      {/* Learner Signup */}
      <section className="py-[120px]">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-4 leading-[1.2]">For self-directed learners.</h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-12">
              Register your interest in joining a Synops learning cohort. We prioritize learners in underserved communities.
            </p>
            <Form {...learnerForm}>
              <form onSubmit={learnerForm.handleSubmit(onLearnerSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField control={learnerForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Full Name</FormLabel>
                      <FormControl><Input {...field} placeholder="Your name" className="rounded-none h-12" data-testid="input-learner-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={learnerForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Email</FormLabel>
                      <FormControl><Input {...field} type="email" placeholder="your@email.com" className="rounded-none h-12" data-testid="input-learner-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={learnerForm.control} name="gradeLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Grade / Level</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Grade 8 / University" className="rounded-none h-12" data-testid="input-learner-grade" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={learnerForm.control} name="country" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Country</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. United Kingdom" className="rounded-none h-12" data-testid="input-learner-country" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" size="lg" data-testid="button-submit-learner"
                  className="bg-primary hover:bg-primary/90 text-white px-10 h-14 text-base rounded-none w-full">
                  Register my interest
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
