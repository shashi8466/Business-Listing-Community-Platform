import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  CreditCard, Download, Clock, CheckCircle, XCircle, 
  AlertCircle, ArrowUpCircle, FileText, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { usePayments, useUserBusinesses } from "@/hooks/useMarketplace";
import { useToast } from "@/hooks/use-toast";

const BusinessBillingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { businesses } = useUserBusinesses();
  const { payments, loading } = usePayments();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Mock subscription data
  const subscription = {
    plan: "Premium",
    status: "active",
    billingCycle: "monthly",
    nextBillingDate: "2024-02-15",
    amount: 29.99,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-primary"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'refunded':
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription will remain active until the end of the current billing period.",
    });
    setCancelDialogOpen(false);
  };

  // Instead of mock, we only rely on Supabase data
  const displayPayments = payments;

  return (
    <>
      <Helmet>
        <title>Billing & Invoices | BusinessHub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-8">
              <CreditCard className="h-8 w-8 text-primary" />
              Billing & Invoices
            </h1>

            {/* Current Subscription */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Manage your subscription and billing preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{subscription.plan} Plan</p>
                        <p className="text-sm text-muted-foreground">
                          ${subscription.amount}/{subscription.billingCycle === 'monthly' ? 'month' : 'year'}
                        </p>
                      </div>
                      <Badge className="bg-primary">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Next billing date: <strong>{new Date(subscription.nextBillingDate).toLocaleDateString()}</strong>
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" asChild>
                      <Link to="/pricing">
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Upgrade Plan
                      </Link>
                    </Button>
                    <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="text-destructive hover:text-destructive">
                          Cancel Subscription
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Subscription?</DialogTitle>
                          <DialogDescription>
                            Your subscription will remain active until {new Date(subscription.nextBillingDate).toLocaleDateString()}. 
                            After that, your listing will be downgraded to the Free plan.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                            Keep Subscription
                          </Button>
                          <Button variant="destructive" onClick={handleCancelSubscription}>
                            Yes, Cancel
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>View and download your invoices</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center justify-between py-4 border-b border-border">
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-48" />
                          <div className="h-3 bg-muted rounded w-24" />
                        </div>
                        <div className="h-8 bg-muted rounded w-20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Invoice</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayPayments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {payment.description || `${payment.payment_type} payment`}
                          </TableCell>
                          <TableCell className="text-foreground">
                            ${Number(payment.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />
                              PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BusinessBillingPage;
