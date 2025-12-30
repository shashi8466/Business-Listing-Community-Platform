import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    services: [
      "Tutors & Coaching",
      "Restaurants & Food",
      "Real Estate",
      "Legal & Finance",
      "Events & Entertainment",
      "Health & Wellness",
    ],
    company: [
      "About Us",
      "Careers",
      "Press",
      "Blog",
      "Contact Us",
      "Partner with Us",
    ],
    support: [
      "Help Center",
      "Safety Guidelines",
      "Community Guidelines",
      "Report a Problem",
      "Advertise",
      "Sitemap",
    ],
    legal: [
      "Privacy Policy",
      "Terms of Service",
      "Cookie Policy",
      "Accessibility",
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold">
                <span className="text-primary">d4</span>
                <span className="text-sidebar-foreground">desi</span>
              </span>
            </a>
            <p className="text-sidebar-foreground/80 text-sm mb-6">
              Connecting the Desi community across the United States with trusted businesses and services.
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
              {footerLinks.services.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-sidebar-foreground/70 hover:text-primary transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-sidebar-foreground/70 hover:text-primary transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-sidebar-foreground/70 hover:text-primary transition-colors"
                  >
                    {link}
                  </a>
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
                support@d4desi.com
              </li>
              <li className="flex items-start gap-3 text-sm text-sidebar-foreground/70">
                <Phone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                1-800-D4-DESI
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
            © {new Date().getFullYear()} d4desi.com. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {footerLinks.legal.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
