
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { HomeContentRepository } from '../../../../repositories/HomeContentRepository';
import { AboutContent, CTAContent } from '../../../../types/home-content';
import ImageUpload from '../../../../components/Admin/ImageUpload';
import FormSkeleton from '../../../../components/Skeletons/FormSkeleton';

const ContentEditorTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register: registerAbout, control: controlAbout, handleSubmit: handleSubmitAbout, setValue: setValueAbout, watch: watchAbout, formState: { isDirty: isDirtyAbout } } = useForm<AboutContent>({
    defaultValues: {
      features: []
    }
  });

  const { register: registerCTA, handleSubmit: handleSubmitCTA, setValue: setValueCTA, formState: { isDirty: isDirtyCTA } } = useForm<CTAContent>();

  const { fields, append, remove } = useFieldArray({
    control: controlAbout,
    name: "features" as never
  });

  const aboutImageUrl = watchAbout('image_url');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const aboutData = await HomeContentRepository.getSection('about');
      if (aboutData && aboutData.content) {
        const content = aboutData.content as AboutContent;
        setValueAbout('title', content.title);
        setValueAbout('subtitle', content.subtitle);
        setValueAbout('description', content.description);
        setValueAbout('image_url', content.image_url);
        setValueAbout('button_text', content.button_text);
        setValueAbout('button_link', content.button_link);
        setValueAbout('features', content.features || []);
      }

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

  const onSaveAbout = async (data: AboutContent) => {
    setSaving(true);
    try {
      await HomeContentRepository.updateSection('about', data);
      toast.success('Seção "Sobre Nós" atualizada!');
    } catch (error) {
      toast.error('Erro ao atualizar seção.');
    } finally {
      setSaving(false);
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
      {/* About Section */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">Seção "Sobre Nós"</h3>
          <button
            onClick={handleSubmitAbout(onSaveAbout)}
            disabled={saving || !isDirtyAbout}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white ${saving || !isDirtyAbout ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <Save size={16} /> Salvar "Sobre Nós"
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo (Pequeno)</label>
              <input type="text" {...registerAbout('subtitle')} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
              <input type="text" {...registerAbout('title')} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea {...registerAbout('description')} rows={4} className="w-full px-3 py-2 border rounded-md" />
            </div>
            
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">Lista de Diferenciais</label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <GripVertical size={16} className="text-gray-400 cursor-move" />
                    <input
                      type="text"
                      {...registerAbout(`features.${index}` as any)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                      placeholder="Ex: Atendimento 24h"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => append("Novo diferencial")}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mt-2"
                >
                  <Plus size={16} /> Adicionar Item
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagem Ilustrativa</label>
            <ImageUpload
              value={aboutImageUrl}
              onChange={(url) => setValueAbout('image_url', url, { shouldDirty: true })}
              folder="general"
              aspectRatio={4/3}
              pageKey="home"
              role="card"
            />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto Botão</label>
                <input type="text" {...registerAbout('button_text')} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Botão</label>
                <input type="text" {...registerAbout('button_link')} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default ContentEditorTab;
