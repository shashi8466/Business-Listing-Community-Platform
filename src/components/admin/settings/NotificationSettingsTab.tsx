import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";

export default function NotificationSettingsTab() {
  const { settings, updateSettings } = usePlatformSettings();
  const [formData, setFormData] = useState({
    adminAlerts: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.notifications) {
      setFormData(prev => ({ ...prev, ...settings.notifications }));
    }
  }, [settings?.notifications]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ notifications: formData });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Configure global notification preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border rounded-lg p-4">
          <div>
            <h4 className="font-medium">Admin Alerts</h4>
            <p className="text-sm text-muted-foreground">Receive email alerts for new business registrations.</p>
          </div>
          <Switch 
            checked={formData.adminAlerts}
            onCheckedChange={(checked) => setFormData({ ...formData, adminAlerts: checked })}
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
