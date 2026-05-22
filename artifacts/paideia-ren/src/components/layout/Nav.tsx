import React from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShortFormDialog } from "@/components/ShortFormDialog";

export function Nav() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileDonateOpen, setMobileDonateOpen] = React.useState(false);
  const [location] = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/platform", label: "Platform" },
    { href: "/research", label: "Research" },
    { href: "/for-schools", label: "For Schools" },
    { href: "/for-funders", label: "For Funders" },
    { href: "/for-educators", label: "For Educators" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
          isScrolled ? "bg-white border-b border-[#E0E0E0]" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 group">
            <span className="font-serif text-2xl font-semibold tracking-wide text-primary">
              Paideia-Ren
            </span>
            <span className="font-serif text-[13px] text-accent font-bold mb-3">仁</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[15px] font-medium transition-colors hover:text-terracotta ${
                  location === link.href ? "text-terracotta" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="/app/login"
              className="text-[15px] font-medium transition-colors hover:text-terracotta text-foreground"
              data-testid="link-teacher-signin"
            >
              Teacher sign-in
            </a>
            <ShortFormDialog
              testIdPrefix="donate-nav"
              trigger={
                <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-6 font-medium" data-testid="button-donate-nav">
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
          </nav>

          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu strokeWidth={1.5} size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-primary flex flex-col">
          <div className="flex items-center justify-between px-6 h-20">
            <Link href="/" className="flex items-center gap-1" onClick={() => setMobileMenuOpen(false)}>
              <span className="font-serif text-2xl font-semibold tracking-wide text-white">
                Paideia-Ren
              </span>
              <span className="font-serif text-[13px] text-accent font-bold mb-3">仁</span>
            </Link>
            <button
              className="text-white p-2"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Menu"
            >
              <X strokeWidth={1.5} size={24} />
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center gap-8 p-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-4xl text-white hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="/app/login"
              onClick={() => setMobileMenuOpen(false)}
              className="font-serif text-4xl text-white hover:text-accent transition-colors"
              data-testid="link-teacher-signin-mobile"
            >
              Teacher sign-in
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setMobileDonateOpen(true);
              }}
              className="font-serif text-4xl text-accent hover:text-white transition-colors"
              data-testid="button-donate-mobile"
            >
              Donate
            </button>
          </div>
        </div>
      )}

      <ShortFormDialog
        testIdPrefix="donate-mobile"
        open={mobileDonateOpen}
        onOpenChange={setMobileDonateOpen}
        title="Support our mission"
        description="Tell us a little about you and our development team will follow up with giving options."
        orgLabel="Organization (optional)"
        orgPlaceholder="Foundation, family office, company"
        showAmount
        submitLabel="Send"
        toastTitle="Thank you"
        toastDescription="Our development team will be in touch within 2 business days."
      />
    </>
  );
}
