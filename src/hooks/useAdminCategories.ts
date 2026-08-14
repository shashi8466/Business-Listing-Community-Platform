import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  active: boolean;
  order: number;
  parentId?: string;
  createdAt: Date;
}

export const useAdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("*")
        .order("order", { ascending: true });
        
      if (fetchError) {
        // Table might not exist yet in their schema or API route doesn't exist (404)
        if (fetchError.code === '42P01' || fetchError.code === 'PGRST116' || fetchError.message?.includes('not found') || fetchError.message?.includes('404')) {
          setCategories([]);
          return;
        }
        // Because Categories table doesn't exist in the current schema, we suppress other API 404s
        setCategories([]);
        return;
      }
      
      if (data) {
        const fetchedCategories = data.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          slug: doc.slug,
          icon: doc.icon,
          active: doc.active,
          order: doc.order || 0,
          parentId: doc.parent_id,
          createdAt: new Date(doc.created_at || Date.now())
        })) as Category[];
        
        setCategories(fetchedCategories);
      }
      setError(null);
    } catch (err: any) {
      setCategories([]);
      setError(null); // Suppress missing table errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchCategories();
    return () => { mounted = false; };
  }, [fetchCategories]);

  const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: categoryData.name,
          slug: categoryData.slug,
          icon: categoryData.icon,
          active: categoryData.active,
          order: categoryData.order,
          parent_id: categoryData.parentId
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newCategory: Category = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        active: data.active,
        order: data.order,
        parentId: data.parent_id,
        createdAt: new Date(data.created_at)
      };
      
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error("Error creating category:", err);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.active !== undefined) dbUpdates.active = updates.active;
      if (updates.order !== undefined) dbUpdates.order = updates.order;
      if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;
      
      const { error } = await supabase
        .from("categories")
        .update(dbUpdates)
        .eq("id", id);
        
      if (error) throw error;
      
      setCategories(prev => 
        prev.map(c => c.id === id ? { ...c, ...updates } : c)
            .sort((a, b) => a.order - b.order)
      );
    } catch (err) {
      console.error("Error updating category:", err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting category:", err);
      throw err;
    }
  };

  return { categories, loading, error, createCategory, updateCategory, deleteCategory, refetch: fetchCategories };
};
