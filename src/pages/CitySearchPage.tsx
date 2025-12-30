import { useParams, Navigate } from "react-router-dom";
import { US_CITIES } from "@/types";

// This component redirects /{city}/search to /search?city={city}
const CitySearchPage = () => {
  const { city } = useParams<{ city: string }>();
  
  // Find the city in our list (case-insensitive)
  const matchedCity = US_CITIES.find(
    (c) => c.city.toLowerCase() === city?.toLowerCase()
  );

  if (!matchedCity) {
    // If city not found, redirect to general search
    return <Navigate to="/search" replace />;
  }

  // Redirect to search page with city parameter
  return <Navigate to={`/search?city=${encodeURIComponent(matchedCity.city)}`} replace />;
};

export default CitySearchPage;
