import React from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Insights() {
  return (
    <div className="min-h-screen pt-[88px]">
      <section className="bg-background pt-24 pb-20 px-6 border-b border-border">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-5xl md:text-[64px] font-bold text-primary leading-[1.1] tracking-tight mb-6">
            Insights
          </h1>
          <p className="text-[22px] text-muted-foreground leading-relaxed max-w-3xl">
            Perspectives on healthcare operations, learning science, and technical implementation from our principals.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              category: "Healthcare & Operations",
              title: "Reducing provider-dispute resolution time: a process-redesign approach.",
              summary: "How redesigning escalation frameworks can save millions in high-dollar claim remediation and reduce dispute times by 40%.",
              author: "Bertha D. Musoni",
              date: "Mar 15, 2024"
            },
            {
              category: "Learning, EdTech & AI",
              title: "Designing accessible online courses that actually meet WCAG 2.1 AA.",
              summary: "Moving beyond automated checkers to build truly inclusive learning experiences that support all students.",
              author: "Belinda H. Musoni",
              date: "Apr 2, 2024"
            },
            {
              category: "Platforms & SaaS",
              title: "Where AI helps (and where it doesn't) in adaptive learning.",
              summary: "Navigating the hype: a pragmatic look at applying large language models to educational technology.",
              author: "Belinda H. Musoni",
              date: "Apr 20, 2024"
            }
          ].map((post, i) => (
            <div key={i} className="flex flex-col border border-border bg-background p-8 group">
              <span className="text-[13px] font-bold text-accent uppercase tracking-widest mb-4">{post.category}</span>
              <h3 className="text-2xl font-bold text-foreground mb-4 leading-[1.3] group-hover:text-primary transition-colors">{post.title}</h3>
              <p className="text-[16px] text-muted-foreground leading-relaxed flex-1 mb-8">{post.summary}</p>
              <div className="flex items-center justify-between border-t border-border pt-6 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-foreground">{post.author}</span>
                  <span className="text-[13px] text-muted-foreground">{post.date}</span>
                </div>
                <div className="w-8 h-8 rounded-[4px] bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
