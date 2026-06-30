import { motion } from "framer-motion";
import { Link } from "wouter";
import { Linkedin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const placeholderTeam = [
  { name: "Name TBA", title: "Chief Executive Officer", bio: "Former ministry official with 20 years in global education policy." },
  { name: "Name TBA", title: "Chief Learning Officer", bio: "Learning scientist specializing in adaptive systems and cognitive-load theory." },
  { name: "Name TBA", title: "Chief Technology Officer", bio: "AI researcher with deep expertise in NLP and learning infrastructure at scale." },
  { name: "Name TBA", title: "Chief Research Officer", bio: "Educational psychologist and RCT specialist, formerly at J-PAL." },
  { name: "Name TBA", title: "VP, Partnerships & Policy", bio: "Education leader with district and government relationships across the United States and United Kingdom." },
  { name: "Name TBA", title: "VP, Product", bio: "Multilingual product leader who has shipped edtech at global scale." },
];

const advisors = [
  { name: "Advisor TBA", title: "University of Oxford, Education Policy", bio: "Expert in comparative education systems." },
  { name: "Advisor TBA", title: "Harvard Graduate School of Education", bio: "Pioneer in mastery learning and adaptive pedagogy." },
  { name: "Advisor TBA", title: "Stanford HAI, Human-Centered AI", bio: "Ethics of AI in educational contexts." },
  { name: "Advisor TBA", title: "UCL Institute of Education, London", bio: "Comparative education policy and teacher professional learning." },
];

function PersonCard({ name, title, bio }: { name: string; title: string; bio: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="flex flex-col items-start">
      <div className="w-16 h-16 rounded-full bg-secondary border border-border mb-4" />
      <p className="font-serif text-lg text-primary mb-1">{name}</p>
      <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">{title}</p>
      <p className="text-[15px] text-foreground/70 leading-[1.6] mb-3">{bio}</p>
      <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
        <Linkedin strokeWidth={1.5} size={18} />
      </a>
    </motion.div>
  );
}

export default function Team() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6 text-center">
        <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Leadership & Team
        </motion.p>
        <motion.h1 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8">
          Built by educators, for the world.
        </motion.h1>
      </section>

      {/* Approach & Foundations */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-3xl md:text-[40px] text-primary mb-8 leading-[1.2]">
              How we build
            </h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-6">
              Synops gives every learner, regardless of geography, language, or learning profile, access to the kind of personalized, adaptive instruction that the most privileged students receive as a matter of course.
            </p>
            <p className="text-[17px] text-foreground/80 leading-[1.75] mb-12">
              Our research agenda is anchored in the most rigorous learning science of our time. We use Bloom's taxonomy to map question types and scaffold mastery, cognitive-load theory to calibrate difficulty, retrieval and spacing research to schedule practice, and Vygotsky's zone of proximal development to hold every learner at the precise edge of their growth. We do not use learning-styles theories such as VARK; they are popular but not supported by evidence, and pretending otherwise would shortchange the learners we serve.
            </p>

            <h3 className="text-[13px] font-semibold uppercase tracking-widest text-foreground mb-6">
              Theoretical Foundations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              {["Bloom's Taxonomy", "Cognitive-Load Theory", "Retrieval Practice", "Spaced Repetition", "Vygotsky's ZPD", "Formative Assessment"].map((f) => (
                <div key={f} className="bg-white border border-border p-4">
                  <p className="text-[14px] font-medium text-foreground">{f}</p>
                </div>
              ))}
            </div>

            <blockquote className="border-l-gold mb-12">
              <p className="font-serif text-xl text-primary italic leading-[1.6] mb-2">
                "The possession which no one can take away from a person is paideia."
              </p>
              <cite className="text-[13px] text-muted-foreground not-italic">Menander</cite>
            </blockquote>

            <h2 className="font-serif text-3xl text-primary mb-6">
              Reimagining Education with a Global Technological Lens
            </h2>
            <p className="text-[17px] text-foreground/80 leading-[1.75]">
              Our product framework situates adaptive AI within a practical approach to high-quality, personalized learning. It guides our curriculum alignment strategy, our data ethics standards, our partnership model with schools and districts, and our product roadmap.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Leadership Grid */}
      <section className="py-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Leadership Team
          </motion.p>
          <motion.h2 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-3xl md:text-[40px] text-primary mb-16 leading-[1.2]">
            Joining as we grow publicly.
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
            {placeholderTeam.map((p) => (
              <PersonCard key={p.title} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* Advisors */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Advisors & Board
          </motion.p>
          <motion.h2 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-3xl md:text-[40px] text-primary mb-16 leading-[1.2]">
            World-class scholarly guidance.
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
            {advisors.map((a) => (
              <PersonCard key={a.title} {...a} />
            ))}
          </div>
        </div>
      </section>

      {/* Join Us */}
      <section className="py-[120px] text-center">
        <div className="max-w-[720px] mx-auto px-6">
          <motion.h2 {...fadeUp} className="font-serif text-3xl md:text-[40px] text-primary mb-6">
            Join us.
          </motion.h2>
          <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[17px] text-foreground/80 leading-[1.75] mb-10">
            We are building the team that will serve the world's learners. If you share the conviction that education is the formation of a relational human, we want to hear from you.
          </motion.p>
          <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 h-14 text-base rounded-none">
              <Link href="/contact">
                View open roles <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
