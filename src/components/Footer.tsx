import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { CATEGORIES } from "@/types";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";

const Footer = forwardRef<HTMLElement>((props, ref) => {
  const { settings } = usePlatformSettings();
  
  const serviceLinks = CATEGORIES.slice(0, 6).map((cat) => ({
    name: cat.name,
    href: `/category/${cat.id}`,
  }));

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Featured", href: "/featured" },
    { name: "Trending", href: "/trending" },
    { name: "List Your Business", href: "/list-business" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "/contact" },
    { name: "Browse Cities", href: "/cities" },
    { name: "Search Services", href: "/search" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer ref={ref} className="bg-sidebar text-sidebar-foreground" {...props}>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img 
                src={settings?.branding?.logoUrl || "/logo.png"} 
                alt={`${settings?.branding?.applicationName || 'BusinessHub'} Logo`} 
                className="w-auto"
                style={{
                  height: settings?.branding?.logoSize ? `${settings.branding.logoSize}px` : '80px', // Default increased size
                  border: settings?.branding?.logoBorder ? '5px solid var(--border)' : 'none',
                  borderRadius: '5px'
                }}
              />
            </Link>
            <p className="text-sidebar-foreground/80 text-sm mb-6">
              Connecting the Desi community across the United States with trusted
              businesses and services.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-sidebar-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-sidebar-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-sidebar-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-sidebar-foreground/70">
                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <a href="mailto:support@BusinessHub.com" className="hover:text-primary">
                  support@BusinessHub.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-sidebar-foreground/70">
                <Phone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <a href="tel:1-800-BusinessHub" className="hover:text-primary">
                  1-800-BusinessHub
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-sidebar-foreground/70">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                Serving all major US cities
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-sidebar-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-sidebar-foreground/60">
            © {new Date().getFullYear()} {settings?.branding?.applicationName || 'BusinessHub.com'}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
