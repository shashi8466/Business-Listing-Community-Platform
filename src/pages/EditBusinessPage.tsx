import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
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
  Trash2,
  Loader2,
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
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
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import { CATEGORIES, US_CITIES } from "@/types";

const EditBusinessPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { business, loading: businessLoading } = useBusiness(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
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
  });
  const [images, setImages] = useState<string[]>([]);
  const [newService, setNewService] = useState("");

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        category: business.category || "",
        description: business.description || "",
        street: business.address?.street || "",
        city: business.address?.city || "",
        state: business.address?.state || "",
        zipCode: business.address?.zipCode || "",
        phone: business.phone || "",
        email: business.email || "",
        website: business.website || "",
        services: business.services || [],
      });
      setImages(business.images || []);
    }
  }, [business]);

  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check ownership or admin
  const isOwner = business?.ownerId === user.uid;
  const isAdmin = userProfile?.role === "admin";

  if (business && !isOwner && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to edit this business.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
      setNewService("");
    }
  };

  const handleRemoveService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }));
  };

  const handleCityChange = (cityName: string) => {
    const city = US_CITIES.find((c) => c.city === cityName);
    if (city) {
      setFormData((prev) => ({
        ...prev,
        city: city.city,
        state: city.state,
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !id) return;

    setUploadingImages(true);
    try {
      const storage = await getFirebaseStorage();
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileRef = ref(storage, `businesses/${id}/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        return getDownloadURL(fileRef);
      });

      const urls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...urls]);

      toast({
        title: "Images Uploaded",
        description: `${urls.length} image(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error("Failed to upload images:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    try {
      // Try to delete from storage if it's a Firebase URL
      if (imageUrl.includes("firebase")) {
        const storage = await getFirebaseStorage();
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef).catch(() => {}); // Ignore if not found
      }
      setImages((prev) => prev.filter((img) => img !== imageUrl));
    } catch (error) {
      console.error("Failed to remove image:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    try {
      const db = await getFirebaseDb();

      await updateDoc(doc(db, "businesses", id), {
        name: formData.name.trim(),
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
        images,
        services: formData.services,
        updatedAt: new Date(),
      });

      toast({
        title: "Business Updated",
        description: "Your listing has been updated successfully.",
      });

      navigate(`/business/${id}`);
    } catch (error) {
      console.error("Failed to update business:", error);
      toast({
        title: "Update Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Edit Business - d4desi</title>
        <meta name="description" content="Edit your business listing on d4desi" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Edit Business</h1>
                  <p className="text-muted-foreground">Update your listing details</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Images Section */}
                <div className="space-y-4">
                  <Label>Business Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Business ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                      {uploadingImages ? (
                        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">Add Images</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Basic Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Business Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
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
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      rows={5}
                      required
                    />
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Services</h3>
                  <div className="flex gap-2">
                    <Input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Add a service"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddService())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddService}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.services.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.services.map((service) => (
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

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Location</h3>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => setFormData((prev) => ({ ...prev, street: e.target.value }))}
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
                          {US_CITIES.map((city) => (
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
                        onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Contact Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
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
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
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
                        onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default EditBusinessPage;
