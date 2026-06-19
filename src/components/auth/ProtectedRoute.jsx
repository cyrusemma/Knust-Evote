import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ role }) {
  const { student, loading, isVoter, isCommissioner } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-navy font-body">Loading...</div>;
  }

  if (!student) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'voter' && !isVoter()) {
    return <Navigate to="/" replace />;
  }

  if (role === 'commissioner' && !isCommissioner()) {
    return <Navigate to="/vote" replace />;
  }

  return <Outlet />;
}
