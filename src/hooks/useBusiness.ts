import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, updateDoc, increment, deleteDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Business, Review } from "@/types";

// Sample data as fallback
const sampleBusiness: Business = {
  id: "1",
  ownerId: "owner1",
  name: "Spice Symphony",
  slug: "spice-symphony",
  description: "Authentic North Indian cuisine with a modern twist. Family-owned restaurant serving the community for over 15 years. We take pride in using fresh ingredients and traditional recipes passed down through generations.",
  category: "restaurants",
  subcategory: "North Indian",
  address: { street: "123 Main Street", city: "New York", state: "NY", zipCode: "10001" },
  phone: "(212) 555-0123",
  email: "info@spicesymphony.com",
  website: "https://spicesymphony.com",
  images: [
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&h=600&fit=crop",
  ],
  rating: 4.8,
  reviewCount: 245,
  featured: true,
  verified: true,
  approved: true,
  active: true,
  services: ["Dine-in", "Takeout", "Catering", "Delivery", "Private Events"],
  hours: {
    monday: { open: "11:00 AM", close: "10:00 PM" },
    tuesday: { open: "11:00 AM", close: "10:00 PM" },
    wednesday: { open: "11:00 AM", close: "10:00 PM" },
    thursday: { open: "11:00 AM", close: "10:00 PM" },
    friday: { open: "11:00 AM", close: "11:00 PM" },
    saturday: { open: "11:00 AM", close: "11:00 PM" },
    sunday: { open: "12:00 PM", close: "9:00 PM" },
  },
  views: 1250,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleReviews: Review[] = [
  {
    id: "r1",
    businessId: "1",
    userId: "u1",
    userName: "Priya M.",
    rating: 5,
    title: "Best Indian food in the city!",
    content: "The butter chicken here is absolutely divine. The naan is fresh and fluffy. Staff is super friendly.",
    helpful: 24,
    createdAt: new Date("2024-12-15"),
  },
  {
    id: "r2",
    businessId: "1",
    userId: "u2",
    userName: "Raj K.",
    rating: 5,
    title: "Authentic taste, great ambiance",
    content: "Reminds me of home cooking. The biryani is perfectly spiced and the portions are generous.",
    helpful: 18,
    createdAt: new Date("2024-12-10"),
  },
];

export const useBusiness = (businessId: string | undefined) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusiness = useCallback(async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      const db = await getFirebaseDb();
      
      // Fetch business
      const businessDoc = await getDoc(doc(db, "businesses", businessId));
      if (businessDoc.exists()) {
        const data = businessDoc.data();
        setBusiness({ 
          id: businessDoc.id, 
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        } as Business);
        
        // Increment view count
        await updateDoc(doc(db, "businesses", businessId), {
          views: increment(1)
        }).catch(() => {}); // Ignore errors for view count
      } else {
        // Use sample data if not found
        if (businessId === "1" || businessId === "sample") {
          setBusiness(sampleBusiness);
        } else {
          setError("Business not found");
          setBusiness(sampleBusiness); // Fallback to sample
        }
      }
      
      // Fetch reviews
      try {
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("businessId", "==", businessId),
          orderBy("createdAt", "desc")
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        })) as Review[];
        
        setReviews(reviewsData.length > 0 ? reviewsData : sampleReviews);
      } catch {
        setReviews(sampleReviews);
      }
      
    } catch (err: any) {
      console.error("Error fetching business:", err);
      setError(err.message);
      setBusiness(sampleBusiness);
      setReviews(sampleReviews);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const addReview = async (review: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'updatedAt'>) => {
    if (!businessId) throw new Error("No business ID");
    
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
    
    return docRef.id;
  };

  const deleteReview = async (reviewId: string) => {
    if (!businessId) throw new Error("No business ID");
    
    const db = await getFirebaseDb();
    await deleteDoc(doc(db, "reviews", reviewId));
    
    const remainingReviews = reviews.filter(r => r.id !== reviewId);
    const avgRating = remainingReviews.length > 0 
      ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length 
      : 0;
    
    await updateDoc(doc(db, "businesses", businessId), {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: increment(-1)
    });
    
    setReviews(remainingReviews);
  };

  const replyToReview = async (reviewId: string, content: string) => {
    const db = await getFirebaseDb();
    
    await updateDoc(doc(db, "reviews", reviewId), {
      ownerReply: {
        content,
        createdAt: new Date()
      }
    });
    
    setReviews(prev => prev.map(r => 
      r.id === reviewId 
        ? { ...r, ownerReply: { content, createdAt: new Date() } }
        : r
    ));
  };

  return { business, reviews, loading, error, addReview, deleteReview, replyToReview, refetch: fetchBusiness };
};
