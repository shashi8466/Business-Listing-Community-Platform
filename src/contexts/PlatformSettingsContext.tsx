import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface BrandingSettings {
  applicationName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  logoSize?: number;
  logoBorder?: boolean;
}

export interface PlatformSettings {
  id?: string;
  general?: Record<string, any>;
  branding?: BrandingSettings;
  seo?: Record<string, any>;
  email?: Record<string, any>;
  payments?: Record<string, any>;
  security?: Record<string, any>;
  notifications?: Record<string, any>;
}

interface PlatformSettingsContextType {
  settings: PlatformSettings | null;
  loading: boolean;
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const PlatformSettingsContext = createContext<PlatformSettingsContextType | undefined>(undefined);

export const PlatformSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching platform settings:', error);
      } else if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch platform settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Apply branding settings dynamically
  useEffect(() => {
    if (settings?.branding) {
      const { applicationName, faviconUrl } = settings.branding;
      
      if (applicationName) {
        document.title = applicationName;
      }
      
      if (faviconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = faviconUrl;
      }
    }
  }, [settings?.branding]);

  const updateSettings = async (newSettings: Partial<PlatformSettings>) => {
    try {
      // Get current user to ensure we're logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to update settings");

      const updates = {
        ...newSettings,
        updated_at: new Date().toISOString(),
      };

      if (settings?.id) {
        const { error } = await supabase
          .from('platform_settings')
          .update(updates)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('platform_settings')
          .insert([updates])
          .select()
          .single();

        if (error) throw error;
        if (data) setSettings(data);
        return;
      }

      setSettings(prev => prev ? { ...prev, ...newSettings } : newSettings as PlatformSettings);
      
      toast({
        title: "Settings Saved",
        description: "Platform settings updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error saving settings",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <PlatformSettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings: fetchSettings }}>
      {children}
    </PlatformSettingsContext.Provider>
  );
};

export const usePlatformSettings = () => {
  const context = useContext(PlatformSettingsContext);
  if (context === undefined) {
    throw new Error('usePlatformSettings must be used within a PlatformSettingsProvider');
  }
  return context;
};
