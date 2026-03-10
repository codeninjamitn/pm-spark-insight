import { Link } from "react-router-dom";
import { Zap, Brain, Upload, BarChart3, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  {
    icon: Upload,
    title: "Upload Any Source",
    description: "Drop in customer feedback, field reports, analyst transcripts, and market research — PM Wizard handles all formats.",
  },
  {
    icon: Brain,
    title: "AI-Powered Extraction",
    description: "Our AI reads through your documents and surfaces actionable insights, categorized and prioritized automatically.",
  },
  {
    icon: BarChart3,
    title: "Unified Dashboard",
    description: "See all your product intelligence in one place. Filter by category, priority, and validation status.",
  },
  {
    icon: Shield,
    title: "Validate & Act",
    description: "Review, validate, and export insights. Turn raw data into confident product decisions.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-accent-foreground" />
            </div>
            <span className="font-display text-sm font-bold tracking-tight text-foreground">
              PM Wizard
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Pricing
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-8">
              <Zap className="w-3 h-3 text-accent" />
              AI-Powered Product Intelligence
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground leading-tight">
              Turn Raw Feedback Into
              <br />
              <span className="text-accent">Product Decisions</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              PM Wizard uses AI to extract, categorize, and prioritize insights from your customer feedback, field reports, and market research — so you ship what matters.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-border text-foreground">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              How PM Wizard Works
            </h2>
            <p className="mt-3 text-muted-foreground">
              From raw data to actionable insights in minutes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4 p-6 rounded-xl bg-background border border-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Built for Product Leaders
          </h2>
          <p className="mt-3 text-muted-foreground mb-10">
            Everything you need to make data-driven product decisions.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { metric: "10x", label: "Faster Insight Extraction" },
              { metric: "5+", label: "Source Types Supported" },
              { metric: "100%", label: "AI-Powered Analysis" },
            ].map((stat) => (
              <div key={stat.label} className="p-6 rounded-xl border border-border bg-card">
                <div className="text-3xl font-display font-bold text-accent">{stat.metric}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground">
            Ready to unlock your product intelligence?
          </h2>
          <p className="mt-3 text-primary-foreground/70">
            Start extracting insights from your data today.
          </p>
          <Link to="/signup">
            <Button size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground bg-background border-t border-border">
        Made with ❤️ from Bangalore, India by Amit Navare — for the world
      </footer>
    </div>
  );
};

export default Landing;
