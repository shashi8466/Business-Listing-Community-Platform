import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Check, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useMembershipPlans } from "@/hooks/useMarketplace";
import { useToast } from "@/hooks/use-toast";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { plans, loading: plansLoading } = useMembershipPlans();
  
  const planSlug = searchParams.get('plan') || 'premium';
  const cycleParam = searchParams.get('cycle') || 'monthly';
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(cycleParam as 'monthly' | 'yearly');
  const [autoRenew, setAutoRenew] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [processing, setProcessing] = useState(false);

  const selectedPlan = plans.find(p => p.slug === planSlug);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/checkout?plan=' + planSlug);
    }
  }, [user, navigate, planSlug]);

  const price = billingCycle === 'monthly' 
    ? selectedPlan?.price_monthly || 0 
    : selectedPlan?.price_yearly || 0;
  
  const discount = couponApplied ? price * 0.1 : 0;
  const total = price - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === 'save10') {
      setCouponApplied(true);
      toast({ title: "Coupon applied!", description: "10% discount has been applied." });
    } else {
      toast({ title: "Invalid coupon", description: "The coupon code is not valid.", variant: "destructive" });
    }
  };

  const handlePayWithPayPal = async () => {
    setProcessing(true);
    
    // For now, simulate PayPal redirect
    toast({ 
      title: "PayPal Integration", 
      description: "PayPal checkout will be integrated with your PayPal Client ID. Redirecting..." 
    });
    
    // In a real implementation, this would create a PayPal order and redirect
    setTimeout(() => {
      setProcessing(false);
      toast({ 
        title: "Demo Mode", 
        description: "This is a demo. In production, you'd be redirected to PayPal.",
        variant: "default"
      });
    }, 2000);
  };

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>Checkout - Complete Your Subscription | d4desi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Order Summary */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Your Subscription</CardTitle>
                    <CardDescription>
                      You're subscribing to the {selectedPlan?.name} plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Plan Details */}
                    {plansLoading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-muted rounded w-1/2" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </div>
                    ) : selectedPlan && (
                      <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            {selectedPlan.name} Plan
                            {selectedPlan.tier === 'featured' && (
                              <Badge>Most Popular</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedPlan.description}
                          </p>
                          <ul className="mt-3 space-y-1">
                            {selectedPlan.features.slice(0, 3).map((feature, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">
                            ${price}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            /{billingCycle === 'monthly' ? 'month' : 'year'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Billing Cycle */}
                    <div>
                      <Label className="text-base font-medium">Billing Cycle</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Button
                          variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                          onClick={() => setBillingCycle('monthly')}
                        >
                          Monthly
                        </Button>
                        <Button
                          variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                          onClick={() => setBillingCycle('yearly')}
                          className="gap-2"
                        >
                          Yearly
                          <Badge variant="secondary">Save 17%</Badge>
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Coupon Code */}
                    <div>
                      <Label htmlFor="coupon">Coupon Code</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="coupon"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          disabled={couponApplied}
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleApplyCoupon}
                          disabled={couponApplied || !couponCode}
                        >
                          {couponApplied ? 'Applied' : 'Apply'}
                        </Button>
                      </div>
                      {couponApplied && (
                        <p className="text-sm text-primary mt-2">10% discount applied!</p>
                      )}
                    </div>

                    <Separator />

                    {/* Auto-Renew */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Auto-Renew Subscription</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically renew at the end of each billing period
                        </p>
                      </div>
                      <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Summary */}
              <div>
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{selectedPlan?.name} Plan ({billingCycle})</span>
                        <span className="text-foreground">${price.toFixed(2)}</span>
                      </div>
                      {couponApplied && (
                        <div className="flex justify-between text-sm text-primary">
                          <span>Coupon Discount (10%)</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">${total.toFixed(2)}</span>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handlePayWithPayPal}
                      disabled={processing || !selectedPlan}
                    >
                      {processing ? 'Processing...' : 'Pay with PayPal'}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Secure payment powered by PayPal
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CheckoutPage;
