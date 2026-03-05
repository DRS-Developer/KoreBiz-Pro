import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Save, Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import ImageUpload from '../../../components/Admin/ImageUpload';
import { useFormGuard } from '../../../hooks/useFormGuard';
import { useFormDraft } from '../../../hooks/useFormDraft';
import { useSlug } from '../../../hooks/useSlug';
import { useGlobalStore } from '../../../stores/useGlobalStore';
import UnsavedChangesModal from '../../../components/Admin/UnsavedChangesModal';
import SEOSnippetPreview from '../../../components/Admin/SEOSnippetPreview';
import FormSkeleton from '../../../components/Skeletons/FormSkeleton';
import { useDebounce } from '../../../hooks/useDebounce'; 

// Lazy load heavy components
const TiptapEditor = lazy(() => import('../../../components/Admin/TiptapEditor'));

const schema = yup.object({
  title: yup.string().required('O título é obrigatório'),
  slug: yup.string().required('O slug é obrigatório')
    .matches(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  short_description: yup.string().nullable(),
  description: yup.string()
    .transform((v) => (v === '<p></p>' ? '' : v))
    .nullable(),
  client: yup.string().nullable(),
  completion_date: yup.string().nullable().transform((v) => (v === '' ? null : v)),
  category: yup.string().required('A categoria é obrigatória'),
  image_url: yup.string().url('URL inválida').nullable(),
  location: yup.string().nullable(),
  published: yup.boolean(),
  gallery_images: yup.array().of(
    yup.object({
      url: yup.string().url('URL inválida').required(),
      caption: yup.string().nullable(),
    })
  ).notRequired().default([]),
});

export type FormData = yup.InferType<typeof schema>;

const PortfolioForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const isEditing = !!id;
  const { updatePortfolio } = useGlobalStore();

  // Form Draft Logic
  const draftKey = `portfolio_form_${id || 'new'}`;
  const [draft, setDraft, clearDraft] = useFormDraft<FormData | null>(draftKey, null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: draft || {
      published: false,
      gallery_images: [],
      title: '',
      slug: '',
      short_description: '',
      description: '',
      client: '',
      completion_date: '',
      category: '',
      image_url: '',
      location: '',
    },
  });

  const allFields = watch();
  const lastDraftRef = React.useRef<string>('');
  const draftTimeoutRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (!isDirty) return;
    const serialized = JSON.stringify(allFields ?? {});
    if (serialized === lastDraftRef.current) return;
    if (draftTimeoutRef.current !== null) {
      window.clearTimeout(draftTimeoutRef.current);
    }
    draftTimeoutRef.current = window.setTimeout(() => {
      lastDraftRef.current = serialized;
      setDraft(allFields);
    }, 400);
    return () => {
      if (draftTimeoutRef.current !== null) {
        window.clearTimeout(draftTimeoutRef.current);
        draftTimeoutRef.current = null;
      }
    };
  }, [allFields, isDirty, setDraft]);

  const titleValue = watch('title');
  const slugValue = watch('slug');
  const debouncedSlug = useDebounce(slugValue, 500);
  const { generateUniqueSlug, checkAvailability, isChecking, formatSlug } = useSlug({ table: 'portfolios' });
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const isSubmittingRef = React.useRef(false);
  const { blocker, showModal } = useFormGuard(isDirty, isSubmittingRef);

  // Debounced slug availability check for manual edits
  useEffect(() => {
    if (!debouncedSlug) {
      setSlugError(null);
      setIsSlugAvailable(null);
      return;
    }
    
    const checkManualSlug = async () => {
      const formatted = formatSlug(debouncedSlug);
      const isAvailable = await checkAvailability(formatted, id);
      if (!isAvailable) {
        setSlugError('Este slug já está em uso.');
        setIsSlugAvailable(false);
      } else {
        setSlugError(null);
        setIsSlugAvailable(true);
      }
    };
    
    checkManualSlug();
  }, [debouncedSlug, checkAvailability, formatSlug, id]);

  // Validate slug on blur or change
  const handleSlugBlur = async () => {
    const currentSlug = watch('slug');
    if (!currentSlug) {
      setIsSlugAvailable(null);
      return;
    }
    
    // Format on blur to ensure consistency
    const formatted = formatSlug(currentSlug);
    if (formatted !== currentSlug) {
      // shouldDirty: true here because user manually interacted
      setValue('slug', formatted, { shouldDirty: true });
    }

    const isAvailable = await checkAvailability(formatted, id);
    if (!isAvailable) {
      setSlugError('Este slug já está em uso.');
      setIsSlugAvailable(false);
    } else {
      setSlugError(null);
      setIsSlugAvailable(true);
    }
  };

  const handleManualGenerateSlug = async () => {
    if (!titleValue) {
      toast.error('Preencha o título primeiro.');
      return;
    }
    
    const uniqueSlug = await generateUniqueSlug(titleValue, id);
    // Manual action should dirty the form
    setValue('slug', uniqueSlug, { shouldDirty: true });
    setIsSlugAvailable(true);
    setSlugError(null);
    toast.success('Slug gerado com sucesso!');
  };

  const fetchData = async (itemId: string) => {
    try {
      const { data: rawData, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = rawData as any;

      if (data) {
        if (draft && isEditing) {
           return; 
        }

        reset({
          title: data.title,
          slug: data.slug,
          short_description: data.short_description,
          description: data.description,
          client: data.client,
          completion_date: data.completion_date,
          category: data.category,
          image_url: data.image_url,
          location: data.location,
          published: data.published,
          gallery_images: Array.isArray(data.gallery_images) 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? data.gallery_images.map((img: any) => ({
                url: img.url || '',
                caption: img.caption || ''
              }))
            : []
        });
      }
    } catch (error) {
      console.error('Error fetching portfolio item:', error);
      toast.error('Erro ao carregar projeto');
      navigate('/admin/portfolio');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const savePortfolio = async (data: FormData): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Convert empty strings to null for nullable fields
      const sanitizedData = {
        ...data,
        short_description: data.short_description || null,
        completion_date: data.completion_date || null,
        description: data.description || null,
        client: data.client || null,
        image_url: data.image_url || null,
        location: data.location || null,
        // Ensure gallery_images is a valid array (empty if null/undefined)
        gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images : []
      };

      const payload = {
        ...sanitizedData,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { data: saved, error } = await supabase
          .from('portfolios')
          .update(payload)
          .eq('id', id)
          .select('*')
          .single();
        
        if (error) throw error;
        if (saved) updatePortfolio(saved as any);
        toast.success('Projeto atualizado com sucesso!');
      } else {
        const { data: saved, error } = await supabase
          .from('portfolios')
          .insert(payload)
          .select('*')
          .single();
        
        if (error) throw error;
        if (saved) updatePortfolio(saved as any);
        toast.success('Projeto criado com sucesso!');
      }

      reset(data);
      clearDraft(); // Clear draft on success
      return true;
    } catch (error: any) {
      console.error('Error saving project:', error);
      
      // Tratamento específico para erro de duplicidade (Postgres code 23505)
      if (error.code === '23505' || error.message?.includes('duplicate key value')) {
        toast.error('Erro: Este slug já está sendo usado por outro projeto. Por favor, escolha outro.');
        setSlugError('Este slug já está em uso.');
      } else if (error.code === '42501' || error.message?.includes('violates row-level security')) {
        toast.error('Erro de Permissão: Você não tem permissão para criar ou editar projetos. Verifique se seu usuário é administrador.');
      } else {
        toast.error('Erro ao salvar projeto: ' + (error.message || 'Erro desconhecido'));
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.error('Validation errors:', errors);
    const errorMessages = Object.values(errors)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((error: any) => error.message || (error.type === 'typeError' ? 'Erro de tipo no campo' : 'Erro desconhecido'))
      .join('\n');
    
    toast.error(
      <div>
        <p className="font-bold">Erros de validação:</p>
        <pre className="text-xs mt-1 whitespace-pre-wrap">{errorMessages}</pre>
      </div>
    );
    isSubmittingRef.current = false;
  };

  const onSubmit = async (data: FormData) => {
    isSubmittingRef.current = true;
    const success = await savePortfolio(data);
    if (success) {
      navigate('/admin/portfolio');
    } else {
      isSubmittingRef.current = false;
    }
  };

  const handleSaveFromModal = async () => {
    await handleSubmit(async (data) => {
      isSubmittingRef.current = true;
      const success = await savePortfolio(data);
      if (success) {
        blocker.proceed?.();
      } else {
        isSubmittingRef.current = false;
      }
    })();
  };

  const handleDiscard = () => {
    isSubmittingRef.current = true; // Allow navigation
    reset();
    blocker.proceed?.();
  };

  if (initialLoading) {
    return <FormSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/portfolio"
            className="p-2 rounded-full"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
          </h1>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={showModal}
        onSave={handleSaveFromModal}
        onDiscard={handleDiscard}
        onCancel={() => blocker.reset?.()}
      />

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
        <div className="flex flex-col gap-8">
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Imagem de Capa</h2>
            <div className="w-full md:max-w-[50%] mx-auto transition-all duration-300 ease-in-out">
                <ImageUpload
                label="Imagem de Capa"
                value={watch('image_url')}
                onChange={(url) => setValue('image_url', url, { shouldDirty: true })}
                folder="portfolio"
                error={errors.image_url?.message}
                aspectRatio={840 / 500} 
                minWidth={840}
                minHeight={500}
                pageKey="portfolio:detail"
                role="hero"
                />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Informações Principais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Projeto *
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.title && (
                  <span className="text-red-500 text-sm">{errors.title.message}</span>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Slug (URL) *
                  </label>
                  <button
                    type="button"
                    onClick={handleManualGenerateSlug}
                    className="text-xs text-blue-600 flex items-center gap-1"
                    title="Gerar slug baseado no título"
                  >
                    <RefreshCw size={12} /> Gerar Automático
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    {...register('slug', {
                      onChange: () => {
                        setIsSlugAvailable(null);
                        setSlugError(null);
                      }
                    })}
                    onBlur={handleSlugBlur}
                    className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 ${
                      errors.slug || slugError ? 'border-red-500' : isSlugAvailable ? 'border-green-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute right-3 top-2.5 flex items-center pointer-events-none">
                      {isChecking ? (
                          <Loader2 className="text-blue-500" size={16} />
                      ) : isSlugAvailable === true ? (
                          <CheckCircle className="text-green-500" size={16} />
                      ) : isSlugAvailable === false || slugError ? (
                          <AlertCircle className="text-red-500" size={16} />
                      ) : null}
                  </div>
                </div>
                {(errors.slug || slugError) && (
                  <span className="text-red-500 text-sm block mt-1">
                    {slugError || errors.slug?.message}
                  </span>
                )}
                <p className="text-xs text-gray-500 mt-1">
                   URL final: /portfolio/{watch('slug') || '...'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Residencial">Residencial</option>
                  <option value="Industrial">Industrial</option>
                </select>
                {errors.category && (
                  <span className="text-red-500 text-sm">{errors.category.message}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  {...register('client')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Conclusão
                </label>
                <input
                  type="date"
                  {...register('completion_date')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Resumo e SEO</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breve Descrição (Exibida na listagem e SEO)
              </label>
              <textarea
                {...register('short_description')}
                rows={3}
                maxLength={160}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                placeholder="Um breve resumo sobre o projeto..."
              ></textarea>
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${
                  (watch('short_description')?.length || 0) > 160 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {watch('short_description')?.length || 0}/160 caracteres
                </span>
              </div>
            </div>
            
            <div className="mt-2">
              <SEOSnippetPreview
                title={watch('title')}
                description={watch('short_description') || ''}
                slug={`portfolio/${watch('slug')}`}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Conteúdo Detalhado</h2>
            <Suspense fallback={<div className="h-64 bg-gray-50 rounded-lg border border-gray-200" />}>
              <TiptapEditor
                label="Descrição Detalhada"
                value={watch('description') || ''}
                onChange={(value) => setValue('description', value, { shouldDirty: true })}
                error={errors.description?.message as string}
                placeholder="Descreva o projeto aqui..."
              />
            </Suspense>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
             <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Galeria</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {watch('gallery_images')?.map((image, index) => (
                 <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                   <img src={image.url} alt={image.caption || ''} className="w-full h-full object-cover" />
                   <button
                     type="button"
                     onClick={() => {
                       const newGallery = [...(watch('gallery_images') || [])];
                       newGallery.splice(index, 1);
                       setValue('gallery_images', newGallery, { shouldDirty: true });
                     }}
                     className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     ×
                   </button>
                 </div>
               ))}
               <div className="aspect-square">
                 <ImageUpload
                   label="Adicionar"
                   value=""
                   onChange={(url) => {
                     if (url) {
                       setValue('gallery_images', [...(watch('gallery_images') || []), { url, caption: '' }], { shouldDirty: true });
                     }
                   }}
                   folder="portfolio"
                 />
               </div>
             </div>
           </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
            <input
              type="checkbox"
              id="published"
              {...register('published')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700">
              Publicar projeto imediatamente
            </label>
          </div>

        </div>

        <div className="flex justify-end gap-4">
          <Link
            to="/admin/portfolio"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? null : <Save size={20} />}
            {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Projeto')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioForm;
