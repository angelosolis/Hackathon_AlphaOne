import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: Array<'Client' | 'Agent'>; // Specify which roles can access
  children?: React.ReactNode; // Allow wrapping components directly
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, userType, token } = useAuth(); // Check token to handle initial load
  const location = useLocation();

  // Show loading indicator while auth state is being determined (token exists but userType might not be set yet)
  if (token && !userType) {
    return (
       <div className="min-h-screen flex items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after login.
    console.log("ProtectedRoute: Not authenticated, redirecting to login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user has one of the allowed roles
  if (allowedRoles && (!userType || !allowedRoles.includes(userType))) {
    // Redirect to a 'Not Authorized' page or home page
    // For now, redirecting to home
    console.warn(`ProtectedRoute: Access denied for role "${userType}" to route requiring roles: ${allowedRoles.join(', ')}. Redirecting to home.`);
    return <Navigate to="/" replace />;
  }

  // If roles match (or no specific roles required, just authenticated), render the child component
  // Use <Outlet /> if this is used as a layout route, or children if passed directly
  // console.log(`ProtectedRoute: Access granted. Role: ${userType}. Allowed: ${allowedRoles?.join(', ')}`);
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;