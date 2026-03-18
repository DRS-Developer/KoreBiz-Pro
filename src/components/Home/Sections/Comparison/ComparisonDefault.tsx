import React from 'react';

interface ComparisonRow {
  criterion: string;
  ours: string;
  others: string;
}

interface ComparisonDefaultProps {
  title?: string;
  description?: string;
  rows?: ComparisonRow[];
}

const DEFAULT_ROWS: ComparisonRow[] = [
  { criterion: 'Tempo de resposta', ours: 'Até 24h', others: 'Variável' },
  { criterion: 'Acompanhamento', ours: 'Contínuo e estruturado', others: 'Pontual' },
  { criterion: 'Transparência', ours: 'Relatórios recorrentes', others: 'Sem padrão fixo' },
];

const ComparisonDefault: React.FC<ComparisonDefaultProps> = ({
  title = 'Comparativo de Atendimento',
  description = 'Resumo objetivo das diferenças do nosso modelo de execução.',
  rows,
}) => {
  const list = (rows && rows.length > 0 ? rows : DEFAULT_ROWS).filter(
    (row) => row.criterion && row.ours && row.others
  );

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className="max-w-5xl mx-auto overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Critério</th>
                <th className="text-left px-4 py-3 font-semibold text-blue-800">Nosso Modelo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Mercado</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row, index) => (
                <tr key={`${row.criterion}-${index}`} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{row.criterion}</td>
                  <td className="px-4 py-3 text-blue-900">{row.ours}</td>
                  <td className="px-4 py-3 text-gray-700">{row.others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonDefault;
