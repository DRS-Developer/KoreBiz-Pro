import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { HomeContentRepository } from '../../../../repositories/HomeContentRepository';
import { AboutContent } from '../../../../types/home-content';
import ImageUpload from '../../../../components/Admin/ImageUpload';
import FormSkeleton from '../../../../components/Skeletons/FormSkeleton';

const AboutTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, control, handleSubmit, setValue, watch, formState: { isDirty } } = useForm<AboutContent>({
    defaultValues: {
      features: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features" as never
  });

  const aboutImageUrl = watch('image_url');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const aboutData = await HomeContentRepository.getSection('about');
      if (aboutData && aboutData.content) {
        const content = aboutData.content as AboutContent;
        setValue('title', content.title);
        setValue('subtitle', content.subtitle);
        setValue('description', content.description);
        setValue('image_url', content.image_url);
        setValue('button_text', content.button_text);
        setValue('button_link', content.button_link);
        setValue('features', content.features || []);
      }
    } catch (error) {
      console.error('Error loading sections content:', error);
      toast.error('Erro ao carregar conteúdo da seção.');
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (data: AboutContent) => {
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

  if (loading) return <FormSkeleton />;

  return (
    <div className="space-y-12">
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">Seção "Sobre Nós"</h3>
          <button
            onClick={handleSubmit(onSave)}
            disabled={saving || !isDirty}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white ${saving || !isDirty ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <Save size={16} /> Salvar "Sobre Nós"
          </button>
        </div>

        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Imagem Ilustrativa</h4>
            <div className="w-full md:max-w-[50%] mx-auto transition-all duration-300 ease-in-out">
                <ImageUpload
                label="Imagem Ilustrativa"
                value={aboutImageUrl}
                onChange={(url) => setValue('image_url', url, { shouldDirty: true })}
                folder="general"
                aspectRatio={4/3}
                minWidth={800}
                minHeight={600}
                pageKey="home"
                role="card"
                formKey="home.about"
                />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Conteúdo Textual</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo (Pequeno)</label>
              <input type="text" {...register('subtitle')} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
              <input type="text" {...register('title')} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea {...register('description')} rows={4} className="w-full px-3 py-2 border rounded-md" />
            </div>
            
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">Lista de Diferenciais</label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <GripVertical size={16} className="text-gray-400 cursor-move" />
                    <input
                      type="text"
                      {...register(`features.${index}` as any)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto Botão</label>
                <input type="text" {...register('button_text')} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Botão</label>
                <input type="text" {...register('button_link')} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTab;