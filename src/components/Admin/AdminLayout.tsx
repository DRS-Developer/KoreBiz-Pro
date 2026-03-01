import React, { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  LayoutDashboard, 
  FileText, 
  Image, 
  Settings, 
  LogOut, 
  Users, 
  MessageSquare, 
  Menu, 
  X, 
  Wrench, 
  Briefcase, 
  RefreshCw,
  Home,
  LayoutTemplate,
  Handshake,
  EyeOff,
  Activity
} from 'lucide-react';
import { clsx } from 'clsx';
import HealthStatus from './HealthStatus';
import { useSystemModules } from '../../hooks/useSystemModules';
import VisibilityControlModal from './VisibilityControlModal';

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Home', href: '/admin/home', icon: <Home size={20} /> },
  { name: 'Diagnóstico', href: '/admin/system-health', icon: <Activity size={20} /> },
  { name: 'Áreas de Atuação', href: '/admin/areas-atuacao', icon: <LayoutTemplate size={20} /> },
  { name: 'Parceiros', href: '/admin/parceiros', icon: <Handshake size={20} /> },
  { name: 'Serviços', href: '/admin/services', icon: <Wrench size={20} /> },
  { name: 'Portfólio', href: '/admin/portfolio', icon: <Briefcase size={20} /> },
  { name: 'Páginas', href: '/admin/paginas', icon: <FileText size={20} /> },
  { name: 'Contatos', href: '/admin/contatos', icon: <MessageSquare size={20} /> },
  { name: 'Mídia', href: '/admin/midia', icon: <Image size={20} /> },
  { name: 'Usuários', href: '/admin/usuarios', icon: <Users size={20} /> },
  { name: 'Configurações', href: '/admin/configuracoes', icon: <Settings size={20} /> },
];

const MODULE_KEYS: Record<string, string> = {
  '/admin/areas-atuacao': 'areas_atuacao',
  '/admin/services': 'servicos',
  '/admin/parceiros': 'parceiros',
  '/admin/portfolio': 'portfolio',
  '/admin/paginas': 'paginas',
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [editingModule, setEditingModule] = useState<{key: string, name: string} | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { getModuleStatus } = useSystemModules();
  
  // Calculate visibility based on cached data if available, or wait
  // However, for admin panel we don't want to hide menus aggressively.
  // We just want to show the correct state.
  // If modules are loading, we might show default state.


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    // Reload the page to force a full re-sync and fresh data fetch
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Visibility Control Modal */}
      {editingModule && (
        <VisibilityControlModal
          isOpen={!!editingModule}
          onClose={() => setEditingModule(null)}
          moduleKey={editingModule.key}
          moduleName={editingModule.name}
        />
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed md:static inset-y-0 left-0 z-30 w-64 bg-blue-900 text-white transform md:translate-x-0 flex flex-col h-full overflow-y-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-blue-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">KoreBiz Admin</h2>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const moduleKey = MODULE_KEYS[item.href];
            const isVisible = moduleKey ? getModuleStatus(moduleKey) : true;
            const isActive = location.pathname.startsWith(item.href);
            
            return (
              <div key={item.href} className="relative group">
                <Link
                  to={item.href}
                  className={clsx(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative overflow-hidden",
                    isActive 
                      ? "bg-blue-800 text-white" 
                      : "text-blue-200 hover:bg-blue-800/50",
                    !isVisible && "bg-gray-700/50 text-gray-400 opacity-80"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                  title={!isVisible ? "Página desabilitada no frontend" : ""}
                >
                  {item.icon}
                  <span className={clsx(!isVisible && "line-through decoration-gray-500")}>
                    {item.name}
                  </span>
                  
                  {!isVisible && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                       <EyeOff size={14} className="text-gray-400" />
                    </div>
                  )}
                </Link>

                {/* Settings Gear Icon */}
                {moduleKey && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingModule({ key: moduleKey, name: item.name });
                    }}
                    className={clsx(
                      "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all duration-200",
                      "opacity-0 group-hover:opacity-100 focus:opacity-100",
                      "text-blue-200 hover:text-white hover:bg-blue-700",
                      // Always show on mobile if disabled or just to allow access? 
                      // Maybe keep it simple: show on hover on desktop, always show if group focused?
                      // For simplicity, sticking to hover logic but adding better touch support might be needed.
                      // Adding a dedicated class for touch devices isn't straightforward without media queries.
                    )}
                    aria-label={`Configurar visibilidade de ${item.name}`}
                  >
                    <Settings size={16} />
                  </button>
                )}
              </div>
            );
          })}
          
          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className={clsx(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-200 mt-4",
              isRefreshing && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw size={20} />
            <span>Sincronizar Dados</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-300 mt-8"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>
        
        <HealthStatus />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-800">Painel Administrativo</span>
          <div className="w-6"></div> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;