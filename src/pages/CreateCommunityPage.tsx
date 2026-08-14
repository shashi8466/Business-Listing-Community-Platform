import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { US_CITIES } from "@/types";
import { INTEREST_CATEGORIES } from "@/types/community";

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "city" as "city" | "interest",
    city: "",
    interest: "",
    rules: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: "Please sign in to create a community", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!formData.name.trim()) {
      toast({ title: "Please enter a community name", variant: "destructive" });
      return;
    }

    if (formData.type === "city" && !formData.city) {
      toast({ title: "Please select a city", variant: "destructive" });
      return;
    }

    if (formData.type === "interest" && !formData.interest) {
      toast({ title: "Please select an interest category", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const { data, error } = await supabase
        .from("communities")
        .insert({
          name: formData.name,
          slug: slug,
          description: formData.description,
          type: formData.type,
          city: formData.type === "city" ? formData.city : null,
          interest: formData.type === "interest" ? formData.interest : null,
          rules: formData.rules,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner
      await supabase.from("community_members").insert({
        community_id: data.id,
        user_id: user.id,
        role: "admin",
      });

      toast({ title: "Community created successfully!" });
      navigate(`/community/${data.slug}`);
    } catch (error: any) {
      console.error("Error creating community:", error);
      toast({
        title: "Failed to create community",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Create Community | BusinessHub</title>
        <meta name="description" content="Create a new Desi community on BusinessHub" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <h1 className="text-2xl font-bold text-foreground mb-6">
                Create a New Community
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Community Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Bay Area Desi Professionals"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this community about?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Community Type *</Label>
                  <RadioGroup
                    value={formData.type}
                    onValueChange={(value: "city" | "interest") =>
                      setFormData({ ...formData, type: value, city: "", interest: "" })
                    }
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 border border-border rounded-lg p-4 cursor-pointer hover:border-primary">
                      <RadioGroupItem value="city" id="city" />
                      <Label htmlFor="city" className="cursor-pointer">
                        <div className="font-medium">City-based</div>
                        <div className="text-sm text-muted-foreground">Connect by location</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border border-border rounded-lg p-4 cursor-pointer hover:border-primary">
                      <RadioGroupItem value="interest" id="interest" />
                      <Label htmlFor="interest" className="cursor-pointer">
                        <div className="font-medium">Interest-based</div>
                        <div className="text-sm text-muted-foreground">Connect by topic</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.type === "city" && (
                  <div className="space-y-2">
                    <Label>Select City *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({ ...formData, city: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a city" />
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
                )}

                {formData.type === "interest" && (
                  <div className="space-y-2">
                    <Label>Select Interest Category *</Label>
                    <Select
                      value={formData.interest}
                      onValueChange={(value) => setFormData({ ...formData, interest: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {INTEREST_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="rules">Community Rules (optional)</Label>
                  <Textarea
                    id="rules"
                    placeholder="Set guidelines for community members..."
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Community"}
                </Button>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CreateCommunityPage;
