import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, Building2, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  const navLinks = [
    { name: "Services", href: "#services" },
    { name: "Cities", href: "#cities" },
    { name: "Community", href: "#community" },
    { name: "About", href: "#about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-bold">
              <span className="text-primary">d4</span>
              <span className="text-secondary">desi</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/search">
              <Button variant="ghost" size="sm" className="gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </Link>
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.displayName || user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
            <Button size="sm" className="gap-2">
              <Building2 className="h-4 w-4" />
              List Business
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-foreground/80 hover:text-primary hover:bg-muted transition-colors rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-4 px-4">
                <Button variant="outline" className="w-full gap-2">
                  <User className="h-4 w-4" />
                  Login
                </Button>
                <Button className="w-full gap-2">
                  <Building2 className="h-4 w-4" />
                  List Your Business
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
