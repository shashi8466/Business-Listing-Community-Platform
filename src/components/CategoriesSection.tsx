import {
  GraduationCap,
  UtensilsCrossed,
  Home,
  Scale,
  PartyPopper,
  Heart,
  Wrench,
  Briefcase,
  Users,
} from "lucide-react";

const categories = [
  {
    name: "Tutors & Coaching",
    icon: GraduationCap,
    count: "2,400+",
    color: "bg-chart-1/10 text-chart-1 hover:bg-chart-1/20",
  },
  {
    name: "Restaurants & Food",
    icon: UtensilsCrossed,
    count: "3,200+",
    color: "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20",
  },
  {
    name: "Real Estate",
    icon: Home,
    count: "1,800+",
    color: "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20",
  },
  {
    name: "Legal & Finance",
    icon: Scale,
    count: "950+",
    color: "bg-chart-4/10 text-chart-4 hover:bg-chart-4/20",
  },
  {
    name: "Events & Entertainment",
    icon: PartyPopper,
    count: "1,100+",
    color: "bg-chart-5/10 text-chart-5 hover:bg-chart-5/20",
  },
  {
    name: "Health & Wellness",
    icon: Heart,
    count: "1,400+",
    color: "bg-chart-1/10 text-chart-1 hover:bg-chart-1/20",
  },
  {
    name: "Home Services",
    icon: Wrench,
    count: "2,100+",
    color: "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20",
  },
  {
    name: "Jobs & Professional",
    icon: Briefcase,
    count: "1,600+",
    color: "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20",
  },
  {
    name: "Community & Religious",
    icon: Users,
    count: "800+",
    color: "bg-chart-4/10 text-chart-4 hover:bg-chart-4/20",
  },
];

const CategoriesSection = () => {
  return (
    <section id="services" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore thousands of Desi businesses and services across various categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {categories.map((category) => (
            <a
              key={category.name}
              href="#"
              className={`group p-6 md:p-8 rounded-xl border border-border ${category.color} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <category.icon className="h-10 w-10 md:h-12 md:w-12 mb-4" />
              <h3 className="font-semibold text-foreground text-base md:text-lg mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">{category.count} listings</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
