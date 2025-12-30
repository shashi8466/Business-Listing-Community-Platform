import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Check, X, Sparkles, Star, Zap, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useMembershipPlans } from "@/hooks/useMarketplace";
import { useAuth } from "@/contexts/AuthContext";

const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plans, loading } = useMembershipPlans();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleChoosePlan = (planSlug: string) => {
    if (!user) {
      navigate("/auth?redirect=/checkout?plan=" + planSlug);
      return;
    }
    navigate(`/checkout?plan=${planSlug}&cycle=${billingCycle}`);
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <Zap className="h-6 w-6" />;
      case 'premium': return <Star className="h-6 w-6" />;
      case 'featured': return <Sparkles className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'border-border';
      case 'premium': return 'border-primary';
      case 'featured': return 'border-accent ring-2 ring-accent/20';
      default: return 'border-border';
    }
  };

  const faqs = [
    {
      question: "Can I switch plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change will take effect at your next billing cycle."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept PayPal for all subscription payments. This includes PayPal balance, linked bank accounts, and credit/debit cards through PayPal."
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes, we offer a 14-day money-back guarantee. If you're not satisfied with your subscription, contact us within 14 days of purchase for a full refund."
    },
    {
      question: "How do lead credits work?",
      answer: "Each plan includes a monthly allocation of lead credits. When a potential customer submits an inquiry through your listing, one credit is used. Unused credits don't roll over to the next month."
    },
    {
      question: "What happens when my subscription ends?",
      answer: "Your listing will remain active but will be downgraded to the Free tier. You'll lose access to premium features, analytics, and additional lead credits."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. You can cancel your subscription at any time from your dashboard. You'll continue to have access to premium features until the end of your current billing period."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Pricing Plans - Choose Your Business Membership | d4desi</title>
        <meta
          name="description"
          content="Choose the perfect membership plan for your business. From free listings to featured placements, find the right plan to grow your business."
        />
        <link rel="canonical" href="https://d4desi.com/pricing" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-16 text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4">
                Simple, Transparent Pricing
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Choose Your Business Plan
              </h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
                Get more visibility, leads, and customers with our membership plans.
                Start free or upgrade for premium features.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4">
                <span className={billingCycle === 'monthly' ? 'font-semibold' : 'opacity-70'}>
                  Monthly
                </span>
                <Switch
                  checked={billingCycle === 'yearly'}
                  onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                />
                <span className={billingCycle === 'yearly' ? 'font-semibold' : 'opacity-70'}>
                  Yearly
                  <Badge variant="secondary" className="ml-2">Save 17%</Badge>
                </span>
              </div>
            </div>
          </section>

          {/* Plans */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              {loading ? (
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-8 animate-pulse">
                      <div className="h-8 bg-muted rounded w-1/2 mb-4" />
                      <div className="h-12 bg-muted rounded w-3/4 mb-6" />
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="h-4 bg-muted rounded" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative bg-card border-2 rounded-2xl p-8 transition-all hover:shadow-xl ${getPlanColor(plan.tier)}`}
                    >
                      {plan.tier === 'featured' && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-accent text-accent-foreground px-4 py-1">
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${plan.tier === 'featured' ? 'bg-accent/20 text-accent' : 'bg-primary/10 text-primary'}`}>
                          {getPlanIcon(plan.tier)}
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-foreground">
                            ${billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly}
                          </span>
                          <span className="text-muted-foreground">
                            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && plan.price_monthly > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Save ${(plan.price_monthly * 12 - plan.price_yearly).toFixed(2)} per year
                          </p>
                        )}
                      </div>

                      <p className="text-muted-foreground mb-6">{plan.description}</p>

                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full"
                        variant={plan.tier === 'featured' ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => handleChoosePlan(plan.slug)}
                      >
                        {plan.tier === 'free' ? 'Get Started Free' : 'Choose Plan'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Comparison Table */}
          <section className="py-16 bg-muted/50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                Compare Plans
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full max-w-4xl mx-auto">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-medium text-muted-foreground">Feature</th>
                      <th className="text-center py-4 px-4 font-medium text-foreground">Free</th>
                      <th className="text-center py-4 px-4 font-medium text-foreground">Premium</th>
                      <th className="text-center py-4 px-4 font-medium text-foreground">Featured</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4 text-foreground">Business Profile</td>
                      <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                      <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                      <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4 text-foreground">Monthly Lead Credits</td>
                      <td className="py-4 px-4 text-center text-muted-foreground">3</td>
                      <td className="py-4 px-4 text-center text-muted-foreground">25</td>
                      <td className="py-4 px-4 text-center text-muted-foreground">100</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4 text-foreground">Photo Gallery</td>
                      <td className="py-4 px-4 text-center text-muted-foreground">5 photos</td>
                      <td className="py-4 px-4 text-center text-muted-foreground">Unlimited</td>
                      <td className="py-4 px-4 text-center text-muted-foreground">Unlimited</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4 text-foreground">Analytics Dashboard</td>
                      <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                      <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                      <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4 text-foreground">Featured Badge</td>
                      <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                      <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                      <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4 text-foreground">Priority Placement</td>
                      <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                      <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                      <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-4 px-4 text-foreground">Priority Support</td>
                      <td className="py-4 px-4 text-center"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                      <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                      <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="flex items-center justify-center gap-3 mb-8">
                <HelpCircle className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">
                  Frequently Asked Questions
                </h2>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-foreground">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-gradient-hero text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Grow Your Business?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Join thousands of businesses already growing with d4desi.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link to={user ? "/list-business" : "/auth"}>
                    List Your Business Free
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/contact">
                    Contact Sales
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PricingPage;
