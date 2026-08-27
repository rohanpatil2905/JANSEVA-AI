import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../common/LoadingState';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, token, loading, isCitizen, isOfficer } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Verifying authentication session..." minHeight="80vh" />;
  }

  if (!token || !user) {
    const isOfficerRoute = location.pathname.startsWith('/officer');
    const redirectPath = isOfficerRoute ? '/officer/login' : '/citizen/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (requiredRole === 'citizen' && !isCitizen) {
    return <Navigate to="/officer/dashboard" replace />;
  }

  if (requiredRole === 'officer' && !isOfficer) {
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return children;
}
