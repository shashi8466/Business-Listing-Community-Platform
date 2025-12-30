import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  BarChart3, TrendingUp, Users, Eye, Mail, Phone, 
  Calendar, ArrowUpRight, ArrowDownRight, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserBusinesses } from "@/hooks/useMarketplace";

const BusinessAnalyticsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { businesses, loading } = useUserBusinesses();
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [dateRange, setDateRange] = useState('30');

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Mock analytics data - in production, this would come from the analytics_events table
  const analyticsData = {
    profileViews: 1247,
    profileViewsChange: 12.5,
    leadsReceived: 34,
    leadsChange: -5.2,
    conversionRate: 8.2,
    conversionChange: 2.1,
    avgTimeOnPage: "2:45",
    topSources: [
      { source: "Google Search", visits: 456, percentage: 36.5 },
      { source: "Direct", visits: 312, percentage: 25.0 },
      { source: "Category Page", visits: 234, percentage: 18.8 },
      { source: "City Page", visits: 156, percentage: 12.5 },
      { source: "Other", visits: 89, percentage: 7.2 },
    ],
    dailyViews: [
      { date: "Mon", views: 45 },
      { date: "Tue", views: 52 },
      { date: "Wed", views: 48 },
      { date: "Thu", views: 61 },
      { date: "Fri", views: 55 },
      { date: "Sat", views: 38 },
      { date: "Sun", views: 32 },
    ],
  };

  const statCards = [
    {
      title: "Profile Views",
      value: analyticsData.profileViews.toLocaleString(),
      change: analyticsData.profileViewsChange,
      icon: Eye,
    },
    {
      title: "Leads Received",
      value: analyticsData.leadsReceived,
      change: analyticsData.leadsChange,
      icon: Mail,
    },
    {
      title: "Conversion Rate",
      value: `${analyticsData.conversionRate}%`,
      change: analyticsData.conversionChange,
      icon: TrendingUp,
    },
    {
      title: "Avg. Time on Page",
      value: analyticsData.avgTimeOnPage,
      change: null,
      icon: Calendar,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Business Analytics | d4desi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  Business Analytics
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your business performance and leads
                </p>
              </div>
              <div className="flex items-center gap-4">
                {businesses.length > 0 && (
                  <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-8 w-8 bg-muted rounded" />
                        <div className="h-8 bg-muted rounded w-1/2" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : businesses.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">No businesses yet</h2>
                  <p className="text-muted-foreground mb-6">
                    List your business to start tracking analytics
                  </p>
                  <Button asChild>
                    <Link to="/list-business">List Your Business</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {statCards.map((stat) => (
                    <Card key={stat.title}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <stat.icon className="h-8 w-8 text-muted-foreground" />
                          {stat.change !== null && (
                            <div className={`flex items-center text-sm ${stat.change >= 0 ? 'text-primary' : 'text-destructive'}`}>
                              {stat.change >= 0 ? (
                                <ArrowUpRight className="h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4" />
                              )}
                              {Math.abs(stat.change)}%
                            </div>
                          )}
                        </div>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Charts Section */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  {/* Daily Views Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Profile Views</CardTitle>
                      <CardDescription>Views over the past week</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-end justify-between gap-2">
                        {analyticsData.dailyViews.map((day) => (
                          <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                            <div 
                              className="w-full bg-primary rounded-t"
                              style={{ height: `${(day.views / 70) * 100}%` }}
                            />
                            <span className="text-xs text-muted-foreground">{day.date}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Traffic Sources */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Traffic Sources</CardTitle>
                      <CardDescription>Where your visitors come from</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.topSources.map((source) => (
                          <div key={source.source}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-foreground">{source.source}</span>
                              <span className="text-muted-foreground">{source.visits} ({source.percentage}%)</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${source.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Upgrade CTA for non-premium users */}
                <Card className="bg-gradient-hero text-primary-foreground">
                  <CardContent className="py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Unlock Advanced Analytics</h3>
                        <p className="opacity-90">
                          Get detailed insights, conversion tracking, and ROI reports with Premium or Featured plans.
                        </p>
                      </div>
                      <Button variant="secondary" asChild>
                        <Link to="/pricing">Upgrade Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BusinessAnalyticsPage;
