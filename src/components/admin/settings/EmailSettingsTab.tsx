import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";

export default function EmailSettingsTab() {
  const { settings, updateSettings } = usePlatformSettings();
  const [isSaving, setIsSaving] = useState(false);

  // We can add email specific settings here later, for now we just show a message
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ email: {} });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
        <CardDescription>Configure SMTP and email templates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground border p-4 rounded bg-muted/50">
          Email configuration is managed via Resend in the backend. 
          Future updates will allow template editing here.
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
