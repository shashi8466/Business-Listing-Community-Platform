import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  toggleFavorite: (businessId: string) => Promise<boolean>;
  isFavorite: (businessId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (sessionUser: SupabaseUser) => {
      try {
        // Fetch role and profile concurrently
        const [roleResult, profileResult] = await Promise.all([
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", sessionUser.id)
            .maybeSingle(),
          supabase
            .from("user_profiles")
            .select("display_name, phone, city, state, zip")
            .eq("id", sessionUser.id)
            .maybeSingle()
        ]);

        const roleData = roleResult.data;
        const profileData = profileResult.data;

        // Strict role resolution
        let resolvedRole: UserRole = "user"; // Default safety
        
        if (roleData?.role) {
          resolvedRole = roleData.role as UserRole;
        } else if (sessionUser.user_metadata?.role) {
          resolvedRole = sessionUser.user_metadata.role as UserRole;
        } else {
          // If we reach here, a user logged in but has no role record and no metadata.
          // This should only happen for old accounts or if the DB trigger failed.
          console.error("User authenticated but has no role record or metadata.");
          // We can throw an error here to prevent silent downgrade if strict enforcement is needed
          // For now, we allow them in as 'user' but we log it as an error as requested.
        }

        // We will construct the userProfile object
        if (mounted) {
          setUserProfile({
            id: sessionUser.id,
            email: sessionUser.email || "",
            displayName: profileData?.display_name || sessionUser.user_metadata?.displayName || sessionUser.email?.split("@")[0] || "",
            phone: profileData?.phone || "",
            city: profileData?.city || "",
            state: profileData?.state || "",
            zip: profileData?.zip || "",
            createdAt: new Date(sessionUser.created_at),
            role: resolvedRole,
            favorites: [] // Favorites will be loaded by a separate hook
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const setupAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          setUser(session?.user || null);
          if (session?.user) {
            await fetchProfile(session.user);
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (mounted) {
            setUser(session?.user || null);
            if (session?.user) {
              await fetchProfile(session.user);
            } else {
              setUserProfile(null);
            }
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error setting up auth:", error);
        if (mounted) setLoading(false);
      }
    };

    const cleanup = setupAuth();

    return () => {
      mounted = false;
      cleanup.then(fn => fn && fn());
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, displayName: string, role: UserRole = 'user') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          displayName,
          role,
        }
      }
    });
    
    if (error) throw error;
    
    // We rely entirely on the PostgreSQL trigger to assign the role.
    // If the trigger fails, the role will fall back to user_metadata or default to user.
  };

  const signOut = async () => {
    // Fire and forget server-side signout
    supabase.auth.signOut().catch(error => {
      console.error("Error during signOut:", error);
    });
    
    // Immediately clear local state
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    if (error) throw error;
  };

  const changePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("No user logged in");
    
    // 1. Update Auth metadata (for displayName)
    if (data.displayName) {
      const { error } = await supabase.auth.updateUser({
        data: { displayName: data.displayName }
      });
      if (error) throw error;
    }

    // 2. Update/Upsert the user_profiles table for extended details
    const profilePayload = {
      id: user.id,
      display_name: data.displayName || userProfile?.displayName,
      phone: data.phone || userProfile?.phone,
      city: data.city || userProfile?.city,
      state: data.state || userProfile?.state,
      zip: data.zip || userProfile?.zip,
      updated_at: new Date().toISOString()
    };

    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert(profilePayload);

    if (profileError) {
      console.warn("Could not save to user_profiles table, it might not exist yet:", profileError);
    }
    
    setUserProfile(prev => prev ? { ...prev, ...data } : null);
  };

  const toggleFavorite = async (businessId: string): Promise<boolean> => {
    if (!user) return false;
    
    const isFav = isFavorite(businessId);
    
    if (isFav) {
      // Remove
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('business_id', businessId);
        
      setUserProfile(prev => prev ? {
        ...prev,
        favorites: prev.favorites?.filter(id => id !== businessId)
      } : null);
      return false;
    } else {
      // Add
      await supabase
        .from('user_favorites')
        .insert({ user_id: user.id, business_id: businessId });
        
      setUserProfile(prev => prev ? {
        ...prev,
        favorites: [...(prev.favorites || []), businessId]
      } : null);
      return true;
    }
  };

  const isFavorite = (businessId: string): boolean => {
    return userProfile?.favorites?.includes(businessId) || false;
  };

  // Don't block render while loading - just show content with null user
  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      resetPassword,
      changePassword,
      updateUserProfile,
      toggleFavorite,
      isFavorite
    }}>
      {children}
    </AuthContext.Provider>
  );
};
