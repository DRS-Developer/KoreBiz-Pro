import React from 'react';

interface QuoteHighlightDefaultProps {
  quote?: string;
  author?: string;
  role?: string;
}

const QuoteHighlightDefault: React.FC<QuoteHighlightDefaultProps> = ({
  quote = 'A previsibilidade da execução foi decisiva para acelerar nossos resultados.',
  author = 'Cliente Exemplo',
  role = 'Diretoria Comercial',
}) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white p-8 md:p-10 text-center">
          <p className="text-2xl md:text-3xl font-semibold text-blue-900 leading-relaxed">“{quote}”</p>
          <p className="mt-6 text-lg font-medium text-gray-900">{author}</p>
          <p className="text-gray-600">{role}</p>
        </div>
      </div>
    </section>
  );
};

export default QuoteHighlightDefault;
