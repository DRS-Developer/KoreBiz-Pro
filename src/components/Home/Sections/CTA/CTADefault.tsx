import React from 'react';
import { Link } from 'react-router-dom';
import { useGlobalStore } from '../../../../stores/useGlobalStore';
import { useShallow } from 'zustand/react/shallow';

interface CTADefaultProps {
  title?: string;
  description?: string;
  primary_button_text?: string;
  primary_button_link?: string;
  secondary_button_text?: string;
  secondary_button_link?: string;
}

const isExternalLink = (url: string) => /^https?:\/\//i.test(url);

const CTAAction: React.FC<{ href: string; label: string; variant: 'primary' | 'secondary' }> = ({ href, label, variant }) => {
  const baseClass =
    variant === 'primary'
      ? 'inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm md:text-base font-semibold bg-white text-blue-700 hover:bg-blue-50 transition-colors'
      : 'inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm md:text-base font-semibold border border-white/70 text-white hover:bg-white/10 transition-colors';

  if (isExternalLink(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={baseClass}>
        {label}
      </a>
    );
  }

  return (
    <Link to={href} className={baseClass}>
      {label}
    </Link>
  );
};

const CTADefault: React.FC<CTADefaultProps> = (props) => {
  const { homeCta } = useGlobalStore(useShallow((state) => ({ homeCta: state.homeCta })));

  // Prioritize global store (homeCta) over widget props to ensure modal edits are reflected
  const title = homeCta?.title || props.title || 'Fale com nossa equipe';
  const description =
    homeCta?.description ||
    props.description ||
    'Estamos prontos para entender seu cenário e apresentar a melhor estratégia para seu caso.';
  const primaryText = homeCta?.primary_button_text || props.primary_button_text || 'Solicitar Atendimento';
  const primaryLink = homeCta?.primary_button_link || props.primary_button_link || '/contato';
  const secondaryText = homeCta?.secondary_button_text || props.secondary_button_text || 'Ver Serviços';
  const secondaryLink = homeCta?.secondary_button_link || props.secondary_button_link || '/servicos';

  return (
    <section className="py-12 bg-gradient-to-r from-blue-900 to-blue-700">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">{description}</p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            {primaryText && primaryLink && (
              <CTAAction href={primaryLink} label={primaryText} variant="primary" />
            )}
            {secondaryText && secondaryLink && (
              <CTAAction href={secondaryLink} label={secondaryText} variant="secondary" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTADefault;
