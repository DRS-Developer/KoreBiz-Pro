
import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { trackEvent } from './AnalyticsProvider';

const WhatsAppButton: React.FC = () => {
  const { whatsappLink } = useSiteSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Show button after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!whatsappLink) return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('WhatsApp', 'Click Floating Button', 'Global')}
        className="group relative flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Fale conosco no WhatsApp"
      >
        <MessageCircle size={32} />
        
        {/* Tooltip / Label */}
        <span className={`absolute right-full mr-3 bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium shadow-md whitespace-nowrap transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
        }`}>
          Fale Conosco
        </span>
        
        {/* Pulse Effect */}
        <span className="absolute -inset-2 bg-green-500 rounded-full opacity-20 animate-ping pointer-events-none"></span>
      </a>
    </div>
  );
};

export default WhatsAppButton;
