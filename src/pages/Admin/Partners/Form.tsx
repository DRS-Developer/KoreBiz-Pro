import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';
import { PartnersRepository } from '../../../repositories/PartnersRepository';
import { Partner } from '../../../types/home-content';
import ImageUpload from '../../../components/Admin/ImageUpload';
import FormSkeleton from '../../../components/Skeletons/FormSkeleton';

const PartnersForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Partner>({
    defaultValues: {
      is_active: true,
      order_index: 0
    }
  });

  const logoUrl = watch('logo_url');

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (itemId: string) => {
    try {
      const data = await PartnersRepository.getById(itemId);
      if (data) {
        setValue('name', data.name);
        setValue('description', data.description);
        setValue('logo_url', data.logo_url);
        setValue('website_url', data.website_url);
        setValue('order_index', data.order_index);
        setValue('is_active', data.is_active);
      }
    } catch (error) {
      console.error('Error loading partner:', error);
      toast.error('Erro ao carregar dados.');
      navigate('/admin/parceiros');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Partner) => {
    setSaving(true);
    try {
      if (id) {
        await PartnersRepository.update(id, data);
        toast.success('Parceiro atualizado!');
      } else {
        await PartnersRepository.create(data);
        toast.success('Parceiro criado!');
      }
      navigate('/admin/parceiros');
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/parceiros')}
          className="p-2 rounded-full"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Editar Parceiro' : 'Novo Parceiro'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Logotipo</h2>
            <div className="w-full md:max-w-[50%] mx-auto transition-all duration-300 ease-in-out">
                <ImageUpload
                label="Logo"
                value={logoUrl}
                onChange={(url) => setValue('logo_url', url, { shouldDirty: true })}
                folder="partners"
                aspectRatio={2}
                minWidth={240}
                minHeight={120}
                description="Formato recomendado: 240x120px (2:1), preferencialmente transparente"
                pageKey="parceiros"
                role="logo"
                />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Informações do Parceiro</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                {...register('name', { required: 'Nome é obrigatório' })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site (URL)</label>
              <input
                type="text"
                {...register('website_url')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Breve descrição sobre a parceria..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
              <input
                type="number"
                {...register('order_index')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                id="is_active"
                {...register('is_active')}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Ativo (Exibir no site)
              </label>
            </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white
              ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 shadow-md'}
            `}
          >
            {saving ? null : <Save size={20} />}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PartnersForm;
