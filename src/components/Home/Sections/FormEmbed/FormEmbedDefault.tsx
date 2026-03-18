import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { sanitizeEmbedUrl } from '../../../../utils/embedManager';

interface FormEmbedDefaultProps {
  title?: string;
  description?: string;
  formUrl?: string;
  height?: number;
  ctaText?: string;
  ctaUrl?: string;
}

const FormEmbedDefault: React.FC<FormEmbedDefaultProps> = ({
  title = 'Preencha o Formulário',
  description = 'Envie suas informações e retornaremos em breve com o melhor encaminhamento.',
  formUrl = '',
  height = 760,
  ctaText = 'Abrir formulário em nova aba',
  ctaUrl,
}) => {
  const embedUrl = sanitizeEmbedUrl(formUrl);
  const actionUrl = sanitizeEmbedUrl(ctaUrl || formUrl);
  const safeHeight = Math.max(480, Number(height || 760));

  if (!embedUrl && !actionUrl) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={title}
                className="w-full border-0"
                style={{ height: `${safeHeight}px` }}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
              />
            ) : (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-700 mb-4">
                  <FileText size={24} />
                </div>
                <p className="text-gray-700">
                  O provedor do formulário não está na lista permitida para incorporação.
                </p>
              </div>
            )}

            {actionUrl && (
              <div className="p-4 border-t border-gray-200 bg-white text-center">
                <a
                  href={actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  {ctaText}
                  <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormEmbedDefault;
