import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary-hero pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 text-white/90 text-sm font-bold tracking-wide uppercase mb-6 rounded-[4px]">
                Nationwide Advisory & Build
              </div>
              <h1 className="text-white text-5xl lg:text-[64px] font-bold leading-[1.1] tracking-tight mb-6">
                Synops Advisory Group
              </h1>
              <p className="text-[20px] lg:text-[24px] text-white/90 leading-relaxed mb-6 font-medium">
                Operations, learning, and technology consulting, from strategy to build.
              </p>
              <p className="text-[18px] text-white/80 leading-relaxed mb-10 max-w-2xl">
                A single firm uniting healthcare operations leadership and learning/EdTech + AI, bound by disciplined project management and quality assurance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/contact" 
                  className="bg-accent hover:bg-accent/90 text-white px-8 py-4 font-bold text-[16px] text-center transition-colors rounded-[6px]"
                >
                  Book a consultation
                </Link>
                <Link 
                  href="/healthcare" 
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 font-bold text-[16px] text-center transition-colors rounded-[6px]"
                >
                  See our services
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="bg-primary border-b border-primary/20 py-12 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/20">
          <div className="md:px-8 first:pl-0 flex flex-col pt-6 md:pt-0">
            <span className="text-[40px] font-bold text-white mb-2 tracking-tight">$1B+</span>
            <span className="text-[15px] text-white/80 font-medium leading-relaxed">Managed-care provider relationships oversight</span>
          </div>
          <div className="md:px-8 flex flex-col pt-6 md:pt-0">
            <span className="text-[40px] font-bold text-white mb-2 tracking-tight">40+</span>
            <span className="text-[15px] text-white/80 font-medium leading-relaxed">Courses & curricula developed</span>
          </div>
          <div className="md:px-8 flex flex-col pt-6 md:pt-0">
            <span className="text-[40px] font-bold text-white mb-2 tracking-tight">98%</span>
            <span className="text-[15px] text-white/80 font-medium leading-relaxed">On-time delivery across projects</span>
          </div>
        </div>
      </section>

      {/* Practices */}
      <section className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl lg:text-[48px] font-bold text-primary tracking-tight mb-6">
              Two practices, one standard of rigor
            </h2>
            <p className="text-[20px] text-muted-foreground leading-relaxed">
              Deep domain expertise in healthcare operations and educational technology, delivered with unyielding project management discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-border bg-background p-10 flex flex-col h-full rounded-none">
              <h3 className="text-2xl font-bold text-foreground mb-4">Healthcare & Operations</h3>
              <p className="text-[16px] text-muted-foreground mb-8">
                Driving efficiency, compliance, and quality in managed care and provider networks.
              </p>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-accent mt-0.5 shrink-0" size={20} />
                  <span className="text-[15px] text-foreground font-medium leading-relaxed">Provider Relations & Network Management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-accent mt-0.5 shrink-0" size={20} />
                  <span className="text-[15px] text-foreground font-medium leading-relaxed">Managed Care Program Support</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-accent mt-0.5 shrink-0" size={20} />
                  <span className="text-[15px] text-foreground font-medium leading-relaxed">Organizational Change & Workforce Transition</span>
                </li>
              </ul>
              <Link href="/healthcare" className="text-primary font-bold text-[16px] flex items-center gap-2 hover:text-accent transition-colors group">
                Explore Healthcare <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="border border-border bg-background p-10 flex flex-col h-full rounded-none">
              <h3 className="text-2xl font-bold text-foreground mb-4">Learning, EdTech & AI</h3>
              <p className="text-[16px] text-muted-foreground mb-8">
                Building rigorous instructional design, adaptive systems, and AI-integrated learning.
              </p>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-accent mt-0.5 shrink-0" size={20} />
                  <span className="text-[15px] text-foreground font-medium leading-relaxed">Instructional Design & Curriculum Development</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-accent mt-0.5 shrink-0" size={20} />
                  <span className="text-[15px] text-foreground font-medium leading-relaxed">AI in Education & Content Evaluation</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-accent mt-0.5 shrink-0" size={20} />
                  <span className="text-[15px] text-foreground font-medium leading-relaxed">Adaptive & Intelligent Tutoring Systems</span>
                </li>
              </ul>
              <Link href="/learning" className="text-primary font-bold text-[16px] flex items-center gap-2 hover:text-accent transition-colors group">
                Explore Learning <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="py-24 lg:py-32 px-6 bg-background border-t border-border">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl lg:text-[48px] font-bold text-primary tracking-tight mb-16">
            How we work
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Assess", copy: "We analyze current state constraints, define measurable outcomes, and identify risks before committing resources." },
              { num: "02", title: "Design", copy: "We structure the intervention, whether an organizational workflow, a curriculum, or a platform architecture." },
              { num: "03", title: "Build", copy: "We execute the plan directly. We are practitioners, not just advisors. We build the courses and manage the implementations." },
              { num: "04", title: "Sustain", copy: "We hand off robust documentation, conduct training, and ensure the organization can maintain the new standard." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-accent font-bold text-xl mb-4">{step.num}</span>
                <div className="h-px bg-border w-full mb-6 relative">
                  <div className="absolute top-0 left-0 h-full w-12 bg-primary"></div>
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-4">{step.title}</h4>
                <p className="text-[16px] text-muted-foreground leading-relaxed">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Teaser */}
      <section className="py-24 lg:py-32 px-6 bg-primary text-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl lg:text-[48px] font-bold tracking-tight mb-6">
              Beyond Advisory: We Build
            </h2>
            <p className="text-[20px] text-white/80 max-w-2xl leading-relaxed">
              We translate strategic requirements into working software. Explore our purpose-built platforms for educators and students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 p-10 flex flex-col rounded-none hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[6px] bg-accent flex items-center justify-center">
                  <span className="font-bold text-white text-lg">T</span>
                </div>
                <h3 className="text-2xl font-bold">Synops Teacher</h3>
              </div>
              <p className="text-[16px] text-white/70 mb-8 flex-1 leading-relaxed">
                An AI co-pilot for teachers. Generate rigorous lesson plans, worksheets, quizzes, and parent communications in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/app/signup" className="bg-white text-primary px-6 py-3 font-bold rounded-[6px] text-center hover:bg-white/90 transition-colors">
                  Start free trial
                </a>
                <a href="/app/" className="border border-white/30 text-white px-6 py-3 font-bold rounded-[6px] text-center hover:bg-white/10 transition-colors">
                  Explore app
                </a>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-10 flex flex-col rounded-none hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[6px] bg-primary-hero border border-white/20 flex items-center justify-center">
                  <span className="font-bold text-white text-lg">C</span>
                </div>
                <h3 className="text-2xl font-bold">Synops Coach</h3>
              </div>
              <p className="text-[16px] text-white/70 mb-8 flex-1 leading-relaxed">
                An AI study coach for learners. Adaptive study plans, practice sets, exam prep, and a guided Socratic tutor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/study/signup" className="bg-white text-primary px-6 py-3 font-bold rounded-[6px] text-center hover:bg-white/90 transition-colors">
                  Get started
                </a>
                <a href="/study/" className="border border-white/30 text-white px-6 py-3 font-bold rounded-[6px] text-center hover:bg-white/10 transition-colors">
                  Open app
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-32 px-6 bg-white border-b border-border">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl lg:text-[40px] font-bold text-primary tracking-tight mb-12 text-center">
            Common questions
          </h2>
          <div className="space-y-8">
            <div className="border border-border p-8 rounded-none">
              <h4 className="text-xl font-bold text-foreground mb-4">Do you only work with clients in Virginia?</h4>
              <p className="text-[16px] text-muted-foreground leading-relaxed">
                No. We serve clients nationwide across all U.S. time zones. While we have a physical presence in Virginia, our delivery model is fully remote.
              </p>
            </div>
            <div className="border border-border p-8 rounded-none">
              <h4 className="text-xl font-bold text-foreground mb-4">What is your typical engagement model?</h4>
              <p className="text-[16px] text-muted-foreground leading-relaxed">
                We offer both strategic advisory (assessments, audits, planning) and hands-on execution (building courses, managing operations transitions, developing platforms). We structure engagements as distinct projects with clear deliverables and timelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-4xl font-bold text-primary mb-8 tracking-tight">Ready to begin?</h2>
          <Link 
            href="/contact" 
            className="inline-block bg-accent hover:bg-accent/90 text-white px-10 py-5 font-bold text-[18px] transition-colors rounded-[6px]"
          >
            Book a consultation
          </Link>
          <div className="mt-12 text-[14px] text-muted-foreground font-semibold tracking-widest uppercase flex flex-wrap justify-center gap-x-6 gap-y-3">
            <span>MPH</span>
            <span>·</span>
            <span>MBA</span>
            <span>·</span>
            <span>PMP</span>
            <span>·</span>
            <span>DBA(c)</span>
            <span>·</span>
            <span>M.Ed</span>
            <span>·</span>
            <span>PhD(c) Machine Learning</span>
            <span>·</span>
            <span>Quality Matters</span>
          </div>
        </div>
      </section>
    </div>
  );
}
