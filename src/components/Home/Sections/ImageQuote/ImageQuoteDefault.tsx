import React from 'react';
import OptimizedImage from '../../../OptimizedImage';

interface ImageQuoteDefaultProps {
  quote?: string;
  author?: string;
  role?: string;
  imageUrl?: string;
  imageAlt?: string;
}

const ImageQuoteDefault: React.FC<ImageQuoteDefaultProps> = ({
  quote = 'A combinação de método e acompanhamento nos deu segurança para avançar com consistência.',
  author = 'Cliente Exemplo',
  role = 'CEO',
  imageUrl = '/images/placeholder.png',
  imageAlt = 'Cliente satisfeito',
}) => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <OptimizedImage
              src={imageUrl}
              alt={imageAlt}
              pageKey="home"
              role="card"
              className="w-full h-[320px] object-cover"
              effect=""
              priority={false}
            />
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 md:p-8">
            <p className="text-2xl font-semibold text-blue-900 leading-relaxed">“{quote}”</p>
            <p className="mt-5 text-lg font-medium text-gray-900">{author}</p>
            <p className="text-gray-600">{role}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageQuoteDefault;
