import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { clsx } from 'clsx';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import OptimizedImage from '../OptimizedImage';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { settings, loading, displayPhone } = useSiteSettings();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Empresa', href: '/empresa' },
    { name: 'Áreas de Atuação', href: '/areas-de-atuacao' },
    { name: 'Serviços', href: '/servicos' },
    { name: 'Portfólio', href: '/portfolio' },
    { name: 'Parceiros', href: '/parceiros' },
    { name: 'Contato', href: '/contato' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-blue-900 text-white py-2 text-sm hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <Phone size={16} />
              <span>{loading ? 'Carregando...' : displayPhone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={16} />
              <span>{settings?.contact_email || (loading ? 'Carregando...' : 'contato@arsinstalacoes.com.br')}</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link to="/admin/login" className="hover:text-blue-200 transition-colors">Área Restrita</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {settings?.logo_url ? (
              <div className="h-10 w-auto relative">
                 <OptimizedImage src={settings.logo_url} alt={settings.site_name} className="h-full w-auto" />
              </div>
            ) : (
              <span className="text-2xl font-bold text-blue-900">{settings?.site_name || 'ArsInstalações'}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'text-sm font-medium transition-colors hover:text-blue-600',
                  isActive(item.href) ? 'text-blue-600' : 'text-gray-700'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-blue-600"
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
            {navigation.map((item) => (
              <Link
                key={item.name}
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
