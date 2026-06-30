import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SiX, SiInstagram } from "react-icons/si";
import { ChevronDown, ChevronUp, Linkedin } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const contactRoutes = [
  {
    id: "investor",
    title: "Partnerships & Investment",
    subtitle: "Partnerships and product inquiries",
    tag: "[investor]",
  },
  {
    id: "school",
    title: "School & District",
    subtitle: "Pilot requests, district licensing, and government partnerships",
    tag: "[school]",
  },
  {
    id: "educator",
    title: "Educator",
    subtitle: "Join the Educator Network or inquire about professional development",
    tag: "[educator]",
  },
  {
    id: "press",
    title: "Press & Speaking",
    subtitle: "Media inquiries, interview requests, and conference invitations",
    tag: "[press]",
  },
  {
    id: "volunteer",
    title: "Volunteer & Careers",
    subtitle: "Open roles, advisory board inquiries, and volunteering",
    tag: "[careers]",
  },
];

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  organization: z.string().optional(),
  message: z.string().min(10, "Please include a message"),
});
type FormValues = z.infer<typeof schema>;

function ContactForm({ routeTitle, routeTag }: { routeTitle: string; routeTag: string }) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", organization: "", message: "" },
  });

  function onSubmit(_: FormValues) {
    toast({
      title: "Message received",
      description: `Your message has been tagged ${routeTag} and routed to the right team. We respond within 2 business days.`,
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Full Name</FormLabel>
              <FormControl><Input {...field} placeholder="Your name" className="rounded-none h-11" data-testid={`input-${routeTag}-name`} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Email</FormLabel>
              <FormControl><Input {...field} type="email" placeholder="your@email.com" className="rounded-none h-11" data-testid={`input-${routeTag}-email`} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="organization" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Organization (optional)</FormLabel>
            <FormControl><Input {...field} placeholder="School, district, company, etc." className="rounded-none h-11" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[13px] font-semibold uppercase tracking-wide">Message</FormLabel>
            <FormControl><Textarea {...field} placeholder={`Tell us about your interest in Synops (${routeTitle.toLowerCase()})...`} className="rounded-none min-h-[120px] resize-none" data-testid={`textarea-${routeTag}-message`} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" size="lg" data-testid={`button-submit-${routeTag}`}
          className="bg-primary hover:bg-primary/90 text-white px-8 h-12 text-base rounded-none">
          Send message
        </Button>
      </form>
    </Form>
  );
}

export default function Contact() {
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6 text-center">
        <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">Contact</motion.p>
        <motion.h1 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8">
          Let us begin.
        </motion.h1>
        <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[17px] text-foreground/80 leading-[1.75]">
          Select the path that best describes you. Every message goes directly to the right person. We respond within 2 business days.
        </motion.p>
      </section>

      {/* Contact Routes Accordion */}
      <section className="py-[80px]">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="space-y-0">
            {contactRoutes.map((route, i) => (
              <motion.div key={route.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="border-b border-border last:border-b-0">
                <button
                  data-testid={`contact-route-${route.id}`}
                  onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
                  className="w-full flex items-start justify-between py-8 text-left hover:bg-secondary/50 px-2 -mx-2 transition-colors group">
                  <div>
                    <h3 className="font-serif text-2xl text-primary mb-1 group-hover:text-primary/80 transition-colors">{route.title}</h3>
                    <p className="text-[15px] text-muted-foreground">{route.subtitle}</p>
                  </div>
                  <div className="flex-shrink-0 ml-4 mt-1">
                    {expandedRoute === route.id
                      ? <ChevronUp strokeWidth={1.5} size={20} className="text-primary" />
                      : <ChevronDown strokeWidth={1.5} size={20} className="text-muted-foreground" />}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedRoute === route.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden">
                      <div className="pb-8">
                        <ContactForm routeTitle={route.title} routeTag={route.tag} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Details */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div {...fadeUp}>
              <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Address</p>
              <p className="font-serif text-lg text-primary mb-1">Synops</p>
              <p className="text-[15px] text-foreground/70 leading-[1.75]">
                Headquarters TBA<br />
                Incorporated in the United States<br />
                Operations: New York · London · Berlin
              </p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}>
              <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Connect</p>
              <div className="flex flex-col gap-4">
                <a href="#" className="flex items-center gap-3 text-foreground/70 hover:text-primary transition-colors">
                  <Linkedin size={18} strokeWidth={1.5} className="text-primary" />
                  <span className="text-[15px]">LinkedIn</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-foreground/70 hover:text-primary transition-colors">
                  <SiX size={18} className="text-primary" />
                  <span className="text-[15px]">X / Twitter</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-foreground/70 hover:text-primary transition-colors">
                  <SiInstagram size={18} className="text-primary" />
                  <span className="text-[15px]">Instagram</span>
                </a>
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}>
              <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">Response Promise</p>
              <p className="font-serif text-2xl text-primary mb-3">2 business days.</p>
              <p className="text-[15px] text-foreground/70 leading-[1.75]">
                Every message is read and responded to personally. We do not use auto-responders for substantive inquiries. If your matter is urgent, note it in your message.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
