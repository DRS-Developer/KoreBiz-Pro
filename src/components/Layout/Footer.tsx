import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { trackEvent } from '../AnalyticsProvider';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { settings, displayPhone, displayAddress } = useSiteSettings();

  const socialLinks = (settings?.social_links as Record<string, string>) || {};

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{settings?.site_name || 'KoreBiz'}</h3>
            <p className="text-gray-400 mb-4">
              {settings?.site_description || 'Soluções inteligentes em instalações e manutenção.'}
            </p>
            
            <div className="flex flex-col space-y-2 mb-4">
              <Link to="/politica-privacidade" className="text-gray-400 text-sm">
                Política de Privacidade
              </Link>
              <Link to="/termos-uso" className="text-gray-400 text-sm">
                Termos de Uso
              </Link>
            </div>

            <div className="flex space-x-4">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400">
                  <Facebook size={20} />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400">
                  <Instagram size={20} />
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400">
                  <Linkedin size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400">Home</Link></li>
              <li><Link to="/areas-de-atuacao" className="text-gray-400">Áreas de Atuação</Link></li>
              <li><Link to="/servicos" className="text-gray-400">Serviços</Link></li>
              <li><Link to="/portfolio" className="text-gray-400">Portfólio</Link></li>
              <li><Link to="/parceiros" className="text-gray-400">Parceiros</Link></li>
              <li><Link to="/empresa" className="text-gray-400">Empresa</Link></li>
              <li><Link to="/contato" className="text-gray-400">Contato</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Serviços</h4>
            <ul className="space-y-2">
              <li><Link to="/areas-de-atuacao" className="text-gray-400">Instalações Elétricas</Link></li>
              <li><Link to="/areas-de-atuacao" className="text-gray-400">Manutenção Predial</Link></li>
              <li><Link to="/areas-de-atuacao" className="text-gray-400">Climatização</Link></li>
              <li><Link to="/areas-de-atuacao" className="text-gray-400">Automação</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                <span className="text-gray-400 whitespace-pre-line">{displayAddress}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="text-blue-500 flex-shrink-0" size={18} />
                <a 
                  href={`tel:${settings?.contact_phone?.replace(/\D/g, '')}`} 
                  onClick={() => trackEvent('Contact', 'Click Phone', 'Footer')}
                  className="text-gray-400"
                >
                  {displayPhone}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="text-blue-500 flex-shrink-0" size={18} />
                <a 
                  href={`mailto:${settings?.contact_email}`} 
                  onClick={() => trackEvent('Contact', 'Click Email', 'Footer')}
                  className="text-gray-400"
                >
                  {settings?.contact_email || 'contato@arsinstalacoes.com.br'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} {settings?.site_name || 'ArsInstalações'}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
