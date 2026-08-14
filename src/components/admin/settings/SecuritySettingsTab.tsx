import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";

export default function SecuritySettingsTab() {
  const { settings, updateSettings } = usePlatformSettings();
  const [formData, setFormData] = useState({
    require2FA: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.security) {
      setFormData(prev => ({ ...prev, ...settings.security }));
    }
  }, [settings?.security]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ security: formData });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Manage platform security policies.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border rounded-lg p-4">
          <div>
            <h4 className="font-medium">Require Two-Factor Authentication</h4>
            <p className="text-sm text-muted-foreground">Enforce 2FA for all administrative accounts.</p>
          </div>
          <Switch 
            checked={formData.require2FA}
            onCheckedChange={(checked) => setFormData({ ...formData, require2FA: checked })}
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
