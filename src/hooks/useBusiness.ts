import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, updateDoc, increment } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Business, Review } from "@/types";

export const useBusiness = (businessId: string) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!businessId) return;
      
      try {
        setLoading(true);
        const db = await getFirebaseDb();
        
        // Fetch business
        const businessDoc = await getDoc(doc(db, "businesses", businessId));
        if (businessDoc.exists()) {
          setBusiness({ id: businessDoc.id, ...businessDoc.data() } as Business);
        } else {
          setError("Business not found");
        }
        
        // Fetch reviews
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("businessId", "==", businessId),
          orderBy("createdAt", "desc")
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Review[];
        setReviews(reviewsData);
        
      } catch (err: any) {
        console.error("Error fetching business:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId]);

  const addReview = async (review: Omit<Review, 'id' | 'createdAt' | 'helpful'>) => {
    const db = await getFirebaseDb();
    
    const newReview = {
      ...review,
      createdAt: new Date(),
      helpful: 0
    };
    
    const docRef = await addDoc(collection(db, "reviews"), newReview);
    
    // Update business rating
    const allReviews = [...reviews, { ...newReview, id: docRef.id }];
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await updateDoc(doc(db, "businesses", businessId), {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: increment(1)
    });
    
    setReviews(prev => [{ ...newReview, id: docRef.id } as Review, ...prev]);
  };

  return { business, reviews, loading, error, addReview };
};
