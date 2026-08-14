import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";

export default function PaymentSettingsTab() {
  const { settings, updateSettings } = usePlatformSettings();
  const [formData, setFormData] = useState({
    enableStripe: true,
    currency: "USD",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.payments) {
      setFormData(prev => ({ ...prev, ...settings.payments }));
    }
  }, [settings?.payments]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ payments: formData });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Gateways</CardTitle>
        <CardDescription>Configure Stripe and payment options. (API keys must be set in secure environment variables, not here).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border rounded-lg p-4">
          <div>
            <h4 className="font-medium">Enable Stripe Payments</h4>
            <p className="text-sm text-muted-foreground">Allow users to pay for premium listings and subscriptions.</p>
          </div>
          <Switch 
            checked={formData.enableStripe}
            onCheckedChange={(checked) => setFormData({ ...formData, enableStripe: checked })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currency">Default Currency</Label>
          <select 
            id="currency" 
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="USD">USD ($)</option>
            <option value="CAD">CAD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
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
