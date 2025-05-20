// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  // Not logged in — redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a role is required and user doesn’t have it — redirect or show “Not Authorized”
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized — render children
  return children;
}
