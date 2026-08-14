import { forwardRef } from "react";
import { Building2, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Reach thousands of Desi customers actively looking for services",
  "Get verified reviews and build your reputation",
  "Receive direct leads and inquiries",
  "Free basic listing, premium options available",
];

const BusinessCTA = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section ref={ref} className="py-16 md:py-24 bg-muted/50" {...props}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Building2 className="h-4 w-4" />
              For Business Owners
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Grow Your Business with BusinessHub
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of Desi business owners who are already connecting with customers through our platform.
            </p>

            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2">
                <Building2 className="h-4 w-4" />
                List Your Business Free
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-6 rounded-xl border border-border">
              <TrendingUp className="h-10 w-10 text-primary mb-4" />
              <div className="text-3xl font-bold text-foreground mb-1">5M+</div>
              <p className="text-muted-foreground">Monthly Visitors</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <Users className="h-10 w-10 text-secondary mb-4" />
              <div className="text-3xl font-bold text-foreground mb-1">100K+</div>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border col-span-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground mb-1">10,000+</div>
                  <p className="text-muted-foreground">Businesses Trust Us</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

BusinessCTA.displayName = "BusinessCTA";

export default BusinessCTA;
