import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/AdminLayout";
import { PlatformSettingsProvider } from "@/contexts/PlatformSettingsContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import SearchPage from "./pages/SearchPage";
import BusinessDetailPage from "./pages/BusinessDetailPage";
import DashboardPage from "./pages/DashboardPage";
import ListBusinessPage from "./pages/ListBusinessPage";
import CategoryPage from "./pages/CategoryPage";
import CityPage from "./pages/CityPage";
import CitiesPage from "./pages/CitiesPage";
import CityLandingPage from "./pages/CityLandingPage";
import CitySearchPage from "./pages/CitySearchPage";
import FeaturedPage from "./pages/FeaturedPage";
import TrendingPage from "./pages/TrendingPage";
import SponsoredPage from "./pages/SponsoredPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import AdminPage from "./pages/AdminPage";
import EditBusinessPage from "./pages/EditBusinessPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import CommunityPage from "./pages/CommunityPage";
import CreateCommunityPage from "./pages/CreateCommunityPage";
import CommunitiesCitiesPage from "./pages/CommunitiesCitiesPage";
import CommunitiesInterestsPage from "./pages/CommunitiesInterestsPage";
import CityCommunityPage from "./pages/CityCommunityPage";
import InterestCommunityPage from "./pages/InterestCommunityPage";
import PricingPage from "./pages/PricingPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminListingsPage from "./pages/AdminListingsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminInquiriesPage from "./pages/AdminInquiriesPage";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import AdminEventsPage from "./pages/AdminEventsPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminModerationPage from "./pages/AdminModerationPage";
import AdminPlansPage from "./pages/AdminPlansPage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import AdminLeadsPage from "./pages/AdminLeadsPage";
import AdminBillingPage from "./pages/AdminBillingPage";
import AdminMyBusinessesPage from "./pages/AdminMyBusinessesPage";
import TicketsPage from "./pages/TicketsPage";

import BusinessAnalyticsPage from "./pages/BusinessAnalyticsPage";
import BusinessBillingPage from "./pages/BusinessBillingPage";
import BusinessLeadsPage from "./pages/BusinessLeadsPage";
import CreateEventPage from "./pages/CreateEventPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import EventAttendeesPage from "./pages/EventAttendeesPage";
import DiscussionDetailPage from "./pages/DiscussionDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <AppErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <PlatformSettingsProvider>
          <AuthProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/business/:id" element={<BusinessDetailPage />} />
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user', 'business', 'admin']}><DashboardPage /></ProtectedRoute>} />
                <Route path="/list-business" element={<ProtectedRoute allowedRoles={['user', 'business', 'admin']}><ListBusinessPage /></ProtectedRoute>} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/cities" element={<CitiesPage />} />
                <Route path="/city/:cityName" element={<CityPage />} />
                <Route path="/:city/search" element={<CitySearchPage />} />
                <Route path="/featured" element={<FeaturedPage />} />
                <Route path="/trending" element={<TrendingPage />} />
                <Route path="/sponsored" element={<SponsoredPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'business', 'admin']}><ProfilePage /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute allowedRoles={['user', 'business', 'admin']}><FavoritesPage /></ProtectedRoute>} />
                <Route path="/tickets" element={<ProtectedRoute allowedRoles={['user', 'business', 'admin']}><TicketsPage /></ProtectedRoute>} />
                <Route path="/tickets/:id" element={<ProtectedRoute allowedRoles={['user', 'business', 'admin']}><TicketDetailsPage /></ProtectedRoute>} />
                
                {/* Admin Routes with Layout */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="listings" element={<AdminListingsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="inquiries" element={<AdminInquiriesPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="events" element={<AdminEventsPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  <Route path="moderation" element={<AdminModerationPage />} />
                  <Route path="plans" element={<AdminPlansPage />} />
                  <Route path="payments" element={<AdminPaymentsPage />} />
                  <Route path="leads" element={<AdminLeadsPage />} />
                  <Route path="billing" element={<AdminBillingPage />} />
                  <Route path="businesses" element={<AdminMyBusinessesPage />} />
                  <Route path="communities" element={<CommunitiesPage hideLayout />} />
                  {/* Keep existing placeholders if needed, linking back to some default */}
                  <Route path="reports" element={<AdminModerationPage />} />
                </Route>
                
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/business/analytics" element={<ProtectedRoute allowedRoles={['user', 'business', 'admin']}><BusinessAnalyticsPage /></ProtectedRoute>} />
                <Route path="/business/billing" element={<ProtectedRoute allowedRoles={['user', 'business', 'admin']}><BusinessBillingPage /></ProtectedRoute>} />
                <Route path="/business/leads" element={<ProtectedRoute allowedRoles={['user', 'business', 'admin']}><BusinessLeadsPage /></ProtectedRoute>} />
                <Route path="/business/:id/edit" element={<ProtectedRoute allowedRoles={['user', 'business', 'admin']}><EditBusinessPage /></ProtectedRoute>} />
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/communities/create" element={<CreateCommunityPage />} />
                <Route path="/communities/cities" element={<CommunitiesCitiesPage />} />
                <Route path="/communities/interests" element={<CommunitiesInterestsPage />} />
                <Route path="/communities/city/:citySlug" element={<CityCommunityPage />} />
                <Route path="/communities/interests/:interestId" element={<InterestCommunityPage />} />
                <Route path="/community/:slug" element={<CommunityPage />} />
                <Route path="/community/:slug/discussion/:discussionId" element={<DiscussionDetailPage />} />
                <Route path="/community/:slug/events/create" element={<CreateEventPage />} />
                <Route path="/community/event/:id" element={<EventDetailsPage />} />
                <Route path="/community/:slug/event/:eventId/attendees" element={<EventAttendeesPage />} />
                {/* City landing pages - must be after other specific routes */}
                <Route path="/:city" element={<CityLandingPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </PlatformSettingsProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </AppErrorBoundary>
);

export default App;
