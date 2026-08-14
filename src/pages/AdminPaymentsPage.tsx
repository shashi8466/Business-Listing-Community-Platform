import { Helmet } from "react-helmet-async";
import { CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AdminPaymentsPage = () => {
  return (
    <>
      <Helmet>
        <title>Payments & Revenue | Admin | BusinessHub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            Payments & Revenue
          </h1>
          <p className="text-muted-foreground mt-1">
            Track transactions, subscriptions, and payouts
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-16 text-center">
          <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">The payments module is currently under development.</p>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminPaymentsPage;
