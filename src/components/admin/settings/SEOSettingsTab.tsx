import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";

export default function SEOSettingsTab() {
  const { settings, updateSettings } = usePlatformSettings();
  const [formData, setFormData] = useState({
    metaTitle: "BusinessHub - Desi Business Directory",
    metaDesc: "Find the best South Asian businesses and services in your local area.",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.seo) {
      setFormData(prev => ({ ...prev, ...settings.seo }));
    }
  }, [settings?.seo]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ seo: formData });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Configuration</CardTitle>
        <CardDescription>Manage default meta tags and search engine visibility.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="metaTitle">Default Meta Title</Label>
          <Input 
            id="metaTitle" 
            value={formData.metaTitle}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="metaDesc">Default Meta Description</Label>
          <Input 
            id="metaDesc" 
            value={formData.metaDesc}
            onChange={(e) => setFormData({ ...formData, metaDesc: e.target.value })} 
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
