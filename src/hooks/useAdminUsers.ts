import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User, UserRole } from "@/types";

export const useAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // In Supabase, retrieving user emails from the client is restricted by default.
      // We query user_roles table, which should be accessible to admins.
      const { data, error: fetchError } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        if (fetchError.code === '42P01') {
          setUsers([]);
          return;
        }
        throw fetchError;
      }

      if (data) {
        const fetchedUsers = data.map((doc: any) => {
          return {
            id: doc.user_id,
            email: `User ID: ${doc.user_id.substring(0,8)}...`, // Mocked since we can't fetch auth.users directly
            displayName: "Registered User", // Mocked
            createdAt: new Date(doc.created_at || Date.now()),
            role: doc.role as UserRole,
            favorites: []
          };
        }) as User[];
        
        setUsers(fetchedUsers);
      }
      setError(null);
    } catch (err: any) {
      console.error("Error fetching admin users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchUsers();
    return () => { mounted = false; };
  }, [fetchUsers]);

  const changeUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
        
      if (error) throw error;
      
      setUsers((prev) => 
        prev.map((u) => u.id === userId ? { ...u, role: newRole } : u)
      );
      return true;
    } catch (err: any) {
      console.error("Error changing user role:", err);
      throw err;
    }
  };

  const deleteUserRecord = async (userId: string) => {
    try {
      // Delete their role record which effectively cascades or removes their admin panel access
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
        
      if (error) throw error;
      
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return true;
    } catch (err: any) {
      console.error("Error deleting user:", err);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    changeUserRole,
    deleteUserRecord,
    refetch: fetchUsers,
  };
};
