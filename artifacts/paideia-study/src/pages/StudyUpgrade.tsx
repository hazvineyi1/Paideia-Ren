import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useStudyBillingConfig,
  useStudySubscription,
  useStudyMobileCheckout,
  useStudyCardCheckout,
  useStudyPaymentStatus,
  useStudyCancelSubscription,
  type BillingCountry,
} from "@/hooks/use-study-api";
import {
  ArrowLeft,
  Check,
  Loader2,
  Smartphone,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

type Interval = "month" | "year";
const PENDING_KEY = "sc_pending_payment";

function formatMoney(currency: string, amount: number): string {
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function StudyUpgrade() {
  const [, setLoc] = useLocation();
  const { data: config, isLoading: configLoading } = useStudyBillingConfig();
  const { data: subscription, refetch: refetchSub } = useStudySubscription();
  const checkout = useStudyMobileCheckout();
  const cardCheckout = useStudyCardCheckout();
  const cancel = useStudyCancelSubscription();

  const [interval, setInterval] = useState<Interval>("month");
  const [countryCode, setCountryCode] = useState<BillingCountry["code"] | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Resume polling after a redirect back from a hosted checkout.
  useEffect(() => {
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) setActivePaymentId(pending);
  }, []);

  const country = useMemo(
    () => config?.countries.find((c) => c.code === countryCode) ?? null,
    [config, countryCode],
  );
  const methodInfo = useMemo(
    () => country?.methods.find((m) => m.id === method) ?? null,
    [country, method],
  );

  const { data: paymentStatus } = useStudyPaymentStatus(activePaymentId);

  useEffect(() => {
    if (!paymentStatus) return;
    if (paymentStatus.status === "paid") {
      localStorage.removeItem(PENDING_KEY);
      refetchSub();
      const t = window.setTimeout(() => setLoc("/coach"), 1800);
      return () => window.clearTimeout(t);
    }
    if (paymentStatus.status === "failed") {
      localStorage.removeItem(PENDING_KEY);
      setActivePaymentId(null);
      setError("That payment did not go through. Please try again.");
    }
    return undefined;
  }, [paymentStatus, refetchSub, setLoc]);

  const isPro = subscription?.tier === "pro";

  async function handleContinue() {
    setError(null);
    if (!country || !method) {
      setError("Choose your country and a payment method.");
      return;
    }
    if (methodInfo?.requiresPhone && !phone.trim()) {
      setError("Enter the mobile number for your wallet.");
      return;
    }

    // Card + auto-renew: try a Stripe subscription first. If no live card plan
    // is set up yet (409), quietly fall back to a one-time card charge below.
    if (methodInfo?.kind === "card" && autoRenew) {
      try {
        const { url } = await cardCheckout.mutateAsync({ interval });
        if (url) {
          window.location.href = url;
          return;
        }
      } catch {
        // fall through to one-time card payment
      }
    }

    try {
      const result = await checkout.mutateAsync({
        interval,
        country: country.code,
        method,
        mobileNumber: methodInfo?.requiresPhone ? phone.trim() : undefined,
        autoRenew: methodInfo?.kind === "card" ? autoRenew : false,
      });
      localStorage.setItem(PENDING_KEY, result.paymentId);
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      setInstructions(result.instructions);
      setActivePaymentId(result.paymentId);
    } catch (e) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "We could not start the payment. Please try again.";
      setError(message);
    }
  }

  // ── Waiting / success state ──
  if (activePaymentId && paymentStatus?.status !== "failed") {
    const paid = paymentStatus?.status === "paid";
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          {paid ? (
            <>
              <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-7 w-7 text-primary" />
              </div>
              <h1 className="font-serif text-3xl mb-2">You're on Pro</h1>
              <p className="text-muted-foreground">
                Payment confirmed. Taking you back to your coach...
              </p>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto mb-6 h-10 w-10 text-primary animate-spin" />
              <h1 className="font-serif text-3xl mb-3">Waiting for your payment</h1>
              <p className="text-muted-foreground mb-4">
                {instructions ?? paymentStatus?.instructions ?? "Approve the prompt on your phone to continue."}
              </p>
              <p className="text-xs text-muted-foreground">
                This page updates on its own once the payment clears.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (configLoading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/40">
        <button
          onClick={() => setLoc("/coach")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="font-serif text-lg tracking-tight">Synops</div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {isPro ? (
          <section className="text-center">
            <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-serif text-3xl mb-2">You're on Coach Pro</h1>
            <p className="text-muted-foreground mb-1">
              {subscription?.autoRenew ? "Renews" : "Access through"}{" "}
              {formatDate(subscription?.currentPeriodEnd ?? null)}
            </p>
            {subscription?.provider && (
              <p className="text-xs text-muted-foreground mb-8">
                Paid via {subscription.provider}
                {subscription.interval ? ` · ${subscription.interval}ly` : ""}
              </p>
            )}
            <Button
              variant="outline"
              onClick={async () => {
                await cancel.mutateAsync();
                refetchSub();
              }}
              disabled={cancel.isPending}
            >
              {cancel.isPending ? "Cancelling..." : "Cancel auto-renew"}
            </Button>
          </section>
        ) : (
          <>
            <section className="mb-10">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
                Upgrade
              </p>
              <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-3">
                Go further with Coach Pro
              </h1>
              <p className="text-muted-foreground">
                Pay with the wallet you already use. Mobile money and card,
                across Zimbabwe, Zambia, South Africa, and Botswana.
              </p>
            </section>

            {/* Features */}
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-10">
              {config.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* Interval */}
            <div className="mb-8">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Billing
              </Label>
              <div className="mt-2 inline-flex rounded-lg border border-border/60 p-1">
                {(["month", "year"] as Interval[]).map((iv) => (
                  <button
                    key={iv}
                    onClick={() => setInterval(iv)}
                    className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                      interval === iv
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {iv === "month" ? "Monthly" : "Yearly"}
                    {iv === "year" && (
                      <span className="ml-1.5 text-[10px] opacity-80">save more</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Country */}
            <div className="mb-8">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Your country
              </Label>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {config.countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCountryCode(c.code);
                      setMethod(null);
                    }}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      countryCode === c.code
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-border"
                    }`}
                  >
                    <div className="text-xl leading-none mb-1">{c.flag}</div>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatMoney(c.currency, c.price[interval])}/{interval === "month" ? "mo" : "yr"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Method */}
            {country && (
              <div className="mb-8">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Payment method
                </Label>
                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  {country.methods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                        method === m.id
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-border"
                      }`}
                    >
                      {m.kind === "card" ? (
                        <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <Smartphone className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
                {methodInfo?.note && (
                  <p className="text-xs text-muted-foreground mt-2">{methodInfo.note}</p>
                )}
              </div>
            )}

            {/* Phone for mobile money */}
            {methodInfo?.requiresPhone && (
              <div className="mb-8">
                <Label htmlFor="phone">Mobile money number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0771234567"
                  className="mt-1.5 max-w-xs"
                  inputMode="tel"
                />
              </div>
            )}

            {/* Auto-renew for card */}
            {methodInfo?.kind === "card" && (
              <label className="mb-8 flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Renew my card automatically each {interval}
              </label>
            )}

            {error && <p className="text-sm text-destructive mb-4">{error}</p>}

            <Button
              size="lg"
              className="w-full sm:w-auto gap-2"
              disabled={checkout.isPending || cardCheckout.isPending || !country || !method}
              onClick={handleContinue}
            >
              {(checkout.isPending || cardCheckout.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {country && method
                ? `Pay ${formatMoney(country.currency, country.price[interval])}`
                : "Continue to payment"}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Mobile money renews manually each {interval}; we'll remind you. Card
              payments can renew automatically.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
