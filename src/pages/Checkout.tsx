import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Zap, CreditCard, Shield, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const currencySymbols: Record<string, string> = {
  USD: "$", INR: "₹", EUR: "€", GBP: "£", AED: "د.إ",
};

type CheckoutStep = "details" | "processing" | "success";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const plan = searchParams.get("plan") || "Basic";
  const tier = searchParams.get("tier") || "basic";
  const amount = parseInt(searchParams.get("amount") || "0", 10);
  const currency = searchParams.get("currency") || "USD";
  const billing = searchParams.get("billing") || "monthly";

  const [step, setStep] = useState<CheckoutStep>("details");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handlePayment = async () => {
    if (!cardNumber || !cardName || !expiry || !cvv) {
      toast.error("Please fill in all card details");
      return;
    }

    if (!userId) {
      toast.error("Please log in to complete your purchase");
      navigate("/login");
      return;
    }

    setLoading(true);
    setStep("processing");

    // Simulate Razorpay-style payment processing
    await new Promise((r) => setTimeout(r, 2500));

    const mockPaymentId = `mock_pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const { error } = await supabase.from("orders").insert({
      user_id: userId,
      plan_name: plan,
      plan_tier: tier,
      currency,
      amount,
      billing_cycle: billing,
      status: "completed",
      payment_provider: "mock", // swap to "razorpay" later
      payment_id: mockPaymentId,
    });

    if (error) {
      toast.error("Payment failed. Please try again.");
      setStep("details");
      setLoading(false);
      return;
    }

    setStep("success");
    setLoading(false);
  };

  const symbol = currencySymbols[currency] || "$";

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
        </div>
      </nav>

      <section className="pt-28 pb-20 px-6">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {step === "details" && (
              <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground" onClick={() => navigate("/pricing")}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pricing
                </Button>

                {/* Order summary */}
                <Card className="mb-6 border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{plan} Plan</span>
                      <span className="font-semibold text-foreground">{symbol}{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Billing</span>
                      <span className="text-foreground capitalize">{billing}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{symbol}{amount.toLocaleString()}/{billing === "monthly" ? "mo" : "yr"}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment form */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-accent" /> Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input id="cardName" placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry</Label>
                        <Input id="expiry" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <Shield className="w-3.5 h-3.5" />
                      <span>This is a mock payment. No real charges will be made.</span>
                    </div>

                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-2" onClick={handlePayment} disabled={loading}>
                      Pay {symbol}{amount.toLocaleString()}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
                <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-display font-bold text-foreground">Processing Payment...</h2>
                <p className="text-sm text-muted-foreground mt-2">Please wait while we confirm your payment.</p>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
                <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-display font-bold text-foreground">Payment Successful!</h2>
                <p className="text-muted-foreground mt-2 mb-8">
                  You're now on the <span className="font-semibold text-foreground">{plan}</span> plan. Welcome aboard!
                </p>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default Checkout;
