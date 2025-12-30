import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  LayoutDashboard, Users, Building2, CreditCard, FileText, 
  ShieldCheck, BarChart3, Settings, AlertCircle, TrendingUp,
  DollarSign, Eye, UserPlus, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin, useAdminStats, useAdminBusinessesList } from "@/hooks/useMarketplace";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { stats, loading: statsLoading } = useAdminStats();
  const { businesses: pendingBusinesses, loading: pendingLoading } = useAdminBusinessesList('pending');

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShieldCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You don't have permission to access the admin dashboard.</p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Businesses",
      value: stats?.totalBusinesses || 0,
      icon: Building2,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Pending Listings",
      value: stats?.pendingListings || 0,
      icon: Clock,
      trend: "Needs review",
      trendUp: false,
      alert: (stats?.pendingListings || 0) > 0,
    },
    {
      title: "Active Subscriptions",
      value: stats?.activeSubscriptions || 0,
      icon: CreditCard,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: "+23%",
      trendUp: true,
    },
    {
      title: "Leads This Month",
      value: stats?.leadsThisMonth || 0,
      icon: UserPlus,
      trend: "+15%",
      trendUp: true,
    },
  ];

  const quickLinks = [
    { title: "Manage Listings", href: "/admin/listings", icon: Building2, description: "Approve, reject, or suspend business listings" },
    { title: "Membership Plans", href: "/admin/plans", icon: CreditCard, description: "Configure pricing and plan features" },
    { title: "Payments & Revenue", href: "/admin/payments", icon: DollarSign, description: "View transactions and manage payouts" },
    { title: "Lead Management", href: "/admin/leads", icon: UserPlus, description: "Monitor lead distribution and pricing" },
    { title: "Analytics", href: "/admin/analytics", icon: BarChart3, description: "Platform growth and performance metrics" },
    { title: "Moderation", href: "/admin/moderation", icon: ShieldCheck, description: "Review reported content and users" },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | d4desi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <LayoutDashboard className="h-8 w-8 text-primary" />
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your marketplace platform
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/admin/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {statCards.map((stat) => (
                <Card key={stat.title} className={stat.alert ? "border-destructive" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <stat.icon className={`h-8 w-8 ${stat.alert ? "text-destructive" : "text-muted-foreground"}`} />
                      {stat.alert && <AlertCircle className="h-5 w-5 text-destructive" />}
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                    </div>
                    <div className="mt-2">
                      <Badge variant={stat.trendUp ? "default" : "secondary"} className="text-xs">
                        {stat.trend}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Quick Links */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickLinks.map((link) => (
                    <Card key={link.title} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate(link.href)}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <link.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{link.title}</h3>
                            <p className="text-sm text-muted-foreground">{link.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Pending Approvals */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Pending Approvals</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/listings?status=pending">View All</Link>
                  </Button>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    {pendingLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : pendingBusinesses.length === 0 ? (
                      <div className="text-center py-6">
                        <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No pending approvals</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingBusinesses.slice(0, 5).map((business) => (
                          <div key={business.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="font-medium text-foreground">{business.name}</p>
                              <p className="text-sm text-muted-foreground">{business.city} • {business.category}</p>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/admin/listings/${business.id}`}>Review</Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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

export default AdminDashboardPage;
