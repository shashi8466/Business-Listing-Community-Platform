import { Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";
import { Settings, Globe, Mail, Shield, CreditCard, Bell, Search, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lazy load the tab components to improve initial page load performance
const GeneralSettingsTab = lazy(() => import("@/components/admin/settings/GeneralSettingsTab"));
const BrandingSettingsTab = lazy(() => import("@/components/admin/settings/BrandingSettingsTab"));
const SEOSettingsTab = lazy(() => import("@/components/admin/settings/SEOSettingsTab"));
const EmailSettingsTab = lazy(() => import("@/components/admin/settings/EmailSettingsTab"));
const PaymentSettingsTab = lazy(() => import("@/components/admin/settings/PaymentSettingsTab"));
const SecuritySettingsTab = lazy(() => import("@/components/admin/settings/SecuritySettingsTab"));
const NotificationSettingsTab = lazy(() => import("@/components/admin/settings/NotificationSettingsTab"));

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-48 border rounded-lg bg-card">
    <div className="animate-pulse text-muted-foreground">Loading settings...</div>
  </div>
);

const AdminSettingsPage = () => {
  return (
    <>
      <Helmet>
        <title>Platform Settings | Admin | BusinessHub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure global platform options and features
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 flex flex-wrap h-auto p-1">
          <TabsTrigger value="general" className="gap-2"><Globe className="h-4 w-4" /> General</TabsTrigger>
          <TabsTrigger value="branding" className="gap-2"><Palette className="h-4 w-4" /> Branding</TabsTrigger>
          <TabsTrigger value="seo" className="gap-2"><Search className="h-4 w-4" /> SEO</TabsTrigger>
          <TabsTrigger value="email" className="gap-2"><Mail className="h-4 w-4" /> Email</TabsTrigger>
          <TabsTrigger value="payments" className="gap-2"><CreditCard className="h-4 w-4" /> Payments</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <Suspense fallback={<LoadingFallback />}>
            <TabsContent value="general">
              <GeneralSettingsTab />
            </TabsContent>

            <TabsContent value="branding">
              <BrandingSettingsTab />
            </TabsContent>

            <TabsContent value="seo">
              <SEOSettingsTab />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentSettingsTab />
            </TabsContent>

            <TabsContent value="email">
              <EmailSettingsTab />
            </TabsContent>

            <TabsContent value="security">
              <SecuritySettingsTab />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationSettingsTab />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </>
  );
};

export default AdminSettingsPage;
