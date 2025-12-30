import { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Business } from "@/types";

export const useAdminBusinesses = () => {
  const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      const db = await getFirebaseDb();

      // Fetch pending (not approved) businesses
      const pendingQuery = query(
        collection(db, "businesses"),
        where("approved", "==", false),
        orderBy("createdAt", "desc")
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingResults = pendingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as Business[];

      // Fetch all businesses for management
      const allQuery = query(
        collection(db, "businesses"),
        orderBy("createdAt", "desc")
      );
      const allSnapshot = await getDocs(allQuery);
      const allResults = allSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as Business[];

      setPendingBusinesses(pendingResults);
      setAllBusinesses(allResults);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching admin businesses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const approveBusiness = async (businessId: string) => {
    const db = await getFirebaseDb();
    await updateDoc(doc(db, "businesses", businessId), {
      approved: true,
      updatedAt: new Date(),
    });
    setPendingBusinesses((prev) => prev.filter((b) => b.id !== businessId));
    setAllBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, approved: true } : b))
    );
  };

  const rejectBusiness = async (businessId: string) => {
    const db = await getFirebaseDb();
    await deleteDoc(doc(db, "businesses", businessId));
    setPendingBusinesses((prev) => prev.filter((b) => b.id !== businessId));
    setAllBusinesses((prev) => prev.filter((b) => b.id !== businessId));
  };

  const toggleActive = async (businessId: string, active: boolean) => {
    const db = await getFirebaseDb();
    await updateDoc(doc(db, "businesses", businessId), {
      active,
      updatedAt: new Date(),
    });
    setAllBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, active } : b))
    );
  };

  return {
    pendingBusinesses,
    allBusinesses,
    loading,
    error,
    approveBusiness,
    rejectBusiness,
    toggleActive,
    refetch: fetchBusinesses,
  };
};
