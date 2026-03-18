import React from 'react';
import { Quote } from 'lucide-react';
import OptimizedImage from '../../../OptimizedImage';

interface TestimonialItem {
  name: string;
  role?: string;
  quote: string;
  avatarUrl?: string;
}

interface TestimonialsDefaultProps {
  title?: string;
  description?: string;
  maxItems?: number;
  items?: TestimonialItem[];
}

const DEFAULT_ITEMS: TestimonialItem[] = [
  {
    name: 'Cliente Exemplo',
    role: 'Diretoria',
    quote: 'Equipe técnica muito eficiente e atendimento consultivo em todas as etapas.',
  },
  {
    name: 'Gestor Operacional',
    role: 'Operações',
    quote: 'Projeto entregue dentro do prazo com excelente acompanhamento.',
  },
];

const TestimonialsDefault: React.FC<TestimonialsDefaultProps> = ({
  title = 'Depoimentos',
  description = 'Resultados reais de clientes que confiaram no nosso trabalho.',
  maxItems = 6,
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS).slice(0, Math.max(1, Number(maxItems || 6)));

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((item, index) => (
            <article key={`${item.name}-${index}`} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {item.avatarUrl ? (
                    <OptimizedImage
                      src={item.avatarUrl}
                      alt={item.name}
                      pageKey="home"
                      role="card"
                      className="w-full h-full object-cover"
                      effect=""
                      priority={index < 3}
                    />
                  ) : (
                    <Quote size={18} className="text-blue-700" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.role ? <p className="text-sm text-gray-500">{item.role}</p> : null}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">“{item.quote}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsDefault;
