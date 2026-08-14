import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Wait for userProfile to load before checking roles
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Checking authentication...</div>
      </div>
    );
  }

  // If roles are specified and user's role is not in the allowed list
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    // If admin is trying to access user dashboard, send them to admin dashboard
    if (userProfile.role === 'admin' && location.pathname.startsWith('/dashboard')) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // If a regular user tries to access admin area, send them to user dashboard
    if (userProfile.role !== 'admin' && location.pathname.startsWith('/admin')) {
      return <Navigate to="/dashboard" replace />;
    }

    // Default fallback
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
