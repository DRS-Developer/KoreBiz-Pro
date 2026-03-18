import React from 'react';
import OptimizedImage from '../../../OptimizedImage';

interface MediaSplitDefaultProps {
  title?: string;
  description?: string;
  bullets?: string[];
  imageUrl?: string;
  imageAlt?: string;
  reverse?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

const MediaSplitDefault: React.FC<MediaSplitDefaultProps> = ({
  title = 'Atendimento consultivo com foco em execução',
  description = 'Unimos estratégia, operação e acompanhamento para acelerar resultados consistentes.',
  bullets = ['Diagnóstico estruturado', 'Plano acionável', 'Monitoramento contínuo'],
  imageUrl = '/images/placeholder.png',
  imageAlt = 'Equipe em reunião',
  reverse = false,
  ctaText = 'Falar com especialista',
  ctaLink = '/contato',
}) => {
  const safeBullets = (Array.isArray(bullets) ? bullets : []).map((item) => String(item || '').trim()).filter(Boolean);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900">{title}</h2>
            <p className="text-lg text-gray-700">{description}</p>
            {safeBullets.length > 0 ? (
              <ul className="space-y-2 text-gray-700">
                {safeBullets.map((bullet, index) => (
                  <li key={`media-split-bullet-${index}`}>• {bullet}</li>
                ))}
              </ul>
            ) : null}
            {ctaText && ctaLink ? (
              <a href={ctaLink} className="inline-flex px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800">
                {ctaText}
              </a>
            ) : null}
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <OptimizedImage
              src={imageUrl}
              alt={imageAlt}
              pageKey="home"
              role="card"
              className="w-full h-[340px] object-cover"
              effect=""
              priority={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MediaSplitDefault;
