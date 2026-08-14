import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

export const BusinessReviewsList = ({ businessIds }: { businessIds: string[] }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchReviews = async () => {
      if (!businessIds || businessIds.length === 0) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("business_reviews")
          .select("*, businesses(name), users!user_id(display_name, raw_user_meta_data)")
          .in("business_id", businessIds)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data && mounted) {
          setReviews(data);
        }
      } catch (err) {
        console.error("Error fetching business reviews:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReviews();
    return () => { mounted = false; };
  }, [businessIds]);

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        {[1, 2].map(i => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse space-y-3">
            <div className="h-5 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-bold text-foreground mb-6">Reviews on Your Businesses</h2>
      <div className="space-y-4">
        {reviews.map(review => {
          const userName = review.users?.raw_user_meta_data?.displayName || review.users?.display_name || "Anonymous";
          return (
            <div key={review.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{userName}</span>
                    <span className="text-muted-foreground text-sm">reviewed</span>
                    <Link 
                      to={`/business/${review.business_id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {review.businesses?.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-accent text-accent" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${review.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {review.status}
                    </span>
                  </div>
                </div>
              </div>
              <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
              <p className="text-muted-foreground">{review.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
