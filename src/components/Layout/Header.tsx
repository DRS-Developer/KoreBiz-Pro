import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { clsx } from 'clsx';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useSystemModules } from '../../hooks/useSystemModules';
import OptimizedImage from '../OptimizedImage';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { settings, loading, displayPhone, displayEmail } = useSiteSettings();
  const { modules } = useSystemModules();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const moduleRouteMap: Record<string, { name: string; href: string }> = {
    areas_atuacao: { name: 'Áreas de Atuação', href: '/areas-de-atuacao' },
    parceiros: { name: 'Parceiros', href: '/parceiros' },
    servicos: { name: 'Serviços', href: '/servicos' },
    portfolio: { name: 'Portfólio', href: '/portfolio' },
    paginas: { name: 'Empresa', href: '/empresa' },
  };

  const configurableNavigation = useMemo(() => {
    const fallbackOrder = ['areas_atuacao', 'parceiros', 'servicos', 'portfolio', 'paginas'];
    const source = modules.length > 0
      ? modules
      : fallbackOrder.map((key, index) => ({
          id: key,
          key,
          name: moduleRouteMap[key].name,
          is_active: true,
          is_sort_enabled: true,
          order_position: index + 1,
          updated_at: '',
          updated_by: null,
          visibilidade_personalizada: true,
        }));

    return source
      .map((module) => {
        const route = moduleRouteMap[module.key];
        if (!route) {
          return null;
        }
        const isSidebarVisible = module.visibilidade_personalizada ?? true;
        return {
          name: module.name || route.name,
          href: route.href,
          visible: module.is_active && isSidebarVisible,
        };
      })
      .filter((item): item is { name: string; href: string; visible: boolean } => item !== null);
  }, [modules]);

  const navigation = [
    { name: 'Home', href: '/', visible: true },
    ...configurableNavigation,
    { name: 'Contato', href: '/contato', visible: true },
  ];

  const visibleNavigation = navigation.filter(item => item.visible);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const layoutSettings = settings?.layout_settings as any;
  const showTopBar = layoutSettings?.topbar_enabled;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      {showTopBar && (
        <div className="bg-blue-900 text-white py-2 text-sm hidden md:block">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>{loading ? 'Carregando...' : displayPhone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>{displayEmail || (loading ? 'Carregando...' : 'contato@korebiz-pro.com.br')}</span>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link to="/admin/login" className="">Área Restrita</Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {settings?.logo_url ? (
              <div className="h-10 w-auto relative">
                 <OptimizedImage 
                   src={settings.logo_url} 
                   alt={settings.site_name} 
                   pageKey="home"
                   role="logo"
                   className="h-full w-auto" 
                   priority={true}
                 />
              </div>
            ) : (
              <span className="text-2xl font-bold text-blue-900">{settings?.site_name || 'KoreBiz-Pro'}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {visibleNavigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={clsx(
                  'text-sm font-medium',
                  isActive(item.href) ? 'text-blue-600' : 'text-gray-700'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {visibleNavigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={clsx(
                  'text-base font-medium py-2 border-b border-gray-100 last:border-0',
                  isActive(item.href) ? 'text-blue-600' : 'text-gray-700'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
