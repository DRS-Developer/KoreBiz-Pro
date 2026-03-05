import React, { ReactNode, useEffect, useMemo, useState } from 'react';
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
  GripVertical,
  MoreVertical
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import HealthStatus from './HealthStatus';
import { useSystemModules } from '../../hooks/useSystemModules';
import VisibilityControlModal from './VisibilityControlModal';
import { toast } from 'sonner';
import OrderingStatusLabel, { OrderingPhase } from './OrderingStatusLabel';

const ORDERING_PROCESSING_MIN_MS = 1000;
const ORDERING_RESULT_MS = 1500;

interface AdminLayoutProps {
  children: ReactNode;
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

type ConfigurableNavItem = NavItem & {
  moduleKey: string;
  isVisible: boolean;
  isSortEnabled: boolean;
};

const FIXED_TOP_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Home', href: '/admin/home', icon: <Home size={20} /> },
];

const CONFIGURABLE_NAV_ITEMS: Record<string, NavItem> = {
  areas_atuacao: { name: 'Áreas de Atuação', href: '/admin/areas-atuacao', icon: <LayoutTemplate size={20} /> },
  parceiros: { name: 'Parceiros', href: '/admin/parceiros', icon: <Handshake size={20} /> },
  servicos: { name: 'Serviços', href: '/admin/services', icon: <Wrench size={20} /> },
  portfolio: { name: 'Portfólio', href: '/admin/portfolio', icon: <Briefcase size={20} /> },
  paginas: { name: 'Páginas', href: '/admin/paginas', icon: <FileText size={20} /> },
};

const FIXED_BOTTOM_ITEMS: NavItem[] = [
  { name: 'Contatos', href: '/admin/contatos', icon: <MessageSquare size={20} /> },
  { name: 'Mídia', href: '/admin/midia', icon: <Image size={20} /> },
  { name: 'Usuários', href: '/admin/usuarios', icon: <Users size={20} /> },
  { name: 'Configurações', href: '/admin/configuracoes', icon: <Settings size={20} /> },
];

interface SortableSidebarItemProps {
  item: ConfigurableNavItem;
  isActive: boolean;
  onNavigate: () => void;
  onOpenSettings: (moduleKey: string, moduleName: string) => void;
}

