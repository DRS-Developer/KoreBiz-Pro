
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { PracticeAreasRepository } from '../../../repositories/PracticeAreasRepository';
import { PracticeArea } from '../../../types/home-content';
import ImageUpload from '../../../components/Admin/ImageUpload';
import FormSkeleton from '../../../components/Skeletons/FormSkeleton';

const PracticeAreasForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PracticeArea>({
    defaultValues: {
      is_active: true,
      order_index: 0,
      what_we_offer: [],
      methodology: ''
    }
  });

  const imageUrl = watch('image_url');
  const description = watch('description');
  const methodology = watch('methodology');
  const whatWeOffer = watch('what_we_offer') || [];

  // Local state for adding new offer items
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  useEffect(() => {
    register('description');
    register('methodology');
    register('what_we_offer');
  }, [register]);

  const loadData = async (itemId: string) => {
    try {
      const data = await PracticeAreasRepository.getById(itemId);
      if (data) {
        setValue('title', data.title);
        setValue('description', data.description);
        setValue('image_url', data.image_url);
        setValue('link', data.link);
        setValue('order_index', data.order_index);
        setValue('is_active', data.is_active);
        // Load new fields if they exist in data (even if not in DB schema yet, could be in JSONB or handled by repo)
        setValue('what_we_offer', (data as any).what_we_offer || []);
        setValue('methodology', (data as any).methodology || '');
      }
    } catch (error) {
      console.error('Error loading item:', error);
      toast.error('Erro ao carregar dados.');
      navigate('/admin/areas-atuacao');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      const currentItems = whatWeOffer || [];
      setValue('what_we_offer', [...currentItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const currentItems = whatWeOffer || [];
    setValue('what_we_offer', currentItems.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PracticeArea) => {
    setSaving(true);
    try {
      if (id) {
        await PracticeAreasRepository.update(id, data);
        toast.success('Área de atuação atualizada!');
      } else {
        await PracticeAreasRepository.create(data);
        toast.success('Área de atuação criada!');
      }
      navigate('/admin/areas-atuacao');
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image'
  ];

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/areas-atuacao')}
          className="p-2 rounded-full"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Editar Área de Atuação' : 'Nova Área de Atuação'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Imagem / Ícone</h2>
            <div className="w-full md:max-w-[50%] mx-auto transition-all duration-300 ease-in-out">
                <ImageUpload
                label="Imagem"
                value={imageUrl}
                onChange={(url) => setValue('image_url', url, { shouldDirty: true })}
                folder="services"
                aspectRatio={4/3}
                minWidth={800}
                minHeight={600}
                pageKey="servicos:list"
                role="card"
                />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Esta imagem será exibida no card da área de atuação.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Informações da Área</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                {...register('title', { required: 'Título é obrigatório' })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link (URL)</label>
              <input
                type="text"
                {...register('link')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="/servicos/..."
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <div className="prose-editor">
                 <ReactQuill 
                    theme="snow"
                    value={description || ''}
                    onChange={(content) => setValue('description', content)}
                    modules={modules}
                    formats={formats}
                    className="h-64 mb-12"
                 />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use o editor para adicionar listas, títulos e formatação rica (HTML suportado).
              </p>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">O que oferecemos (Lista de Serviços)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                  placeholder="Adicionar item (ex: Projetos elétricos residenciais)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Adicionar
                </button>
              </div>
              <ul className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 p-2 rounded-lg border border-gray-200">
                {Array.isArray(whatWeOffer) && whatWeOffer.map((item, index) => (
                  <li key={index} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                    <span className="text-sm text-gray-700">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      Remover
                    </button>
                  </li>
                ))}
                {(!whatWeOffer || whatWeOffer.length === 0) && (
                  <li className="text-sm text-gray-400 text-center py-2">Nenhum item adicionado</li>
                )}
              </ul>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Metodologia de Trabalho</label>
              <div className="prose-editor">
                 <ReactQuill 
                    theme="snow"
                    value={methodology || ''}
                    onChange={(content) => setValue('methodology', content)}
                    modules={modules}
                    formats={formats}
                    className="h-48 mb-12"
                 />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordem de Exibição</label>
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

export default PracticeAreasForm;
