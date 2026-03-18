
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { HomeContentRepository } from '../../../../repositories/HomeContentRepository';
import { CTAContent } from '../../../../types/home-content';
import FormSkeleton from '../../../../components/Skeletons/FormSkeleton';

const CtaTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register: registerCTA, handleSubmit: handleSubmitCTA, setValue: setValueCTA, formState: { isDirty: isDirtyCTA } } = useForm<CTAContent>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const ctaData = await HomeContentRepository.getSection('cta');
      if (ctaData && ctaData.content) {
        const content = ctaData.content as CTAContent;
        setValueCTA('title', content.title);
        setValueCTA('description', content.description);
        setValueCTA('primary_button_text', content.primary_button_text);
        setValueCTA('primary_button_link', content.primary_button_link);
        setValueCTA('secondary_button_text', content.secondary_button_text);
        setValueCTA('secondary_button_link', content.secondary_button_link);
      }
    } catch (error) {
      console.error('Error loading sections content:', error);
      toast.error('Erro ao carregar conteúdo das seções.');
    } finally {
      setLoading(false);
    }
  };

  const onSaveCTA = async (data: CTAContent) => {
    setSaving(true);
    try {
      await HomeContentRepository.updateSection('cta', data);
      toast.success('Seção "Chamada para Ação" atualizada!');
    } catch (error) {
      toast.error('Erro ao atualizar seção.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="space-y-12">
      {/* CTA Section */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center mb-6 border-b border-blue-200 pb-4">
          <h3 className="text-xl font-bold text-blue-900">Seção "Chamada para Ação" (Final da Página)</h3>
          <button
            onClick={handleSubmitCTA(onSaveCTA)}
            disabled={saving || !isDirtyCTA}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white ${saving || !isDirtyCTA ? 'bg-blue-300' : 'bg-blue-600'}`}
          >
            <Save size={16} /> Salvar CTA
          </button>
        </div>

        <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">Título</label>
              <input type="text" {...registerCTA('title')} className="w-full px-3 py-2 border border-blue-200 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">Descrição</label>
              <textarea {...registerCTA('description')} rows={3} className="w-full px-3 py-2 border border-blue-200 rounded-md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-3">Botão Principal (Verde)</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Texto</label>
                            <input type="text" {...registerCTA('primary_button_text')} className="w-full px-3 py-2 border rounded-md text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Link</label>
                            <input type="text" {...registerCTA('primary_button_link')} className="w-full px-3 py-2 border rounded-md text-sm" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-3">Botão Secundário (Transparente)</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Texto</label>
                            <input type="text" {...registerCTA('secondary_button_text')} className="w-full px-3 py-2 border rounded-md text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Link</label>
                            <input type="text" {...registerCTA('secondary_button_link')} className="w-full px-3 py-2 border rounded-md text-sm" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CtaTab;
