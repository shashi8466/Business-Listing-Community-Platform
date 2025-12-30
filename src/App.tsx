import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <AppErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
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
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/list-business" element={<ListBusinessPage />} />
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
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/business/:id/edit" element={<EditBusinessPage />} />
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/communities/create" element={<CreateCommunityPage />} />
                <Route path="/communities/cities" element={<CommunitiesCitiesPage />} />
                <Route path="/communities/interests" element={<CommunitiesInterestsPage />} />
                <Route path="/communities/city/:citySlug" element={<CityCommunityPage />} />
                <Route path="/communities/interests/:interestId" element={<InterestCommunityPage />} />
                <Route path="/community/:slug" element={<CommunityPage />} />
                {/* City landing pages - must be after other specific routes */}
                <Route path="/:city" element={<CityLandingPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </AppErrorBoundary>
);

export default App;
