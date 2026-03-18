import React from 'react';
import OptimizedImage from '../../../OptimizedImage';

interface BeforeAfterItem {
  title: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeImageUrl: string;
  afterImageUrl: string;
}

interface BeforeAfterDefaultProps {
  title?: string;
  description?: string;
  maxItems?: number;
  items?: BeforeAfterItem[];
}

const DEFAULT_ITEMS: BeforeAfterItem[] = [
  {
    title: 'Fluxo Comercial',
    beforeLabel: 'Antes',
    afterLabel: 'Depois',
    beforeImageUrl: '/images/placeholder.png',
    afterImageUrl: '/images/placeholder.png',
  },
];

const BeforeAfterDefault: React.FC<BeforeAfterDefaultProps> = ({
  title = 'Antes e Depois',
  description = 'Evolução visual e estrutural dos cenários transformados.',
  maxItems = 2,
  items,
}) => {
  const list = (items && items.length > 0 ? items : DEFAULT_ITEMS)
    .filter((item) => item.title && item.beforeImageUrl && item.afterImageUrl)
    .slice(0, Math.max(1, Number(maxItems || 2)));

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className="space-y-8">
          {list.map((item, index) => (
            <article key={`${item.title}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100">{item.beforeLabel || 'Antes'}</div>
                  <OptimizedImage
                    src={item.beforeImageUrl}
                    alt={`${item.title} - antes`}
                    pageKey="home"
                    role="card"
                    className="w-full h-56 object-cover"
                    effect=""
                    priority={index === 0}
                  />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100">{item.afterLabel || 'Depois'}</div>
                  <OptimizedImage
                    src={item.afterImageUrl}
                    alt={`${item.title} - depois`}
                    pageKey="home"
                    role="card"
                    className="w-full h-56 object-cover"
                    effect=""
                    priority={index === 0}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterDefault;
