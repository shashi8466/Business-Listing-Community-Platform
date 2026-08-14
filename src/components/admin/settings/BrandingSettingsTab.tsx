import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePlatformSettings, BrandingSettings } from "@/contexts/PlatformSettingsContext";

export default function BrandingSettingsTab() {
  const { settings, updateSettings } = usePlatformSettings();
  const [formData, setFormData] = useState<BrandingSettings>({
    applicationName: "BusinessHub",
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
    logoSize: 60,
    logoBorder: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.branding) {
      setFormData(prev => ({ ...prev, ...settings.branding }));
    }
  }, [settings?.branding]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ branding: formData });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding Settings</CardTitle>
        <CardDescription>Customize the look and feel of the platform.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="applicationName">Application Name</Label>
          <Input 
            id="applicationName" 
            value={formData.applicationName}
            onChange={(e) => setFormData({ ...formData, applicationName: e.target.value })} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input 
            id="logoUrl" 
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })} 
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="faviconUrl">Favicon URL</Label>
          <Input 
            id="faviconUrl" 
            value={formData.faviconUrl}
            onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })} 
            placeholder="https://example.com/favicon.ico"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logoSize">Logo Size (Height in px)</Label>
          <Input 
            id="logoSize" 
            type="number"
            value={formData.logoSize}
            onChange={(e) => setFormData({ ...formData, logoSize: parseInt(e.target.value) || 60 })} 
          />
        </div>
        <div className="flex items-center justify-between border rounded-lg p-4 mt-4">
          <div>
            <h4 className="font-medium">Show Logo Border</h4>
            <p className="text-sm text-muted-foreground">Add a decorative border around the logo.</p>
          </div>
          <Switch 
            checked={formData.logoBorder}
            onCheckedChange={(checked) => setFormData({ ...formData, logoBorder: checked })}
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
