import { Helmet } from "react-helmet-async";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AdminInquiriesPage = () => {
  return (
    <>
      <Helmet>
        <title>Inquiries | Admin | d4desi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            Inquiries
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user inquiries and support tickets
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-16 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">The inquiries management module is currently under development.</p>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminInquiriesPage;
