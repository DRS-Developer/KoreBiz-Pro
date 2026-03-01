import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const ProtectedRoute: React.FC = () => {
  const { session, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold text-blue-900">Carregando...</div>
      </div>
    );
  }

  return session ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;