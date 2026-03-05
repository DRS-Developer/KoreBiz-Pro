import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Save, Loader2, Settings, FileText, PenTool, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import ImageUpload from '../../../components/Admin/ImageUpload';
import SEOSnippetPreview from '../../../components/Admin/SEOSnippetPreview';
import { useFormGuard } from '../../../hooks/useFormGuard';
import { useFormDraft } from '../../../hooks/useFormDraft';
import { useDebounce } from '../../../hooks/useDebounce';
import { useSlug } from '../../../hooks/useSlug';
import { useGlobalStore } from '../../../stores/useGlobalStore';
import UnsavedChangesModal from '../../../components/Admin/UnsavedChangesModal';
import FormSkeleton from '../../../components/Skeletons/FormSkeleton';

// Lazy load heavy components
const TiptapEditor = lazy(() => import('../../../components/Admin/TiptapEditor'));

const schema = yup.object({
  title: yup.string().required('O título é obrigatório'),
  slug: yup.string().required('O slug é obrigatório'),
  short_description: yup.string().nullable(),
  full_description: yup.string()
    .transform((v) => (v === '<p></p>' ? '' : v))
    .required('A descrição completa é obrigatória'),
  icon: yup.string().nullable(),
  image_url: yup.string().url('URL inválida').nullable(),
  category: yup.string().nullable(),
  order: yup.number().integer().default(0),
  published: yup.boolean(),
}).required();

type FormData = yup.InferType<typeof schema>;

const ServicesForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const isEditing = !!id;
  const { updateService } = useGlobalStore();

  // Form Draft Logic
  // Use a unique key for each service (or 'new' for creation)
  const draftKey = `service_form_${id || 'new'}`;
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
      order: 0,
      title: '',
      slug: '',
      short_description: '',
      full_description: '',
      icon: '',
      image_url: '',
      category: '',
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
  const { generateUniqueSlug, checkAvailability, isChecking, formatSlug } = useSlug({ table: 'services' });
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
    
    const formatted = formatSlug(currentSlug);
    if (formatted !== currentSlug) {
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
    setValue('slug', uniqueSlug, { shouldDirty: true });
    setIsSlugAvailable(true);
    setSlugError(null);
    toast.success('Slug gerado com sucesso!');
  };

  const fetchData = async (itemId: string) => {
    try {
      const { data: rawData, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = rawData as any;

      if (data) {
        // If we have a draft and it's newer/dirty, maybe we should ask user?
        // For now, let's prefer draft if it exists and is for this ID
        if (draft && isEditing) {
             // Optional: toast to inform user they are seeing a draft
             // toast.info('Rascunho recuperado automaticamente.');
             // But actually, we passed draft to defaultValues.
             // If we reset here, we overwrite draft.
             // We should only reset if NO draft.
             return; 
        }

        reset({
          title: data.title,
          slug: data.slug,
          short_description: data.short_description,
          full_description: data.full_description,
          icon: data.icon,
          image_url: data.image_url,
          category: data.category,
          order: data.order || 0,
          published: data.published,
        });
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Erro ao carregar serviço');
      navigate('/admin/services');
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

  const saveService = async (data: FormData): Promise<boolean> => {
    try {
      setLoading(true);
      
      const payload = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { data: saved, error } = await supabase
          .from('services')
          .update(payload)
          .eq('id', id)
          .select('*')
          .single();
        
        if (error) throw error;
        if (saved) updateService(saved as any);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        const { data: saved, error } = await supabase
          .from('services')
          .insert(payload)
          .select('*')
          .single();
        
        if (error) throw error;
        if (saved) updateService(saved as any);
        toast.success('Serviço criado com sucesso!');
      }
      
      // Update form state to clean dirty
      reset(data);
      clearDraft(); // Clear draft on success
      return true;
    } catch (error: any) {
      console.error('Error saving service:', error);
      
      // Tratamento específico para erro de duplicidade (Postgres code 23505)
      if (error.code === '23505' || error.message?.includes('duplicate key value')) {
        toast.error('Erro: Este slug já está sendo usado por outro serviço. Por favor, escolha outro.');
        setSlugError('Este slug já está em uso.');
      } else if (error.code === '42501' || error.message?.includes('violates row-level security')) {
        toast.error('Erro de Permissão: Você não tem permissão para criar ou editar serviços. Verifique se seu usuário é administrador.');
      } else {
        toast.error('Erro ao salvar serviço: ' + (error.message || 'Erro desconhecido'));
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
    const success = await saveService(data);
    if (success) {
      navigate('/admin/services');
    } else {
      isSubmittingRef.current = false;
    }
  };

  const handleSaveFromModal = async () => {
    // Manually trigger submit
    await handleSubmit(async (data) => {
      isSubmittingRef.current = true;
      const success = await saveService(data);
      if (success) {
        blocker.proceed?.();
      } else {
        isSubmittingRef.current = false;
      }
    })();
  };

  const handleDiscard = () => {
    isSubmittingRef.current = true; // Allow navigation
    clearDraft(); // Clear the draft storage
    reset(); // Revert changes to default (empty)
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
            to="/admin/services"
            className="p-2 rounded-full"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
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
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Imagem Destacada</h2>
            <div className="w-full md:max-w-[50%] mx-auto transition-all duration-300 ease-in-out">
                <ImageUpload
                label="Imagem Destacada"
                value={watch('image_url')}
                onChange={(url) => setValue('image_url', url, { shouldDirty: true })}
                folder="services"
                error={errors.image_url?.message}
                aspectRatio={4}
                minWidth={200}
                minHeight={50}
                pageKey="servicos:list"
                role="card"
                />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Informações Principais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título do Serviço *
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
                 URL final: /servicos/{watch('slug') || '...'}
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
                <option value="Projetos">Projetos</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Instalação">Instalação</option>
                <option value="Laudos">Laudos</option>
                <option value="Consultoria">Consultoria</option>
              </select>
              {errors.category && (
                <span className="text-red-500 text-sm">{errors.category.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ícone
              </label>
              <div className="relative">
                <select
                  {...register('icon')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="">Selecione...</option>
                  <option value="FileText">Documento (FileText)</option>
                  <option value="Settings">Configurações (Settings)</option>
                  <option value="PenTool">Ferramenta (PenTool)</option>
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-gray-500">
                  {watch('icon') === 'FileText' && <FileText size={20} />}
                  {watch('icon') === 'Settings' && <Settings size={20} />}
                  {watch('icon') === 'PenTool' && <PenTool size={20} />}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordem de Exibição
              </label>
              <input
                type="number"
                {...register('order')}
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
                placeholder="Um breve resumo sobre o serviço..."
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
                slug={`servicos/${watch('slug')}`}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Descrição Completa</h2>
            <Suspense fallback={<div className="h-64 bg-gray-50 rounded-lg border border-gray-200" />}>
              <TiptapEditor
                label="Descrição Completa"
                value={watch('full_description')}
                onChange={(value) => setValue('full_description', value, { shouldDirty: true })}
                error={errors.full_description?.message as string}
                placeholder="Descreva o serviço detalhadamente..."
              />
            </Suspense>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
            <input
              type="checkbox"
              id="published"
              {...register('published')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700">
              Publicar serviço imediatamente
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            to="/admin/services"
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
            {loading ? 'Salvando...' : 'Salvar Serviço'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServicesForm;
