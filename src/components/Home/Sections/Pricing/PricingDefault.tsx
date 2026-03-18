import React from 'react';

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  features: string[];
  ctaText?: string;
  ctaLink?: string;
  highlighted?: boolean;
}

interface PricingDefaultProps {
  title?: string;
  description?: string;
  plans?: PricingPlan[];
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    name: 'Essencial',
    price: 'R$ 990',
    period: '/mês',
    features: ['Diagnóstico inicial', 'Suporte comercial', 'Acompanhamento mensal'],
    ctaText: 'Escolher Essencial',
    ctaLink: '/contato',
  },
  {
    name: 'Profissional',
    price: 'R$ 1.990',
    period: '/mês',
    features: ['Planejamento estratégico', 'Relatórios quinzenais', 'Canal prioritário'],
    ctaText: 'Escolher Profissional',
    ctaLink: '/contato',
    highlighted: true,
  },
];

const PricingDefault: React.FC<PricingDefaultProps> = ({
  title = 'Planos e Investimento',
  description = 'Escolha o formato de atendimento mais adequado ao seu estágio atual.',
  plans,
}) => {
  const list = (plans && plans.length > 0 ? plans : DEFAULT_PLANS).filter((plan) => plan.name && plan.price);

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {list.map((plan, index) => (
            <article
              key={`${plan.name}-${index}`}
              className={`rounded-xl border p-6 ${plan.highlighted ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {plan.price}
                <span className="text-base font-medium text-gray-600">{plan.period || ''}</span>
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                {plan.features.map((feature, featureIndex) => (
                  <li key={`${plan.name}-feature-${featureIndex}`}>• {feature}</li>
                ))}
              </ul>
              {plan.ctaText && plan.ctaLink ? (
                <a
                  href={plan.ctaLink}
                  className="inline-flex mt-5 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800"
                >
                  {plan.ctaText}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingDefault;
