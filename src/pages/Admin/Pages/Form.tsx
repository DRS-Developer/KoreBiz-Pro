import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Save, Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
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
import UnsavedChangesBar from '../../../components/Admin/UnsavedChangesBar';

// Lazy load heavy components
const TiptapEditor = lazy(() => import('../../../components/Admin/TiptapEditor'));

const schema = yup.object({
  title: yup.string().required('O título é obrigatório'),
  slug: yup.string().required('O slug é obrigatório').matches(/^[a-z0-9-]+$/, 'Slug inválido (apenas letras minúsculas, números e hífens)'),
  content: yup.mixed().required('O conteúdo é obrigatório'), // Validating content as mixed/string/object
  meta_title: yup.string().nullable(),
  meta_description: yup.string().nullable(),
  featured_image: yup.string().url('URL inválida').nullable(),
  published: yup.boolean(),
}).required();

type FormData = yup.InferType<typeof schema>;

const PageForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const isEditing = !!id;
  const { updatePage } = useGlobalStore();
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'duplicate' | 'error'>('idle');
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const [slugCheckError, setSlugCheckError] = useState<string | null>(null);
  const lastCheckedSlugRef = React.useRef<string>('');
  const isAbortError = React.useCallback((error: unknown) => {
    const err = error as { name?: string; message?: string };
    return err?.name === 'AbortError' || err?.message?.includes('AbortError');
  }, []);

  // Form Draft Logic
  const draftKey = `page_form_${id || 'new'}`;
  const [draft, setDraft, clearDraft] = useFormDraft<FormData | null>(draftKey, null);

  const {
    register,
    handleSubmit,
    control,
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
      title: '',
      slug: '',
      content: '',
      meta_title: '',
      meta_description: '',
      featured_image: '',
    },
  });

  // Watch all fields to save draft
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
  const { formatSlug, generateUniqueSlug } = useSlug({ table: 'pages' });
  const isSubmittingRef = React.useRef(false);
  const { blocker, showModal } = useFormGuard(isDirty, isSubmittingRef);

  const checkSlugAvailability = React.useCallback(async (slug: string) => {
    if (!slug) {
      setSlugStatus('idle');
      setSlugSuggestions([]);
      setSlugCheckError(null);
      return;
    }
    if (slug === lastCheckedSlugRef.current && slugStatus !== 'error') return;
    lastCheckedSlugRef.current = slug;
    setSlugStatus('checking');
    setSlugCheckError(null);
    try {
      let query = supabase
        .from('pages')
        .select('id', { count: 'exact', head: true })
        .eq('slug', slug);

      if (id) query = query.neq('id', id);

      const { count, error } = await query;
      if (error) throw error;

      if (count === 0) {
        setSlugStatus('available');
        setSlugSuggestions([]);
        return;
      }

      setSlugStatus('duplicate');

      const suggestions: string[] = [];
      for (let i = 2; i <= 8 && suggestions.length < 3; i += 1) {
        const candidate = `${slug}-${i}`;
        const { count: candidateCount, error: candidateError } = await supabase
          .from('pages')
          .select('id', { count: 'exact', head: true })
          .eq('slug', candidate);
        if (candidateError) throw candidateError;
        if ((candidateCount || 0) === 0) suggestions.push(candidate);
      }
      setSlugSuggestions(suggestions);
    } catch (error) {
      if (isAbortError(error)) {
        setSlugStatus('idle');
        setSlugSuggestions([]);
        setSlugCheckError(null);
        return;
      }
      console.error('Error checking slug availability:', error);
      setSlugStatus('error');
      setSlugCheckError('Falha ao verificar disponibilidade do slug.');
    }
  }, [id, isAbortError, slugStatus]);

  useEffect(() => {
    if (!debouncedSlug) return;
    checkSlugAvailability(debouncedSlug);
  }, [checkSlugAvailability, debouncedSlug]);

  const handleSlugBlur = async () => {
    const currentSlug = watch('slug');
    if (!currentSlug) {
      setSlugStatus('idle');
      return;
    }
    
    const formatted = formatSlug(currentSlug);
    if (formatted !== currentSlug) {
      setValue('slug', formatted, { shouldDirty: true });
    }
    checkSlugAvailability(formatted);
  };

  const handleManualGenerateSlug = async () => {
    if (!titleValue) {
      toast.error('Preencha o título primeiro.');
      return;
    }
    
    const uniqueSlug = await generateUniqueSlug(titleValue, id);
    setValue('slug', uniqueSlug, { shouldDirty: true });
    setSlugStatus('available');
    toast.success('Slug gerado com sucesso!');
  };

  const fetchPage = async (pageId: string) => {
    try {
      const { data: rawData, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
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
          content: data.content,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          featured_image: data.featured_image || '',
          published: data.published,
        });
      }
    } catch (error) {
      if (!isAbortError(error)) {
        console.error('Error fetching page:', error);
        toast.error('Erro ao carregar página');
        navigate('/admin/paginas');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPage(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const savePage = async (data: FormData): Promise<boolean> => {
    try {
      setLoading(true);
      const client = supabase as any;
      
      const pageData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      if (id) {
        const { data: saved, error } = await client
          .from('pages')
          .update(pageData)
          .eq('id', id)
          .select('*')
          .single();

        if (error) throw error;
        if (saved) updatePage(saved as any);
        toast.success('Página atualizada com sucesso!');
      } else {
        const { data: saved, error } = await client
          .from('pages')
          .insert(pageData)
          .select('*')
          .single();

        if (error) throw error;
        if (saved) updatePage(saved as any);
        toast.success('Página criada com sucesso!');
      }

      reset(data);
      clearDraft(); // Clear draft on success
      return true;
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Erro ao salvar página');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.error('Validation errors:', errors);
    const errorMessages = Object.values(errors)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((error: any) => error.message)
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
    const success = await savePage(data);
    if (success) {
      navigate('/admin/paginas');
    } else {
      isSubmittingRef.current = false;
    }
  };

  const handleSaveFromModal = async () => {
    await handleSubmit(async (data) => {
      isSubmittingRef.current = true;
      const success = await savePage(data);
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Carregando dados da página...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/paginas"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Editar Página' : 'Nova Página'}
          </h1>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={showModal}
        onSave={handleSaveFromModal}
        onDiscard={handleDiscard}
        onCancel={() => blocker.reset?.()}
      />

      <UnsavedChangesBar
        visible={isDirty && !showModal && isEditing}
        onSave={() => handleSubmit(onSubmit, onError)()}
        onReset={() => reset()}
        loading={loading}
      />

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Informações Principais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Título da página"
              />
              {errors.title && (
                <span className="text-red-500 text-sm">{errors.title.message}</span>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleManualGenerateSlug}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="Gerar slug baseado no título"
                >
                  <RefreshCw size={12} /> Gerar Automático
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  {...register('slug')}
                  onBlur={handleSlugBlur}
                  className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 ${
                    errors.slug || slugStatus === 'duplicate' ? 'border-red-500' : slugStatus === 'available' ? 'border-green-500' : 'border-gray-300'
                  }`}
                  placeholder="slug-da-pagina"
                />
                <div className="absolute right-3 top-2.5 flex items-center pointer-events-none">
                    {slugStatus === 'checking' ? (
                        <Loader2 className="animate-spin text-blue-500" size={16} />
                    ) : slugStatus === 'available' ? (
                        <CheckCircle className="text-green-500" size={16} />
                    ) : slugStatus === 'duplicate' || slugStatus === 'error' ? (
                        <AlertCircle className="text-red-500" size={16} />
                    ) : null}
                </div>
              </div>
              {slugStatus === 'duplicate' && (
                <div className="text-xs text-red-600 mt-1">
                  <div>Slug já existe.</div>
                  {slugSuggestions.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {slugSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setValue('slug', suggestion, { shouldDirty: true });
                            setSlugStatus('available');
                          }}
                          className="px-2 py-1 border border-red-200 rounded bg-red-50 text-red-700"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {slugStatus === 'error' && (
                <span className="text-xs text-orange-600 block mt-1">{slugCheckError}</span>
              )}
              {errors.slug && (
                <span className="text-red-500 text-sm block mt-1">{errors.slug.message}</span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Resumo e SEO</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breve Descrição (Exibida na listagem e SEO)
              </label>
              <textarea
                {...register('meta_description')}
                rows={3}
                maxLength={160}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                placeholder="Um breve resumo sobre a página..."
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${
                  (watch('meta_description')?.length || 0) > 160 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {watch('meta_description')?.length || 0}/160 caracteres
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title (Opcional)
              </label>
              <input
                type="text"
                {...register('meta_title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                placeholder="Título personalizado para motores de busca"
              />
            </div>

            <div className="mt-2">
              <SEOSnippetPreview
                title={watch('meta_title') || watch('title')}
                description={watch('meta_description') || ''}
                slug={watch('slug')}
              />
            </div>
          </div>

          <div>
            <ImageUpload
              label="Imagem Destacada"
              value={watch('featured_image')}
              onChange={(url) => setValue('featured_image', url, { shouldDirty: true })}
              folder="pages"
              error={errors.featured_image?.message}
              aspectRatio={840 / 500}
              minWidth={840}
              minHeight={500}
              description="Formato recomendado: 840x500px (Proporção 1.68:1)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo <span className="text-red-500">*</span>
            </label>
            <div className="prose max-w-none">
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-lg border border-gray-200" />}>
                    <TiptapEditor
                      value={field.value as string}
                      onChange={field.onChange}
                      placeholder="Conteúdo da página..."
                    />
                  </Suspense>
                )}
              />
            </div>
            {errors.content && (
              <span className="text-red-500 text-sm">{errors.content.message}</span>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              {...register('published')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700">
              Publicar página imediatamente
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            to="/admin/paginas"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || slugStatus === 'duplicate'}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Salvar Página
          </button>
        </div>
      </form>
    </div>
  );
};

export default PageForm;
