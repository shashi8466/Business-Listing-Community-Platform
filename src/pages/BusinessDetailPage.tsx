import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  CheckCircle2,
  Heart,
  Share2,
  ChevronLeft,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Business, Review, CATEGORIES } from "@/types";

// Sample data for demo
const sampleBusiness: Business = {
  id: "1",
  ownerId: "owner1",
  name: "Spice Symphony",
  slug: "spice-symphony",
  description: "Authentic North Indian cuisine with a modern twist. Family-owned restaurant serving the community for over 15 years. We take pride in using fresh ingredients and traditional recipes passed down through generations. Whether you're craving rich butter chicken, flavorful biryanis, or our signature tandoori dishes, Spice Symphony delivers an unforgettable dining experience.",
  category: "restaurants",
  subcategory: "North Indian",
  address: { street: "123 Main Street", city: "New York", state: "NY", zipCode: "10001" },
  phone: "(212) 555-0123",
  email: "info@spicesymphony.com",
  website: "https://spicesymphony.com",
  images: [
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&h=600&fit=crop",
  ],
  rating: 4.8,
  reviewCount: 245,
  featured: true,
  verified: true,
  approved: true,
  active: true,
  services: ["Dine-in", "Takeout", "Catering", "Delivery", "Private Events"],
  hours: {
    monday: { open: "11:00 AM", close: "10:00 PM" },
    tuesday: { open: "11:00 AM", close: "10:00 PM" },
    wednesday: { open: "11:00 AM", close: "10:00 PM" },
    thursday: { open: "11:00 AM", close: "10:00 PM" },
    friday: { open: "11:00 AM", close: "11:00 PM" },
    saturday: { open: "11:00 AM", close: "11:00 PM" },
    sunday: { open: "12:00 PM", close: "9:00 PM" },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleReviews: Review[] = [
  {
    id: "r1",
    businessId: "1",
    userId: "u1",
    userName: "Priya M.",
    rating: 5,
    title: "Best Indian food in the city!",
    content: "The butter chicken here is absolutely divine. The naan is fresh and fluffy. Staff is super friendly. We come here every week for family dinner.",
    helpful: 24,
    createdAt: new Date("2024-12-15"),
  },
  {
    id: "r2",
    businessId: "1",
    userId: "u2",
    userName: "Raj K.",
    rating: 5,
    title: "Authentic taste, great ambiance",
    content: "Reminds me of home cooking. The biryani is perfectly spiced and the portions are generous. Highly recommend for anyone looking for authentic North Indian cuisine.",
    helpful: 18,
    createdAt: new Date("2024-12-10"),
  },
  {
    id: "r3",
    businessId: "1",
    userId: "u3",
    userName: "Sarah J.",
    rating: 4,
    title: "Great food, worth the wait",
    content: "The food is excellent but be prepared to wait during peak hours. The tandoori chicken is a must-try. Will definitely come back!",
    helpful: 12,
    createdAt: new Date("2024-12-05"),
  },
];

const BusinessDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    content: "",
  });

  // For demo, use sample data. In production:
  // const { business, reviews, loading, error, addReview } = useBusiness(id);
  const business = sampleBusiness;
  const reviews = sampleReviews;

  const getCategoryName = (catId: string) =>
    CATEGORIES.find((c) => c.id === catId)?.name || catId;

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Inquiry Sent!",
      description: "The business will get back to you soon.",
    });
    setInquiryForm({ name: "", email: "", phone: "", message: "" });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to submit a review.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Review Submitted!",
      description: "Thank you for your feedback.",
    });
    setReviewForm({ rating: 5, title: "", content: "" });
  };

  const handleSave = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to save businesses.",
        variant: "destructive",
      });
      return;
    }
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Saved!",
      description: isSaved
        ? "Business removed from your saved list."
        : "Business added to your saved list.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: business.name,
        text: business.description,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Business link copied to clipboard.",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{business.name} - d4desi</title>
        <meta name="description" content={business.description.substring(0, 160)} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: business.name,
            description: business.description,
            address: {
              "@type": "PostalAddress",
              streetAddress: business.address.street,
              addressLocality: business.address.city,
              addressRegion: business.address.state,
              postalCode: business.address.zipCode,
            },
            telephone: business.phone,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: business.rating,
              reviewCount: business.reviewCount,
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="bg-muted/50 border-b border-border py-3">
            <div className="container mx-auto px-4">
              <Link
                to="/search"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Search
              </Link>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Image Gallery */}
                <div className="mb-8">
                  <div className="rounded-xl overflow-hidden mb-3">
                    <img
                      src={business.images[selectedImage]}
                      alt={business.name}
                      className="w-full h-80 md:h-96 object-cover"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {business.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === idx
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${business.name} ${idx + 1}`}
                          className="w-20 h-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Business Info */}
                <div className="mb-8">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {business.featured && (
                      <Badge className="bg-accent text-accent-foreground">
                        Featured
                      </Badge>
                    )}
                    {business.verified && (
                      <Badge
                        variant="outline"
                        className="text-primary border-primary gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {getCategoryName(business.category)}
                    </Badge>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                    {business.name}
                  </h1>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-accent text-accent" />
                      <span className="font-semibold text-lg">
                        {business.rating}
                      </span>
                      <span className="text-muted-foreground">
                        ({business.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {business.address.city}, {business.address.state}
                    </div>
                  </div>

                  <div className="flex gap-3 mb-6">
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      className={isSaved ? "text-destructive" : ""}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${
                          isSaved ? "fill-current" : ""
                        }`}
                      />
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  <p className="text-foreground leading-relaxed">
                    {business.description}
                  </p>
                </div>

                {/* Services */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Services
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {business.services.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tabs: Reviews / Hours */}
                <Tabs defaultValue="reviews">
                  <TabsList className="mb-6">
                    <TabsTrigger value="reviews">
                      Reviews ({reviews.length})
                    </TabsTrigger>
                    <TabsTrigger value="hours">Business Hours</TabsTrigger>
                  </TabsList>

                  <TabsContent value="reviews">
                    {/* Write Review Form */}
                    <div className="bg-muted/50 border border-border rounded-xl p-6 mb-6">
                      <h3 className="font-semibold text-foreground mb-4">
                        Write a Review
                      </h3>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setReviewForm((prev) => ({
                                    ...prev,
                                    rating: star,
                                  }))
                                }
                              >
                                <Star
                                  className={`h-8 w-8 ${
                                    star <= reviewForm.rating
                                      ? "fill-accent text-accent"
                                      : "text-muted"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <Input
                          id="review-title"
                          name="title"
                          placeholder="Review title"
                          value={reviewForm.title}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          required
                        />
                        <Textarea
                          id="review-content"
                          name="content"
                          placeholder="Share your experience..."
                          value={reviewForm.content}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          rows={4}
                          required
                        />
                        <Button type="submit">Submit Review</Button>
                      </form>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-card border border-border rounded-xl p-5"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-foreground">
                                  {review.userName}
                                </span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "fill-accent text-accent"
                                          : "text-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <h4 className="font-medium text-foreground mb-2">
                            {review.title}
                          </h4>
                          <p className="text-muted-foreground">
                            {review.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="hours">
                    <div className="bg-card border border-border rounded-xl p-6">
                      <div className="space-y-3">
                        {Object.entries(business.hours).map(([day, hours]) => (
                          <div
                            key={day}
                            className="flex justify-between items-center py-2 border-b border-border last:border-0"
                          >
                            <span className="font-medium capitalize text-foreground">
                              {day}
                            </span>
                            <span className="text-muted-foreground">
                              {typeof hours === "string"
                                ? hours
                                : `${hours.open} - ${hours.close}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Contact Card */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-foreground">{business.address.street}</p>
                          <p className="text-muted-foreground">
                            {business.address.city}, {business.address.state}{" "}
                            {business.address.zipCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <a
                          href={`tel:${business.phone}`}
                          className="text-foreground hover:text-primary"
                        >
                          {business.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <a
                          href={`mailto:${business.email}`}
                          className="text-foreground hover:text-primary"
                        >
                          {business.email}
                        </a>
                      </div>
                      {business.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-primary" />
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:text-primary"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inquiry Form */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Send an Inquiry
                    </h3>
                    <form onSubmit={handleInquirySubmit} className="space-y-4">
                      <Input
                        id="inquiry-name"
                        name="name"
                        placeholder="Your Name"
                        value={inquiryForm.name}
                        onChange={(e) =>
                          setInquiryForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                      <Input
                        id="inquiry-email"
                        name="email"
                        type="email"
                        placeholder="Your Email"
                        value={inquiryForm.email}
                        onChange={(e) =>
                          setInquiryForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                      <Input
                        id="inquiry-phone"
                        name="phone"
                        type="tel"
                        placeholder="Phone (optional)"
                        value={inquiryForm.phone}
                        onChange={(e) =>
                          setInquiryForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        id="inquiry-message"
                        name="message"
                        placeholder="Your message..."
                        value={inquiryForm.message}
                        onChange={(e) =>
                          setInquiryForm((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }))
                        }
                        rows={4}
                        required
                      />
                      <Button type="submit" className="w-full gap-2">
                        <Send className="h-4 w-4" />
                        Send Inquiry
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BusinessDetailPage;
