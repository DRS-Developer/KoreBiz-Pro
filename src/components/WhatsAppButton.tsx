
import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { trackEvent } from './AnalyticsProvider';

const WhatsAppButton: React.FC = () => {
  const { whatsappLink } = useSiteSettings();
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Se não estiver montado, não renderiza nada para evitar hydration mismatch
  if (!mounted) return null;

  const showButton = !!whatsappLink;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out transform ${
        showButton ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={whatsappLink || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('WhatsApp', 'Click Floating Button', 'Global')}
        className="group relative flex items-center justify-center bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 transition-colors duration-300"
        aria-label="Fale conosco no WhatsApp"
      >
        <MessageCircle size={32} />
        
        {/* Tooltip / Label */}
        <span className={`absolute right-full mr-3 bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium shadow-md whitespace-nowrap transition-opacity duration-300 ${
          isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          Fale Conosco
        </span>
      </a>
    </div>
  );
};

export default WhatsAppButton;
