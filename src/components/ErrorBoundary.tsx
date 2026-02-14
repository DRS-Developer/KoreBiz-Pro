import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorBoundary: React.FC = () => {
  const error = useRouteError();
  console.error(error);

  const handleReload = () => {
    // Clear cache that might be holding onto old chunk references
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    window.location.reload();
  };

  let errorMessage = "Ocorreu um erro inesperado.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      errorMessage = "Página não encontrada.";
    } else {
      errorMessage = error.statusText;
    }
  } else if (error instanceof Error) {
    // Handle chunk load errors specially
    if (error.message.includes('Failed to fetch dynamically imported module') || 
        error.message.includes('Importing a module script failed')) {
      errorMessage = "Uma nova versão do site está disponível. Por favor, recarregue a página.";
    } else {
      errorMessage = error.message;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h1>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        
        <button
          onClick={handleReload}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full"
        >
          <RefreshCw className="mr-2" size={20} />
          Recarregar Página
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundary;
