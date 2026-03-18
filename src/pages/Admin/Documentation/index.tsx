import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BookOpen, Layers } from 'lucide-react';
import { DOC_CATEGORIES } from './docsCatalog';
import { hasAdminDocsAccess } from '../../../utils/adminDocsAccess';

const DocumentationPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const activeCategoryId = categoryId || 'widgets';
  const activeCategory =
    DOC_CATEGORIES.find((category) => category.id === activeCategoryId) || DOC_CATEGORIES[0];

  if (!hasAdminDocsAccess()) {
    return <Navigate to="/admin/home" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <BookOpen className="text-blue-600 mt-1" size={22} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documentação Técnica</h1>
            <p className="text-sm text-gray-600 mt-1">
              Área temporária de documentação interna para padronização de implementação e operação.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Categorias</h2>
            <div className="space-y-2">
              {DOC_CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  to={`/admin/documentacao/${category.id}`}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    category.id === activeCategory.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {category.titulo}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-9 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Layers className="text-blue-600 mt-1" size={20} />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeCategory.titulo}</h2>
                <p className="text-sm text-gray-600 mt-1">{activeCategory.descricao}</p>
              </div>
            </div>
          </div>

          {activeCategory.itens.map((widget) => (
            <article key={widget.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <header>
                <h3 className="text-lg font-bold text-gray-900">{widget.nome}</h3>
                <p className="text-sm text-gray-600 mt-1">{widget.objetivo}</p>
              </header>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Passo a passo</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  {widget.preenchimento.map((step, index) => (
                    <li key={`${widget.id}-step-${index}`}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Campos e preenchimento</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Campo</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Tipo</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Obrigatório</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Instruções</th>
                      </tr>
                    </thead>
                    <tbody>
                      {widget.campos.map((field) => (
                        <tr key={`${widget.id}-${field.key}`} className="border-t border-gray-100">
                          <td className="px-3 py-2 font-medium text-gray-800">{field.key}</td>
                          <td className="px-3 py-2 text-gray-700">{field.tipo}</td>
                          <td className="px-3 py-2 text-gray-700">{field.obrigatorio}</td>
                          <td className="px-3 py-2 text-gray-700">{field.instrucoes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Configurações e observações</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {widget.configuracoes.map((item, index) => (
                    <li key={`${widget.id}-cfg-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default DocumentationPage;
