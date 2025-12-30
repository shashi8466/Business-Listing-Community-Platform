import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Business } from "@/types";

export const useFavorites = () => {
  const { userProfile } = useAuth();
  const [favorites, setFavorites] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    if (!userProfile?.favorites?.length) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const db = await getFirebaseDb();
      
      const businessPromises = userProfile.favorites.map(async (businessId) => {
        const businessDoc = await getDoc(doc(db, "businesses", businessId));
        if (businessDoc.exists()) {
          const data = businessDoc.data();
          return {
            id: businessDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          } as Business;
        }
        return null;
      });
      
      const results = await Promise.all(businessPromises);
      setFavorites(results.filter((b): b is Business => b !== null));
      setError(null);
    } catch (err: any) {
      console.error("Error fetching favorites:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [userProfile?.favorites]);

  const refetch = () => {
    fetchFavorites();
  };

  return { favorites, loading, error, refetch };
};
