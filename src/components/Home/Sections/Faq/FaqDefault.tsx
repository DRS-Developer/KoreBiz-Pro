import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqDefaultProps {
  title?: string;
  description?: string;
  items?: FaqItem[];
}

const DEFAULT_ITEMS: FaqItem[] = [
  {
    question: 'Como funciona o atendimento inicial?',
    answer: 'Realizamos um diagnóstico inicial e apresentamos a melhor estratégia de execução para o seu contexto.',
  },
  {
    question: 'Quais prazos médios de entrega?',
    answer: 'Os prazos variam conforme escopo, mas sempre definimos cronograma e marcos de validação antes do início.',
  },
];

const FaqDefault: React.FC<FaqDefaultProps> = ({
  title = 'Perguntas Frequentes',
  description = 'Principais dúvidas sobre nossos processos, prazos e atendimento.',
  items,
}) => {
  const list = items && items.length > 0 ? items : DEFAULT_ITEMS;
  const [openIndex, setOpenIndex] = useState(0);

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
            <p className="text-lg text-gray-600">{description}</p>
          </div>

          <div className="space-y-3">
            {list.map((item, index) => {
              const open = openIndex === index;
              return (
                <article key={`${item.question}-${index}`} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    className="w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
                    onClick={() => setOpenIndex(open ? -1 : index)}
                  >
                    <span className="font-semibold text-gray-900">{item.question}</span>
                    <ChevronDown className={`text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`} size={18} />
                  </button>
                  {open ? <div className="px-5 py-4 text-gray-700 leading-relaxed">{item.answer}</div> : null}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqDefault;
