import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs, QueryConstraint } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Business } from "@/types";

interface UseBusinessesOptions {
  category?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  featured?: boolean;
  searchQuery?: string;
  limitCount?: number;
  ownerId?: string;
}

// Sample data as fallback when Firestore is empty
const sampleBusinesses: Business[] = [
  {
    id: "1",
    ownerId: "owner1",
    name: "Spice Symphony",
    slug: "spice-symphony",
    description: "Authentic North Indian cuisine with a modern twist. Family-owned restaurant serving the community for over 15 years.",
    category: "restaurants",
    address: { street: "123 Main St", city: "New York", state: "NY", zipCode: "10001" },
    phone: "(212) 555-0123",
    email: "info@spicesymphony.com",
    website: "https://spicesymphony.com",
    images: ["https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop"],
    rating: 4.8,
    reviewCount: 245,
    featured: true,
    verified: true,
    approved: true,
    active: true,
    services: ["Dine-in", "Takeout", "Catering"],
    hours: { monday: { open: "11:00", close: "22:00" } },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    ownerId: "owner2",
    name: "Sharma Real Estate Group",
    slug: "sharma-real-estate",
    description: "Full-service real estate agency specializing in residential and commercial properties.",
    category: "real-estate",
    address: { street: "456 Oak Ave", city: "Los Angeles", state: "CA", zipCode: "90001" },
    phone: "(310) 555-0456",
    email: "info@sharmarealty.com",
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"],
    rating: 4.9,
    reviewCount: 182,
    featured: true,
    verified: true,
    approved: true,
    active: true,
    services: ["Buying", "Selling", "Property Management"],
    hours: { monday: { open: "09:00", close: "18:00" } },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    ownerId: "owner3",
    name: "Vedic Tutors Academy",
    slug: "vedic-tutors",
    description: "Expert tutoring in Math, Science, and SAT/ACT prep.",
    category: "tutors",
    address: { street: "789 Elm St", city: "Houston", state: "TX", zipCode: "77001" },
    phone: "(713) 555-0789",
    email: "info@vedictutors.com",
    images: ["https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop"],
    rating: 4.7,
    reviewCount: 156,
    featured: false,
    verified: true,
    approved: true,
    active: true,
    services: ["Math", "Science", "SAT Prep"],
    hours: { monday: { open: "15:00", close: "21:00" } },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "4",
    ownerId: "owner4",
    name: "Patel Immigration Law",
    slug: "patel-immigration-law",
    description: "Experienced immigration attorneys helping families navigate visa and citizenship.",
    category: "legal",
    address: { street: "321 Pine St", city: "San Francisco", state: "CA", zipCode: "94102" },
    phone: "(415) 555-0321",
    email: "info@patelimmigration.com",
    images: ["https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop"],
    rating: 4.9,
    reviewCount: 198,
    featured: true,
    verified: true,
    approved: true,
    active: true,
    services: ["H1B Visa", "Green Card", "Citizenship"],
    hours: { monday: { open: "09:00", close: "17:00" } },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "5",
    ownerId: "owner5",
    name: "Chennai Kitchen",
    slug: "chennai-kitchen",
    description: "Authentic South Indian vegetarian cuisine.",
    category: "restaurants",
    address: { street: "567 Market St", city: "Chicago", state: "IL", zipCode: "60601" },
    phone: "(312) 555-0567",
    email: "info@chennaikitchen.com",
    images: ["https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop"],
    rating: 4.6,
    reviewCount: 312,
    featured: false,
    verified: true,
    approved: true,
    active: true,
    services: ["Dine-in", "Takeout", "Delivery"],
    hours: { monday: { open: "10:00", close: "21:00" } },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "6",
    ownerId: "owner6",
    name: "Wellness Ayurveda Center",
    slug: "wellness-ayurveda",
    description: "Traditional Ayurvedic treatments and wellness consultations.",
    category: "health",
    address: { street: "890 Wellness Blvd", city: "Dallas", state: "TX", zipCode: "75201" },
    phone: "(214) 555-0890",
    email: "info@wellnessayurveda.com",
    images: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop"],
    rating: 4.8,
    reviewCount: 89,
    featured: true,
    verified: true,
    approved: true,
    active: true,
    services: ["Massage", "Panchakarma", "Yoga"],
    hours: { monday: { open: "09:00", close: "19:00" } },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

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
        
        // Only show approved and active businesses (unless fetching own)
        if (!options.ownerId) {
          constraints.push(where("approved", "==", true));
          constraints.push(where("active", "==", true));
        }
        
        if (options.ownerId) {
          constraints.push(where("ownerId", "==", options.ownerId));
        }
        
        if (options.category) {
          constraints.push(where("category", "==", options.category));
        }
        
        if (options.city) {
          constraints.push(where("address.city", "==", options.city));
        }
        
        if (options.featured) {
          constraints.push(where("featured", "==", true));
        }
        
        if (options.limitCount) {
          constraints.push(limit(options.limitCount));
        }
        
        const q = query(collection(db, "businesses"), ...constraints);
        const querySnapshot = await getDocs(q);
        
        let results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
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
        
        // Use sample data if Firestore is empty
        if (results.length === 0 && !options.ownerId) {
          let sampleResults = [...sampleBusinesses];
          
          if (options.category) {
            sampleResults = sampleResults.filter(b => b.category === options.category);
          }
          if (options.city) {
            sampleResults = sampleResults.filter(b => b.address.city === options.city);
          }
          if (options.featured) {
            sampleResults = sampleResults.filter(b => b.featured);
          }
          if (options.searchQuery) {
            const searchLower = options.searchQuery.toLowerCase();
            sampleResults = sampleResults.filter(b => 
              b.name.toLowerCase().includes(searchLower) ||
              b.description.toLowerCase().includes(searchLower)
            );
          }
          if (options.limitCount) {
            sampleResults = sampleResults.slice(0, options.limitCount);
          }
          
          results = sampleResults;
        }
        
        // Sort by rating
        results.sort((a, b) => b.rating - a.rating);
        
        setBusinesses(results);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching businesses:", err);
        setError(err.message);
        // Fallback to sample data on error
        setBusinesses(sampleBusinesses);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [options.category, options.city, options.featured, options.searchQuery, options.limitCount, options.ownerId]);

  return { businesses, loading, error };
};
