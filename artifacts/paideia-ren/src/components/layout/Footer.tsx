import React from "react";
import { Link } from "wouter";
import { Linkedin } from "lucide-react";
import { SiX, SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { ShortFormDialog } from "@/components/ShortFormDialog";

export function Footer() {
  return (
    <footer className="bg-secondary pt-20 pb-12 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-1 mb-4 inline-flex">
              <span className="font-serif text-2xl font-semibold tracking-wide text-primary">
                Paideia-Ren
              </span>
              <span className="font-serif text-[13px] text-accent font-bold mb-3">仁</span>
            </Link>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[200px]">
              The formation of a relational human.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-widest text-primary mb-2">About</h3>
            <Link href="/about" className="text-sm text-foreground hover:text-terracotta transition-colors">Our Philosophy</Link>
            <Link href="/team" className="text-sm text-foreground hover:text-terracotta transition-colors">Leadership & Team</Link>
            <Link href="/transparency" className="text-sm text-foreground hover:text-terracotta transition-colors">Transparency & Governance</Link>
            <Link href="/where-we-work" className="text-sm text-foreground hover:text-terracotta transition-colors">Where We Work</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-widest text-primary mb-2">Platform & Research</h3>
            <Link href="/platform" className="text-sm text-foreground hover:text-terracotta transition-colors">How It Works</Link>
            <Link href="/research" className="text-sm text-foreground hover:text-terracotta transition-colors">Research & Impact</Link>
            <Link href="/news" className="text-sm text-foreground hover:text-terracotta transition-colors">News & Insights</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-widest text-primary mb-2">Connect</h3>
            <Link href="/for-schools" className="text-sm text-foreground hover:text-terracotta transition-colors">For Schools</Link>
            <Link href="/for-funders" className="text-sm text-foreground hover:text-terracotta transition-colors">For Funders</Link>
            <Link href="/for-educators" className="text-sm text-foreground hover:text-terracotta transition-colors">For Educators</Link>
            <Link href="/contact" className="text-sm text-foreground hover:text-terracotta transition-colors">Contact</Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border gap-6">
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={18} strokeWidth={1.5} /></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><SiX size={18} /></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><SiInstagram size={18} /></a>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6 text-[13px] text-muted-foreground">
            <Link href="/transparency" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/transparency" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/transparency" className="hover:text-foreground">Accessibility</Link>
            <span>© Paideia-Ren Inc.</span>
          </div>

          <ShortFormDialog
            testIdPrefix="donate-footer"
            trigger={
              <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-6 font-medium" data-testid="button-donate-footer">
                Donate
              </Button>
            }
            title="Support our mission"
            description="Tell us a little about you and our development team will follow up with giving options."
            orgLabel="Organization (optional)"
            orgPlaceholder="Foundation, family office, company"
            showAmount
            submitLabel="Send"
            toastTitle="Thank you"
            toastDescription="Our development team will be in touch within 2 business days."
          />
        </div>
      </div>
    </footer>
  );
}
