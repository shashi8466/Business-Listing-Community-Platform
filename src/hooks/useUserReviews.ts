import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Review } from "@/types";

interface ReviewWithBusiness extends Review {
  businessName: string;
}

export const useUserReviews = (userId: string | undefined) => {
  const [reviews, setReviews] = useState<ReviewWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchReviews = async () => {
      if (!userId) {
        if (mounted) {
          setReviews([]);
          setLoading(false);
        }
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch reviews with joined business data
        const { data, error: fetchError } = await supabase
          .from("business_reviews")
          .select("*, businesses(name)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        
        if (fetchError) throw fetchError;
        
        if (data && mounted) {
          const reviewsWithBusiness = data.map((reviewDoc: any) => {
            return {
              id: reviewDoc.id,
              businessId: reviewDoc.business_id,
              userId: reviewDoc.user_id,
              userName: "", // Will be filled contextually if needed
              rating: reviewDoc.rating,
              title: reviewDoc.title || "",
              content: reviewDoc.content || "",
              helpful: reviewDoc.helpful_count || 0,
              businessName: reviewDoc.businesses?.name || "Unknown Business",
              createdAt: new Date(reviewDoc.created_at),
              updatedAt: new Date(reviewDoc.updated_at)
            } as ReviewWithBusiness;
          });
          
          setReviews(reviewsWithBusiness);
          setError(null);
        }
      } catch (err: any) {
        console.error("Error fetching user reviews:", err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const deleteReview = async (reviewId: string, businessId: string) => {
    try {
      const { error } = await supabase
        .from("business_reviews")
        .delete()
        .eq("id", reviewId);
        
      if (error) throw error;
      
      // Local state update
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
      throw err;
    }
  };

  return { reviews, loading, error, deleteReview };
};
