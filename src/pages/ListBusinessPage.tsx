import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Building2,
  Upload,
  Plus,
  X,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseDb } from "@/lib/firebase";
import { CATEGORIES, US_CITIES } from "@/types";

const ListBusinessPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    services: [] as string[],
    agreeToTerms: false,
  });

  const [newService, setNewService] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleAddService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService("");
    }
  };

  const handleRemoveService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }));
  };

  const handleCityChange = (cityName: string) => {
    const city = US_CITIES.find(c => c.city === cityName);
    if (city) {
      setFormData(prev => ({
        ...prev,
        city: city.city,
        state: city.state
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const db = await getFirebaseDb();

      const slug = formData.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const docRef = await addDoc(collection(db, "businesses"), {
        ownerId: user.uid,
        name: formData.name.trim(),
        slug,
        description: formData.description.trim(),
        category: formData.category,
        address: {
          street: formData.street.trim(),
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode.trim(),
        },
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        ...(formData.website?.trim() ? { website: formData.website.trim() } : {}),
        images: [],
        rating: 0,
        reviewCount: 0,
        featured: false,
        verified: false,
        approved: true,
        active: true,
        services: formData.services,
        hours: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Business Listed!",
        description: "Your business is now live.",
      });

      navigate(`/business/${docRef.id}`);
    } catch (error) {
      console.error("Failed to submit business:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.name && formData.category && formData.description;
  const isStep2Valid = formData.street && formData.city && formData.state && formData.zipCode && formData.phone && formData.email;

  return (
    <>
      <Helmet>
        <title>List Your Business - d4desi</title>
        <meta name="description" content="Add your Desi business to d4desi and reach thousands of customers" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 md:w-24 h-1 mx-2 ${
                        step > s ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">List Your Business</h1>
                  <p className="text-muted-foreground">
                    {step === 1 && "Tell us about your business"}
                    {step === 2 && "Add your contact details"}
                    {step === 3 && "Review and submit"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Business Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Business Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your business name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your business, services, and what makes you unique..."
                        rows={5}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Services Offered</Label>
                      <div className="flex gap-2">
                        <Input
                          id="new-service"
                          name="service"
                          value={newService}
                          onChange={(e) => setNewService(e.target.value)}
                          placeholder="Add a service (e.g., Dine-in, Delivery)"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                        />
                        <Button type="button" variant="outline" onClick={handleAddService}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.services.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.services.map(service => (
                            <span
                              key={service}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                            >
                              {service}
                              <button type="button" onClick={() => handleRemoveService(service)}>
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!isStep1Valid}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Info */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="street"
                          value={formData.street}
                          onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="123 Main Street"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Select value={formData.city} onValueChange={handleCityChange}>
                          <SelectTrigger id="city">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_CITIES.map(city => (
                              <SelectItem key={city.city} value={city.city}>
                                {city.city}, {city.state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="NY"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                          placeholder="10001"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(555) 123-4567"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Business Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="contact@yourbusiness.com"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website (optional)</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://yourbusiness.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setStep(3)}
                        disabled={!isStep2Valid}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                      <h3 className="font-semibold text-foreground">Review Your Listing</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Business Name:</span>
                          <p className="font-medium text-foreground">{formData.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <p className="font-medium text-foreground">
                            {CATEGORIES.find(c => c.id === formData.category)?.name}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground">Description:</span>
                          <p className="font-medium text-foreground">{formData.description}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground">Address:</span>
                          <p className="font-medium text-foreground">
                            {formData.street}, {formData.city}, {formData.state} {formData.zipCode}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone:</span>
                          <p className="font-medium text-foreground">{formData.phone}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-medium text-foreground">{formData.email}</p>
                        </div>
                        {formData.services.length > 0 && (
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground">Services:</span>
                            <p className="font-medium text-foreground">{formData.services.join(", ")}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                        }
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground">
                        I agree to the{" "}
                        <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                        {" "}and{" "}
                        <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                      </label>
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button type="submit" disabled={isSubmitting || !formData.agreeToTerms}>
                        {isSubmitting ? "Submitting..." : "Submit Listing"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ListBusinessPage;
