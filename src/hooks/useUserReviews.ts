import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Review } from "@/types";

interface ReviewWithBusiness extends Review {
  businessName: string;
}

export const useUserReviews = (userId: string | undefined) => {
  const [reviews, setReviews] = useState<ReviewWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) {
        setReviews([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const db = await getFirebaseDb();
        
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(reviewsQuery);
        
        const reviewsWithBusiness = await Promise.all(
          querySnapshot.docs.map(async (reviewDoc) => {
            const reviewData = reviewDoc.data();
            
            // Fetch business name
            let businessName = "Unknown Business";
            try {
              const businessDoc = await getDoc(doc(db, "businesses", reviewData.businessId));
              if (businessDoc.exists()) {
                businessName = businessDoc.data().name;
              }
            } catch {}
            
            return {
              id: reviewDoc.id,
              ...reviewData,
              businessName,
              createdAt: reviewData.createdAt?.toDate?.() || new Date()
            } as ReviewWithBusiness;
          })
        );
        
        setReviews(reviewsWithBusiness);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching user reviews:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  const deleteReview = async (reviewId: string, businessId: string) => {
    const db = await getFirebaseDb();
    
    // Delete the review
    await deleteDoc(doc(db, "reviews", reviewId));
    
    // Update business review count
    await updateDoc(doc(db, "businesses", businessId), {
      reviewCount: increment(-1)
    }).catch(() => {});
    
    // Update local state
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  return { reviews, loading, error, deleteReview };
};