const SortableSidebarItem: React.FC<SortableSidebarItemProps> = ({
  item,
  isActive,
  onNavigate,
  onOpenSettings
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.moduleKey,
    disabled: !item.isSortEnabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {item.isSortEnabled && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 text-blue-300 hover:text-white cursor-grab active:cursor-grabbing touch-none"
          aria-label={`Reordenar ${item.name}`}
        >
          <GripVertical size={16} />
        </button>
      )}
      <Link
        to={item.href}
        className={clsx(
          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative overflow-hidden",
          item.isSortEnabled && "pl-9",
          isActive
            ? "bg-blue-800 text-white"
            : "text-blue-200 hover:bg-blue-800/50",
          !item.isVisible && "bg-gray-700/50 text-gray-400 opacity-80"
        )}
        onClick={onNavigate}
        title={!item.isVisible ? "Página desabilitada no frontend" : ""}
      >
        {item.icon}
        <span className={clsx(!item.isVisible && "line-through decoration-gray-500")}>
          {item.name}
        </span>
        {!item.isVisible && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <EyeOff size={14} className="text-gray-400" />
          </div>
        )}
      </Link>
      <button
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onOpenSettings(item.moduleKey, item.name);
        }}
        className={clsx(
          "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-5 flex items-center justify-center rounded-[4px] transition-all duration-200",
          "opacity-0 group-hover:opacity-100 focus:opacity-100",
          "text-blue-200 hover:text-white hover:bg-blue-700"
        )}
        aria-label={`Configurar ${item.name}`}
      >
        <MoreVertical size={16} />
      </button>
    </div>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [editingModule, setEditingModule] = useState<{key: string, name: string} | null>(null);
  const [orderingPhase, setOrderingPhase] = useState<OrderingPhase>('idle');
  const [isUpdatingSortGroup, setIsUpdatingSortGroup] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { modules, reorderModules, updateAllSortEnabled } = useSystemModules();
  const isOrdering = orderingPhase === 'processing';
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const configurableNavItems = useMemo<ConfigurableNavItem[]>(() => {
    const fallbackOrder = ['areas_atuacao', 'parceiros', 'servicos', 'portfolio', 'paginas'];
    const orderedModules = modules.length > 0
      ? [...modules]
      : fallbackOrder.map((key, index) => ({
          id: key,
          key,
          name: CONFIGURABLE_NAV_ITEMS[key].name,
          is_active: true,
          is_sort_enabled: false,
          order_position: index + 1,
          updated_at: '',
          updated_by: null,
        }));

    return orderedModules
      .map((module) => {
        const navItem = CONFIGURABLE_NAV_ITEMS[module.key];
        if (!navItem) {
          return null;
        }
        return {
          ...navItem,
          moduleKey: module.key,
          isVisible: module.is_active,
          isSortEnabled: module.is_sort_enabled,
        };
      })
      .filter((item): item is ConfigurableNavItem => item !== null);
  }, [modules]);

  const configurableKeys = useMemo(
    () => configurableNavItems.map((item) => item.moduleKey),
    [configurableNavItems]
  );

  const allSortingEnabled = useMemo(
    () => configurableNavItems.length > 0 && configurableNavItems.every((item) => item.isSortEnabled),
    [configurableNavItems]
  );

  const nonConfigurableKeys = useMemo(
    () => modules
      .map((module) => module.key)
      .filter((key) => !configurableKeys.includes(key)),
    [configurableKeys, modules]
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    // Reload the page to force a full re-sync and fresh data fetch
    window.location.reload();
  };

  useEffect(() => {
    if (orderingPhase !== 'success' && orderingPhase !== 'error') {
      return;
    }

    const timeout = window.setTimeout(() => {
      setOrderingPhase('idle');
    }, ORDERING_RESULT_MS);

    return () => window.clearTimeout(timeout);
  }, [orderingPhase]);

  const handleDragEnd = async (event: DragEndEvent) => {
    if (isOrdering) {
      return;
    }

    const { active, over } = event;
    if (!active.id || !over?.id || active.id === over.id) {
      return;
    }

    const activeItem = configurableNavItems.find((item) => item.moduleKey === active.id);
    const overItem = configurableNavItems.find((item) => item.moduleKey === over.id);

    if (!activeItem || !overItem) {
      return;
    }

    if (!activeItem.isSortEnabled) {
      toast.error('Ative o modo de ordenação para mover este botão');
      return;
    }

    const oldIndex = configurableKeys.indexOf(String(active.id));
    const newIndex = configurableKeys.indexOf(String(over.id));

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    setOrderingPhase('processing');
    const startedAt = Date.now();
    try {
      const reorderedConfigurable = arrayMove(configurableKeys, oldIndex, newIndex);
      const payloadKeys = [...reorderedConfigurable, ...nonConfigurableKeys];
      await reorderModules(payloadKeys);
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, ORDERING_PROCESSING_MIN_MS - elapsed);
      if (remaining > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remaining));
      }
      setOrderingPhase('success');
    } catch {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, ORDERING_PROCESSING_MIN_MS - elapsed);
      if (remaining > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remaining));
      }
      setOrderingPhase('error');
    }
  };

  const handleToggleSortGroup = async (enabled: boolean) => {
    if (isUpdatingSortGroup || isOrdering) {
      return;
    }
    setIsUpdatingSortGroup(true);
    try {
      await updateAllSortEnabled(enabled);
    } finally {
      setIsUpdatingSortGroup(false);
    }
  };

  const renderFixedItem = (item: NavItem) => {
    const isActive = location.pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        to={item.href}
        className={clsx(
          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative overflow-hidden",
          isActive
            ? "bg-blue-800 text-white"
            : "text-blue-200 hover:bg-blue-800/50"
        )}
        onClick={() => setIsSidebarOpen(false)}
      >
        {item.icon}
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {editingModule && (
        <VisibilityControlModal
          isOpen={!!editingModule}
          onClose={() => setEditingModule(null)}
          moduleKey={editingModule.key}
          moduleName={editingModule.name}
        />
      )}

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside className={clsx(
        "fixed md:static inset-y-0 left-0 z-30 w-64 bg-blue-900 text-white transform md:translate-x-0 flex flex-col h-full overflow-y-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-blue-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">KoreBiz-Pro Admin</h2>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {FIXED_TOP_ITEMS.map(renderFixedItem)}

          <div className="pt-2">
            <OrderingStatusLabel
              phase={orderingPhase}
              allSortingEnabled={allSortingEnabled}
              onToggleAllSorting={handleToggleSortGroup}
              disabled={isUpdatingSortGroup}
            />
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={configurableKeys}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {configurableNavItems.map((item) => (
                    <SortableSidebarItem
                      key={item.moduleKey}
                      item={item}
                      isActive={location.pathname.startsWith(item.href)}
                      onNavigate={() => setIsSidebarOpen(false)}
                      onOpenSettings={(moduleKey, moduleName) =>
                        setEditingModule({ key: moduleKey, name: moduleName })
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {FIXED_BOTTOM_ITEMS.map(renderFixedItem)}
          
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

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-800">Painel Administrativo</span>
          <div className="w-6"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
