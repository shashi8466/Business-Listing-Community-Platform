import { Helmet } from "react-helmet-async";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AdminModerationPage = () => {
  return (
    <>
      <Helmet>
        <title>Content Moderation | Admin | d4desi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Content Moderation
          </h1>
          <p className="text-muted-foreground mt-1">
            Review reported content, users, and policy violations
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-16 text-center">
          <ShieldCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">The centralized moderation queue is currently under development.</p>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminModerationPage;
