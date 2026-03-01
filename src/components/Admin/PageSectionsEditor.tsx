import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Target, Eye, Heart, Award, Users, Clock } from 'lucide-react';

const PageSectionsEditor: React.FC = () => {
  const { register, watch } = useFormContext();
  
  // Only show for "Empresa" page or if explicitly enabled? 
  // For now, let's just show it. Or maybe check the slug?
  // Ideally this should be dynamic based on page template, but for this task we assume it's for the Empresa page.
  // We can check the slug field from the form.
  const slug = watch('slug');
  
  if (slug !== 'empresa') {
    return (
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
        <p className="text-sm text-blue-800">
          As seções especiais (Missão, Visão, Valores, Diferenciais) estão disponíveis apenas para a página com slug "empresa".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Missão, Visão, Valores */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center gap-2">
          <Target size={20} className="text-blue-600" />
          Identidade Corporativa
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Missão */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target size={18} className="text-blue-600" />
              <h4 className="font-medium text-gray-700">Missão</h4>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
              <input
                type="text"
                {...register('sections.mission.title')}
                placeholder="Ex: Missão"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
              <textarea
                {...register('sections.mission.description')}
                rows={4}
                placeholder="Descrição da missão..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Visão */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={18} className="text-blue-600" />
              <h4 className="font-medium text-gray-700">Visão</h4>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
              <input
                type="text"
                {...register('sections.vision.title')}
                placeholder="Ex: Visão"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
              <textarea
                {...register('sections.vision.description')}
                rows={4}
                placeholder="Descrição da visão..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Valores */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={18} className="text-blue-600" />
              <h4 className="font-medium text-gray-700">Valores</h4>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
              <input
                type="text"
                {...register('sections.values.title')}
                placeholder="Ex: Valores"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
              <textarea
                {...register('sections.values.description')}
                rows={4}
                placeholder="Descrição dos valores..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Diferenciais */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center gap-2">
          <Award size={20} className="text-blue-600" />
          Diferenciais (Por que escolher?)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Award, label: 'Diferencial 1 (Qualidade)', index: 0 },
            { icon: Users, label: 'Diferencial 2 (Equipe)', index: 1 },
            { icon: Clock, label: 'Diferencial 3 (Pontualidade)', index: 2 },
            { icon: Target, label: 'Diferencial 4 (Foco)', index: 3 },
          ].map((item) => (
            <div key={item.index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="mt-1">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                  <item.icon size={20} />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">{item.label}</h4>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
                  <input
                    type="text"
                    {...register(`sections.differentials.items.${item.index}.title`)}
                    placeholder="Título do diferencial"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                  <textarea
                    {...register(`sections.differentials.items.${item.index}.description`)}
                    rows={2}
                    placeholder="Descrição do diferencial..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageSectionsEditor;
