import React from 'react';

interface DualCtaBandDefaultProps {
  title?: string;
  description?: string;
  primaryText?: string;
  primaryLink?: string;
  secondaryText?: string;
  secondaryLink?: string;
}

const DualCtaBandDefault: React.FC<DualCtaBandDefaultProps> = ({
  title = 'Pronto para avançar com mais previsibilidade?',
  description = 'Fale com nosso time e entenda o melhor caminho para o seu cenário.',
  primaryText = 'Solicitar Diagnóstico',
  primaryLink = '/contato',
  secondaryText = 'Ver Serviços',
  secondaryLink = '/servicos',
}) => {
  return (
    <section className="py-12 bg-blue-900">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl bg-blue-800 border border-blue-700 p-8 md:p-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
          <p className="text-blue-100 text-lg mt-3 max-w-2xl mx-auto">{description}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {primaryText && primaryLink ? (
              <a href={primaryLink} className="px-5 py-2.5 rounded-lg bg-white text-blue-900 font-semibold hover:bg-blue-50">
                {primaryText}
              </a>
            ) : null}
            {secondaryText && secondaryLink ? (
              <a href={secondaryLink} className="px-5 py-2.5 rounded-lg border border-blue-200 text-white font-semibold hover:bg-blue-700">
                {secondaryText}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DualCtaBandDefault;
