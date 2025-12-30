import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Business } from "@/types";

export const useMyBusinesses = (ownerId: string | undefined) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    if (!ownerId) {
      setBusinesses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const db = await getFirebaseDb();

      // No orderBy to avoid composite index requirement
      const q = query(
        collection(db, "businesses"),
        where("ownerId", "==", ownerId)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as Business[];
      // Sort client-side
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setBusinesses(results);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching user businesses:", err);
      setError(err.message);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const deleteBusiness = async (businessId: string) => {
    const db = await getFirebaseDb();
    await deleteDoc(doc(db, "businesses", businessId));
    setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
  };

  const updateBusiness = async (businessId: string, data: Partial<Business>) => {
    const db = await getFirebaseDb();
    await updateDoc(doc(db, "businesses", businessId), {
      ...data,
      updatedAt: new Date(),
    });
    setBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, ...data } : b))
    );
  };

  return { businesses, loading, error, deleteBusiness, updateBusiness, refetch: fetchBusinesses };
};
