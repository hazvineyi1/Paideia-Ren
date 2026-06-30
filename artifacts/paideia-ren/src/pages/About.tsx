import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

export default function About() {
  return (
    <div className="min-h-screen pt-20">
      {/* Page Header */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6 text-center">
        <motion.p {...fadeUp} className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Our Philosophy
        </motion.p>
        <motion.h1 {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-[72px] text-primary leading-[1.1] tracking-wide mb-8">
          Three traditions. One promise.
        </motion.h1>
        <motion.p {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[17px] text-foreground/80 leading-[1.75]">
          Synops draws from the deepest wells of human educational thought: Greek, Confucian, and African, to build technology that forms whole persons within a shared humanity.
        </motion.p>
      </section>

      {/* Three Traditions */}
      <section className="py-[120px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              {
                label: "Greek",
                title: "Paideia",
                subtitle: "παιδεία",
                definition: "The lifelong cultivation of excellence in body, intellect, character, and civic life.",
                quote: "Paideia: the process of educating man into his true form, the real and genuine human nature.",
                attribution: "Werner Jaeger, Paideia: The Ideals of Greek Culture",
                body: "In Plato's Republic, education is described as 'the craft of turning the whole soul' toward the Good, not data-loading but an inner reorientation. The paideutic ideal holds that learning is inseparable from character formation. This is our first foundation.",
              },
              {
                label: "Confucian",
                title: "Ren",
                subtitle: "仁",
                subtitleStyle: "font-serif text-[56px] text-accent leading-none",
                definition: "Humaneness expressed in relationship. The character 仁 depicts two people side by side.",
                quote: "To love others: that is ren.",
                attribution: "Confucius, Analects XII.22",
                body: "Ren is the supreme Confucian virtue: benevolence, compassion, and human-heartedness realized in relationship. A person becomes fully human in right relation with others. Our AI is built never to replace this relational core, only to protect and extend it.",
              },
              {
                label: "African",
                title: "Ubuntu",
                subtitle: "umuntu ngumuntu ngabantu",
                definition: "A person is a person through other persons. I am because we are.",
                quote: "Umuntu ngumuntu ngabantu: a person is a person through other persons.",
                attribution: "African proverb",
                body: "Ubuntu is a communal philosophy of selfhood: my flourishing is bound to yours. In education, this means knowledge is held collectively, learning is dialogical, and we all learn better together.",
              },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.15 }}>
                <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">{item.label}</p>
                <h2 className="font-serif text-4xl text-primary mb-2">{item.title}</h2>
                {item.subtitleStyle ? (
                  <p className={item.subtitleStyle}>{item.subtitle}</p>
                ) : (
                  <p className="font-serif text-[15px] text-accent tracking-[0.2em] mb-6">{item.subtitle}</p>
                )}
                <p className="text-[15px] font-semibold text-foreground mb-6 leading-[1.6]">{item.definition}</p>
                <blockquote className="border-l-gold mb-6">
                  <p className="font-serif text-xl text-primary italic leading-[1.6] mb-2">"{item.quote}"</p>
                  <cite className="text-[13px] text-muted-foreground not-italic">{item.attribution}</cite>
                </blockquote>
                <p className="text-[17px] text-foreground/80 leading-[1.75]">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Synthesis */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6">
        <motion.div {...fadeUp}>
          <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground mb-6 text-center">
            The Synthesis
          </p>
          <h2 className="font-serif text-4xl md:text-[48px] text-primary leading-[1.2] mb-8 text-center">
            Why this matters
          </h2>
          <p className="text-[17px] text-foreground/80 leading-[1.75] mb-8">
            Three traditions, three continents, three millennia of thought, converging on a single educational anthropology: <strong>true learning forms the whole person, and a whole person is one whose intelligence is bound to humaneness and to community.</strong>
          </p>
          <p className="text-[17px] text-foreground/80 leading-[1.75] mb-12">
            This is the philosophical bedrock for an AI tutoring system grounded in adaptivity (paideia: each soul turned in the way it can turn), relational ethics (ren: technology in service of human relationship, never replacing it), and community (ubuntu: we learn better together).
          </p>

          <div className="space-y-8">
            <blockquote className="border-l-gold">
              <p className="font-serif text-xl text-primary italic leading-[1.6] mb-2">
                "Paideia: the process of educating man into his true form, the real and genuine human nature."
              </p>
              <cite className="text-[13px] text-muted-foreground not-italic">Werner Jaeger</cite>
            </blockquote>
            <blockquote className="border-l-gold">
              <p className="font-serif text-xl text-primary italic leading-[1.6] mb-2">
                "To love others: that is ren."
              </p>
              <cite className="text-[13px] text-muted-foreground not-italic">Confucius</cite>
            </blockquote>
            <blockquote className="border-l-gold">
              <p className="font-serif text-xl text-primary italic leading-[1.6] mb-2">
                "Umuntu ngumuntu ngabantu: a person is a person through other persons."
              </p>
              <cite className="text-[13px] text-muted-foreground not-italic">African proverb</cite>
            </blockquote>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
