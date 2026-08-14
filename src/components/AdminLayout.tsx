import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, Building2, Layers, MessageSquare, 
  Star, Calendar, BarChart3, ShieldAlert, Settings, User, LogOut, FileText, DollarSign, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const sidebarLinks = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Manage Listings", href: "/admin/listings", icon: Building2 },
  { name: "Manage Events", href: "/admin/events", icon: Calendar },
  { name: "My Businesses", href: "/admin/businesses", icon: Building2 },
  { name: "Tickets", href: "/admin/events", icon: Calendar },
  { name: "Lead Management", href: "/admin/leads", icon: FileText },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Billing & Invoices", href: "/admin/billing", icon: DollarSign },
  { name: "Payments & Revenue", href: "/admin/payments", icon: DollarSign },
  { name: "Membership Plans", href: "/admin/plans", icon: Settings },
  { name: "Communities", href: "/admin/communities", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, userProfile } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-bold">
            <span className="text-primary">d4</span>
            <span className="text-secondary">desi</span>
          </span>
        </Link>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Admin Console
        </div>
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.href) && 
              (link.href !== '/admin' || location.pathname === '/admin' || location.pathname === '/admin/');
              
            return (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {userProfile?.displayName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{userProfile?.displayName || 'Admin User'}</p>
            <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
          </div>
        </div>
        <div className="space-y-1">
          <Link
            to="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            <User className="h-4 w-4" />
            Admin Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 bg-card border-r border-border h-screen sticky top-0 overflow-y-auto shrink-0">
        <NavContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">
            <span className="text-primary">d4</span>
            <span className="text-secondary">desi</span>
          </span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-72 max-w-[80vw] bg-card h-full overflow-y-auto flex-col flex shadow-xl">
            <div className="absolute top-4 right-4 z-10">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden min-h-screen pt-16 lg:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
