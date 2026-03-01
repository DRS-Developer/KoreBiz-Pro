
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { HomeContentRepository } from '../../../../repositories/HomeContentRepository';
import ImageUpload from '../../../../components/Admin/ImageUpload';
import { HeroContent } from '../../../../types/home-content';
import FormSkeleton from '../../../../components/Skeletons/FormSkeleton';

const HeroTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { isDirty } } = useForm<HeroContent>();

  const bannerUrl = watch('background_image');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await HomeContentRepository.getSection('hero');
      if (data && data.content) {
        const content = data.content as HeroContent;
        setValue('title', content.title);
        setValue('description', content.description);
        setValue('primary_button_text', content.primary_button_text);
        setValue('primary_button_link', content.primary_button_link);
        setValue('secondary_button_text', content.secondary_button_text);
        setValue('secondary_button_link', content.secondary_button_link);
        setValue('background_image', content.background_image);
      }
    } catch (error) {
      console.error('Error loading hero content:', error);
      toast.error('Erro ao carregar conteúdo do banner.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: HeroContent) => {
    setSaving(true);
    try {
      await HomeContentRepository.updateSection('hero', data);
      toast.success('Banner atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating hero content:', error);
      toast.error('Erro ao atualizar banner.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Conteúdo Textual</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Soluções Completas..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Excelência técnica e compromisso..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto Botão Primário</label>
              <input
                type="text"
                {...register('primary_button_text')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Botão Primário</label>
              <input
                type="text"
                {...register('primary_button_link')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto Botão Secundário</label>
              <input
                type="text"
                {...register('secondary_button_text')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Botão Secundário</label>
              <input
                type="text"
                {...register('secondary_button_link')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Imagem de Fundo</h3>
          
          <ImageUpload
            label="Banner Principal"
            value={bannerUrl}
            onChange={(url) => setValue('background_image', url, { shouldDirty: true })}
            folder="general"
            aspectRatio={16/9}
            description="Recomendado: 1920x1080px (Alta resolução)"
            pageKey="home"
            role="hero"
          />

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 mb-2">Dica Visual</h4>
            <p className="text-sm text-blue-700">
              A imagem selecionada terá automaticamente uma sobreposição escura (overlay) para garantir que o texto fique legível.
              Escolha imagens com boa iluminação e que representem bem os serviços da empresa.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white
            ${saving || !isDirty 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600'
            }
          `}
        >
          {saving ? null : <Save size={20} />}
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
};

export default HeroTab;
