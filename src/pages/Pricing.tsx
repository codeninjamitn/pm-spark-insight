import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Currency = "USD" | "INR" | "EUR" | "GBP" | "AED";
type BillingCycle = "monthly" | "yearly";

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
};

const prices: Record<Currency, { basic: number; pro: number }> = {
  USD: { basic: 29, pro: 99 },
  INR: { basic: 1999, pro: 6999 },
  EUR: { basic: 27, pro: 89 },
  GBP: { basic: 23, pro: 79 },
  AED: { basic: 109, pro: 369 },
};

const plans = [
  {
    name: "Basic",
    description: "For individual PMs exploring product intelligence",
    tier: "basic" as const,
    features: [
      "Up to 50 source uploads/month",
      "AI-powered insight extraction",
      "Basic dashboard & filters",
      "Export insights as Markdown",
      "Standard email support",
    ],
  },
  {
    name: "Pro",
    description: "For product teams ready to scale their insights",
    tier: "pro" as const,
    popular: true,
    features: [
      "Unlimited source uploads",
      "Advanced AI analysis & tagging",
      "Full dashboard with analytics",
      "Priority categorization engine",
      "Bulk export (CSV, PDF, Markdown)",
      "Priority email & chat support",
    ],
  },
  {
    name: "Enterprise",
    description: "For organizations requiring custom solutions",
    tier: "enterprise" as const,
    features: [
      "Everything in Pro",
      "Custom AI model tuning",
      "Dedicated account manager",
      "SSO & advanced security",
      "On-site training & workshops",
      "SLA guarantees",
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<Currency>("INR");
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  const getPrice = (tier: "basic" | "pro") => {
    const base = prices[currency][tier];
    return billing === "yearly" ? Math.round(base * 0.8) : base;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-accent-foreground" />
            </div>
            <span className="font-display text-sm font-bold tracking-tight text-foreground">PM Wizard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Pricing</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Login</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-6">
              PM Wizard Pricing
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              Choose the right plan for your needs
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Start with PM Wizard today and transform raw feedback into actionable product insights.
            </p>
          </motion.div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {/* Billing toggle */}
            <div className="inline-flex rounded-full border border-border bg-card p-1">
              {(["monthly", "yearly"] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBilling(cycle)}
                  className={cn(
                    "px-5 py-1.5 rounded-full text-sm font-medium transition-all capitalize",
                    billing === cycle
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cycle}
                  {cycle === "yearly" && <span className="ml-1 text-xs opacity-80">(-20%)</span>}
                </button>
              ))}
            </div>

            {/* Currency selector */}
            <div className="inline-flex rounded-full border border-border bg-card p-1">
              {(Object.keys(currencySymbols) as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    currency === c
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={cn(
                  "relative rounded-xl border p-6 flex flex-col",
                  plan.popular
                    ? "border-accent bg-card shadow-lg shadow-accent/5"
                    : "border-border bg-card"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-display font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.tier === "enterprise" ? (
                    <div>
                      <span className="text-3xl font-display font-bold text-foreground">Custom</span>
                      <span className="text-sm text-muted-foreground ml-1">Pricing</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-display font-bold text-foreground">
                        {currencySymbols[currency]}{getPrice(plan.tier).toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">/{billing === "monthly" ? "month" : "month, billed yearly"}</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.tier === "enterprise" ? (
                  <Button
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    onClick={() => window.location.href = "mailto:sales@pmwizard.com?subject=Enterprise%20Inquiry"}
                  >
                    Contact Sales
                  </Button>
                ) : (
                  <Button
                    className={cn(
                      "w-full",
                      plan.popular
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                    onClick={() => navigate(`/checkout?plan=${plan.name}&tier=${plan.tier}&amount=${getPrice(plan.tier)}&currency=${currency}&billing=${billing}`)}
                  >
                    Get {plan.name}
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-muted-foreground bg-background border-t border-border">
        Made with ❤️ from Bangalore, India by Amit Navare — for the world
      </footer>
    </div>
  );
};

export default Pricing;
