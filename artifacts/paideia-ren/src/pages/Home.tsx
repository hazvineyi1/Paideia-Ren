import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative w-full">
        <div className="w-full h-[600px] md:h-[700px] bg-primary relative overflow-hidden flex items-center justify-center">
          {/* Subtle texture overlay placeholder */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white text-5xl md:text-[84px] font-serif leading-[1.1] tracking-wide max-w-[900px] mx-auto"
            >
              The formation of a relational human.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-serif text-[13px] text-accent tracking-[0.3em] uppercase mt-8"
            >
              παιδεία · 仁 · ubuntu
            </motion.p>
          </div>
        </div>
      </section>

      {/* Sub-hero */}
      <section className="py-[120px] max-w-[720px] mx-auto px-6 text-center">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[22px] md:text-[28px] font-serif text-foreground leading-[1.5] mb-12"
        >
          Paideia-Ren is a nonprofit AI tutor that meets every learner where they are, and connects them to a teacher, a community, and a world.
        </motion.p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 h-14 text-base rounded-none">
            <Link href="/platform">See the platform</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5 px-8 h-14 text-base rounded-none">
            <Link href="/for-funders">Partner with us</Link>
          </Button>
        </div>
      </section>

      {/* Audience Cards */}
      <section className="py-[80px] bg-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white rounded-none border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-10 flex flex-col items-start h-full">
                <div className="p-3 bg-primary/5 rounded-full mb-6 text-primary">
                  <BookOpen strokeWidth={1.5} size={28} />
                </div>
                <h3 className="font-serif text-2xl text-primary mb-4">For Schools & Districts</h3>
                <p className="text-foreground/80 mb-8 flex-1">
                  Deploy a curriculum-aligned, teacher-augmenting platform built for independent schools, public districts, and education systems at scale.
                </p>
                <Link href="/for-schools" className="flex items-center gap-2 text-primary font-medium hover:text-terracotta transition-colors mt-auto">
                  Learn more <ArrowRight size={16} />
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-none border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-10 flex flex-col items-start h-full">
                <div className="p-3 bg-primary/5 rounded-full mb-6 text-primary">
                  <Users strokeWidth={1.5} size={28} />
                </div>
                <h3 className="font-serif text-2xl text-primary mb-4">For Funders & Partners</h3>
                <p className="text-foreground/80 mb-8 flex-1">
                  Join our coalition to bring world-class personalized learning to students across our partner schools in the United States, United Kingdom, and Europe.
                </p>
                <Link href="/for-funders" className="flex items-center gap-2 text-primary font-medium hover:text-terracotta transition-colors mt-auto">
                  Partner with us <ArrowRight size={16} />
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-none border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-10 flex flex-col items-start h-full">
                <div className="p-3 bg-primary/5 rounded-full mb-6 text-primary">
                  <GraduationCap strokeWidth={1.5} size={28} />
                </div>
                <h3 className="font-serif text-2xl text-primary mb-4">For Educators & Learners</h3>
                <p className="text-foreground/80 mb-8 flex-1">
                  Your Classroom Companion, designed to hold students in their zone of proximal development.
                </p>
                <Link href="/for-educators" className="flex items-center gap-2 text-primary font-medium hover:text-terracotta transition-colors mt-auto">
                  Join the network <ArrowRight size={16} />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-[64px] border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-center text-[13px] font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Aligned to Global Standards
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-60">
            <span className="font-serif text-2xl">UN SDG 4</span>
            <span className="font-serif text-2xl">UNESCO</span>
            <span className="font-serif text-2xl">FERPA · COPPA · GDPR · UK GDPR</span>
            <span className="font-serif text-2xl italic">IB · Cambridge · Common Core</span>
          </div>
        </div>
      </section>

      {/* Philosophy Tagline */}
      <section className="py-[120px]">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <p className="font-serif text-3xl md:text-[40px] italic text-primary leading-[1.4]">
            "I am because we are, and we learn because we are together."
          </p>
        </div>
      </section>
    </div>
  );
}
