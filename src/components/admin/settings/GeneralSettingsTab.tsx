import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";

export default function GeneralSettingsTab() {
  const { settings, updateSettings } = usePlatformSettings();
  const [formData, setFormData] = useState({
    siteName: "BusinessHub",
    supportEmail: "support@businesshub.com",
    maintenanceMode: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.general) {
      setFormData(prev => ({ ...prev, ...settings.general }));
    }
  }, [settings?.general]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ general: formData });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Basic information about your platform.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="siteName">Site Name</Label>
          <Input 
            id="siteName" 
            value={formData.siteName}
            onChange={(e) => setFormData({ ...formData, siteName: e.target.value })} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="supportEmail">Support Email</Label>
          <Input 
            id="supportEmail" 
            type="email" 
            value={formData.supportEmail}
            onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })} 
          />
        </div>
        <div className="flex items-center justify-between border rounded-lg p-4 mt-4">
          <div>
            <h4 className="font-medium">Maintenance Mode</h4>
            <p className="text-sm text-muted-foreground">Temporarily disable access to the platform for regular users.</p>
          </div>
          <Switch 
            checked={formData.maintenanceMode}
            onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
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
