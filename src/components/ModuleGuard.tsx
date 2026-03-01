import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSystemModules } from '../hooks/useSystemModules';
import LoadingSpinner from './LoadingSpinner';

interface ModuleGuardProps {
  moduleKey: string;
  children: React.ReactNode;
}

const ModuleGuard: React.FC<ModuleGuardProps> = ({ moduleKey, children }) => {
  const { getModuleStatus, loading, modules } = useSystemModules();

  // If we have cached modules, we don't need to wait for loading
  // We only wait if we have NO data at all
  const hasData = modules.length > 0;
  
  if (loading && !hasData) {
    return <div className="flex justify-center items-center min-h-[50vh]"><LoadingSpinner /></div>;
  }

  const isVisible = getModuleStatus(moduleKey);

  if (!isVisible) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ModuleGuard;
