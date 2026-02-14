import React, { ReactNode } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';
import HealthStatus from './HealthStatus';
import { useGlobalStore } from '../../stores/useGlobalStore';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Serviços', href: '/admin/services', icon: <Wrench size={20} /> },
  { name: 'Portfólio', href: '/admin/portfolio', icon: <Briefcase size={20} /> },
  { name: 'Páginas', href: '/admin/paginas', icon: <FileText size={20} /> },
  { name: 'Contatos', href: '/admin/contatos', icon: <MessageSquare size={20} /> },
  { name: 'Mídia', href: '/admin/midia', icon: <Image size={20} /> },
  { name: 'Usuários', href: '/admin/usuarios', icon: <Users size={20} /> },
  { name: 'Configurações', href: '/admin/configuracoes', icon: <Settings size={20} /> },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setHydrated } = useGlobalStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    // Desidrata a store para forçar o useRealtimeSync a fazer bootstrap novamente
    setHydrated(false);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Sincronizando dados...',
        success: () => {
          setIsRefreshing(false);
          return 'Dados atualizados com sucesso!';
        },
        error: 'Erro ao atualizar dados.',
      }
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed md:static inset-y-0 left-0 z-30 w-64 bg-blue-900 text-white transform transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col h-full overflow-y-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-blue-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Ars Admin</h2>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={clsx(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                location.pathname.startsWith(item.href) 
                  ? "bg-blue-800 text-white" 
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
          
          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className={clsx(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition-colors mt-4",
              isRefreshing && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw size={20} className={clsx(isRefreshing && "animate-spin")} />
            <span>Sincronizar Dados</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-300 hover:bg-blue-800 hover:text-red-200 transition-colors mt-8"
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

        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
