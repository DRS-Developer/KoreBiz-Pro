import React from 'react';

interface StatBannerDefaultProps {
  value?: string;
  label?: string;
  supportingText?: string;
}

const StatBannerDefault: React.FC<StatBannerDefaultProps> = ({
  value = '+250%',
  label = 'Evolução média de previsibilidade operacional',
  supportingText = 'Resultado consolidado em projetos com metodologia aplicada de ponta a ponta.',
}) => {
  return (
    <section className="py-12 bg-blue-900">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto rounded-2xl bg-blue-800 border border-blue-700 p-8 md:p-10 text-center">
          <p className="text-5xl md:text-6xl font-bold text-white">{value}</p>
          <p className="text-xl md:text-2xl text-blue-100 mt-3">{label}</p>
          <p className="text-blue-200 mt-4">{supportingText}</p>
        </div>
      </div>
    </section>
  );
};

export default StatBannerDefault;
