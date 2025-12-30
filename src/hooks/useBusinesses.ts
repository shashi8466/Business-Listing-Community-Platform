import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs, QueryConstraint } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Business } from "@/types";

interface UseBusinessesOptions {
  category?: string;
  city?: string;
  featured?: boolean;
  searchQuery?: string;
  limitCount?: number;
}

export const useBusinesses = (options: UseBusinessesOptions = {}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const db = await getFirebaseDb();
        
        const constraints: QueryConstraint[] = [];
        
        if (options.category) {
          constraints.push(where("category", "==", options.category));
        }
        
        if (options.city) {
          constraints.push(where("address.city", "==", options.city));
        }
        
        if (options.featured) {
          constraints.push(where("featured", "==", true));
        }
        
        constraints.push(orderBy("rating", "desc"));
        
        if (options.limitCount) {
          constraints.push(limit(options.limitCount));
        }
        
        const q = query(collection(db, "businesses"), ...constraints);
        const querySnapshot = await getDocs(q);
        
        let results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Business[];
        
        // Client-side search filter if searchQuery provided
        if (options.searchQuery) {
          const searchLower = options.searchQuery.toLowerCase();
          results = results.filter(b => 
            b.name.toLowerCase().includes(searchLower) ||
            b.description.toLowerCase().includes(searchLower) ||
            b.category.toLowerCase().includes(searchLower)
          );
        }
        
        setBusinesses(results);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching businesses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [options.category, options.city, options.featured, options.searchQuery, options.limitCount]);

  return { businesses, loading, error };
};
