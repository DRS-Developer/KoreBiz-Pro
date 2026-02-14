import React, { useEffect, useState } from 'react';
import { Loader2, Database, CheckCircle2 } from 'lucide-react';
import { useGlobalStore } from '../stores/useGlobalStore';

interface AppLoaderProps {
  children: React.ReactNode;
}

const AppLoader: React.FC<AppLoaderProps> = ({ children }) => {
  // Initialize synchronously to avoid flash of loader on public routes
  const [isReady, setIsReady] = useState(() => !window.location.pathname.startsWith('/admin'));
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Inicializando sistema...');
  const { isHydrated } = useGlobalStore();

  useEffect(() => {
    // If already ready (public route), do nothing
    if (isReady) return;

    // Admin Loading Logic (Blocking)
    // Step 1: Initial State
    setStatus('Carregando recursos...');
    setProgress(30);

    // Safety Timeout
    const timeout = setTimeout(() => {
        if (!useGlobalStore.getState().isHydrated) {
            console.warn('Hydration timeout forced. Releasing app anyway.');
            setIsReady(true);
        }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isReady]); // Depend on isReady to avoid re-running if initially true

  // Watch for Hydration Complete (Only relevant for Admin)
  useEffect(() => {
    if (isReady) return; // Skip if public route

    if (isHydrated) {
        // Step 2: Hydration Complete
        setStatus('Sincronizando dados...');
        setProgress(60);
        
        // Finalize
        setTimeout(() => {
            setProgress(100);
            setStatus('Sistema pronto!');
            setTimeout(() => setIsReady(true), 500);
        }, 500);
    }
  }, [isHydrated, isReady]);

  if (isReady) return <>{children}</>;

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center z-[9999]">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="mb-6 flex justify-center relative">
          <div className="relative">
             <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
             <div className="relative bg-blue-600 text-white p-4 rounded-full">
                <Database size={32} />
             </div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">ArsInstalações Admin</h2>
        <p className="text-gray-500 text-sm mb-6">{status}</p>

        <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
           <span>Realtime Sync</span>
           <span>v2.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default AppLoader;
