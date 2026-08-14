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
import { useAuth } from "@/contexts/AuthContext";
import { useAdminBusinesses, useAdminStats } from "@/hooks/useAdminBusinesses";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useAdminStats();
  const { pendingBusinesses, loading: pendingLoading } = useAdminBusinesses();

  if (statsLoading || pendingLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
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
    { title: "Manage Users", href: "/admin/users", icon: UserPlus, description: "Manage users and roles" },
    { title: "Manage Categories", href: "/admin/categories", icon: CreditCard, description: "Manage platform categories" },
    { title: "Platform Settings", href: "/admin/settings", icon: Settings, description: "Configure platform settings" },
    { title: "Analytics", href: "/admin/analytics", icon: BarChart3, description: "Platform growth and performance metrics" },
    { title: "Communities", href: "/communities", icon: Users, description: "Manage communities and events" },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | BusinessHub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

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
                        <p className="text-sm text-muted-foreground">{business.address?.city} • {business.category}</p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/business/${business.id}`}>Review</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
