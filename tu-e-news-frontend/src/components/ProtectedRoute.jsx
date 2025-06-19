// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// roles: Optional array of roles that are allowed to access this route
//        If undefined or empty, just checks for authentication.
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation(); // To redirect back after login

  if (isLoading) {
    // Show a loading indicator while auth state is being determined
    return <div className="flex justify-center items-center min-h-screen">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    // User not logged in, redirect to login page
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if the user has one of the allowed roles
  if (roles && roles.length > 0 && (!user || !roles.includes(user.role))) {
    // User does not have the required role, redirect to an unauthorized page or homepage
    // For simplicity, redirecting to homepage. You might want an "Unauthorized" page.
    console.warn(`User role '${user?.role}' not authorized for this route. Allowed: ${roles.join(', ')}`);
    return <Navigate to="/" replace />;
    // Or: return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and (if roles specified) has the required role
  return children;
}

export default ProtectedRoute;