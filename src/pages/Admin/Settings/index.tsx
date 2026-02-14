import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Save, Globe, Mail, Phone, MapPin, Share2, Image as ImageIcon, RotateCcw, Database, FileText, Search, Layout, FileCode, ExternalLink, BarChart3, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import ImageUpload from '../../../components/Admin/ImageUpload';
import { useFormGuard } from '../../../hooks/useFormGuard';
import UnsavedChangesModal from '../../../components/Admin/UnsavedChangesModal';
import UnsavedChangesBar from '../../../components/Admin/UnsavedChangesBar';
import EmailSettingsTab from './EmailSettingsTab';
import AnalyticsSettingsTab from './AnalyticsSettingsTab';
import SettingsCard from './components/SettingsCard';
import SettingsModal from './components/SettingsModal';

const TiptapEditor = React.lazy(() => import('../../../components/Admin/TiptapEditor'));

const schema = yup.object({
  site_name: yup.string().required('O nome do site é obrigatório'),
  site_description: yup.string().nullable(),
  contact_email: yup.string().email('Email inválido').nullable(),
  contact_phone: yup.string().nullable(),
  address: yup.string().nullable(),
  logo_url: yup.string().url('URL inválida').nullable(),
  banner_url: yup.string().url('URL inválida').nullable(),
  facebook: yup.string().url('URL inválida').nullable(),
  instagram: yup.string().url('URL inválida').nullable(),
  linkedin: yup.string().url('URL inválida').nullable(),
  whatsapp: yup.string().nullable(),

  // Professional Fields (SEO, Legal, 404)
  privacy_policy: yup.string().nullable(),
  terms_of_use: yup.string().nullable(),
  seo_keywords: yup.string().nullable(),
  seo_title_suffix: yup.string().nullable(),
  not_found_title: yup.string().nullable(),
  not_found_message: yup.string().nullable(),
  indexing_enabled: yup.boolean(),
  
  // Email Settings
  email_settings: yup.object().nullable(),
  analytics_settings: yup.object().nullable(),

  // Image Settings
  max_upload_size_mb: yup.number().min(0.1, 'Mínimo 0.1MB').max(50, 'Máximo 50MB').required('Tamanho máximo é obrigatório'),
  output_formats: yup.array().of(yup.string()).min(1, 'Selecione pelo menos um formato').required(),
  
  // Global
  global_compression_level: yup.number().min(0).max(100).required(),
  global_resize_enabled: yup.boolean(),
  global_max_width: yup.number().when('global_resize_enabled', { is: true, then: (s) => s.required().min(100), otherwise: (s) => s.nullable() }),
  global_max_height: yup.number().when('global_resize_enabled', { is: true, then: (s) => s.required().min(100), otherwise: (s) => s.nullable() }),
  
  // Portfolio
  portfolio_resize_enabled: yup.boolean(),
  portfolio_max_width: yup.number().when('portfolio_resize_enabled', { is: true, then: (s) => s.required().min(100), otherwise: (s) => s.nullable() }),
  portfolio_max_height: yup.number().when('portfolio_resize_enabled', { is: true, then: (s) => s.required().min(100), otherwise: (s) => s.nullable() }),
  
  // Pages
  pages_resize_enabled: yup.boolean(),
  pages_max_width: yup.number().when('pages_resize_enabled', { is: true, then: (s) => s.required().min(100), otherwise: (s) => s.nullable() }),
  pages_max_height: yup.number().when('pages_resize_enabled', { is: true, then: (s) => s.required().min(100), otherwise: (s) => s.nullable() }),

  // Services
  services_resize_enabled: yup.boolean(),
  services_max_width: yup.number().when('services_resize_enabled', { is: true, then: (s) => s.required().min(100), otherwise: (s) => s.nullable() }),
  services_max_height: yup.number().when('services_resize_enabled', { is: true, then: (s) => s.required().min(100), otherwise: (s) => s.nullable() }),

  keep_aspect_ratio: yup.boolean(),
  keep_exif: yup.boolean(),
}).required();

type FormData = yup.InferType<typeof schema>;

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [activeTool, setActiveTool] = useState<string | null>(null);

  const methods = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      max_upload_size_mb: 5,
      output_formats: ['webp', 'jpeg'],
      global_compression_level: 80,
      global_resize_enabled: true,
      global_max_width: 1920,
      global_max_height: 1920,
      portfolio_resize_enabled: true,
      portfolio_max_width: 840,
      portfolio_max_height: 500,
      pages_resize_enabled: true,
      pages_max_width: 840,
      pages_max_height: 500,
      services_resize_enabled: true,
      services_max_width: 800,
      services_max_height: 600,
      keep_aspect_ratio: true,
      keep_exif: false,
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = methods;

  const globalResizeEnabled = watch('global_resize_enabled');
  const portfolioResizeEnabled = watch('portfolio_resize_enabled');
  const pagesResizeEnabled = watch('pages_resize_enabled');
  const servicesResizeEnabled = watch('services_resize_enabled');
  const globalCompressionLevel = watch('global_compression_level');
  
  const isSubmittingRef = React.useRef(false);
  const { blocker, showModal } = useFormGuard(isDirty, isSubmittingRef);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: rawData, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const data = rawData as any;

      if (data) {
        setSettingsId(data.id);
        const socialLinks = data.social_links as Record<string, string>;
        const imageSettings = data.image_settings as any;

        reset({
          site_name: data.site_name,
          site_description: data.site_description,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          address: data.address,
          logo_url: data.logo_url,
          facebook: socialLinks?.facebook || '',
          instagram: socialLinks?.instagram || '',
          linkedin: socialLinks?.linkedin || '',
          whatsapp: socialLinks?.whatsapp || '',
          banner_url: imageSettings?.banner_url || '',
          
          privacy_policy: data.privacy_policy || '',
          terms_of_use: data.terms_of_use || '',
          seo_keywords: data.seo_keywords || '',
          seo_title_suffix: data.seo_title_suffix || '',
          not_found_title: data.not_found_title || '',
          not_found_message: data.not_found_message || '',
          indexing_enabled: data.indexing_enabled !== false,
          
          email_settings: data.email_settings || {
            provider: 'emailjs',
            emailjs: { serviceId: '', templateId: '', publicKey: '' },
            supabase: { functionUrl: '', anonKey: '' }
          },
          analytics_settings: data.analytics_settings || {
            google_analytics_id: '',
            google_tag_manager_id: '',
            facebook_pixel_id: '',
            custom_head_scripts: '',
            custom_body_scripts: ''
          },

          max_upload_size_mb: imageSettings?.max_upload_size_mb ?? 5,
          output_formats: imageSettings?.output_formats ?? ['webp', 'jpeg'],
          
          global_compression_level: imageSettings?.global?.quality ?? imageSettings?.compression_level ?? 80,
          global_resize_enabled: imageSettings?.global?.enabled ?? imageSettings?.resize?.enabled ?? true,
          global_max_width: imageSettings?.global?.max_width ?? imageSettings?.resize?.max_width ?? 1920,
          global_max_height: imageSettings?.global?.max_height ?? imageSettings?.resize?.max_height ?? 1920,

          portfolio_resize_enabled: imageSettings?.contexts?.portfolio?.enabled ?? true,
          portfolio_max_width: imageSettings?.contexts?.portfolio?.max_width ?? 840,
          portfolio_max_height: imageSettings?.contexts?.portfolio?.max_height ?? 500,

          pages_resize_enabled: imageSettings?.contexts?.pages?.enabled ?? true,
          pages_max_width: imageSettings?.contexts?.pages?.max_width ?? 840,
          pages_max_height: imageSettings?.contexts?.pages?.max_height ?? 500,

          services_resize_enabled: imageSettings?.contexts?.services?.enabled ?? true,
          services_max_width: imageSettings?.contexts?.services?.max_width ?? 800,
          services_max_height: imageSettings?.contexts?.services?.max_height ?? 600,

          keep_aspect_ratio: imageSettings?.resize?.keep_aspect_ratio ?? true,
          keep_exif: imageSettings?.metadata?.keep_exif ?? false,
        });
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      if (error.code === '42501' || error.message?.includes('violates row-level security')) {
        toast.error('Erro de Permissão: Você não tem permissão para visualizar as configurações.');
      } else {
        toast.error('Erro ao carregar configurações');
      }
    }
  };

  const saveSettings = async (data: FormData): Promise<boolean> => {
    try {
      setLoading(true);

      const social_links = {
        facebook: data.facebook,
        instagram: data.instagram,
        linkedin: data.linkedin,
        whatsapp: data.whatsapp,
      };

      const image_settings = {
        banner_url: data.banner_url,
        max_upload_size_mb: data.max_upload_size_mb,
        output_formats: data.output_formats,
        global: {
          quality: data.global_compression_level,
          enabled: data.global_resize_enabled,
          max_width: data.global_max_width,
          max_height: data.global_max_height,
        },
        contexts: {
          portfolio: {
            enabled: data.portfolio_resize_enabled,
            max_width: data.portfolio_max_width,
            max_height: data.portfolio_max_height
          },
          pages: {
            enabled: data.pages_resize_enabled,
            max_width: data.pages_max_width,
            max_height: data.pages_max_height
          },
          services: {
            enabled: data.services_resize_enabled,
            max_width: data.services_max_width,
            max_height: data.services_max_height
          }
        },
        resize: {
          enabled: data.global_resize_enabled,
          max_width: data.global_max_width,
          max_height: data.global_max_height,
          keep_aspect_ratio: data.keep_aspect_ratio
        },
        metadata: {
          keep_exif: data.keep_exif
        }
      };

      const settingsData = {
        site_name: data.site_name,
        site_description: data.site_description,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        address: data.address,
        logo_url: data.logo_url,
        social_links,
        image_settings,
        privacy_policy: data.privacy_policy,
        terms_of_use: data.terms_of_use,
        seo_keywords: data.seo_keywords,
        seo_title_suffix: data.seo_title_suffix,
        not_found_title: data.not_found_title,
        not_found_message: data.not_found_message,
        indexing_enabled: data.indexing_enabled,
        email_settings: data.email_settings,
        analytics_settings: data.analytics_settings,
        updated_at: new Date().toISOString(),
      };

      if (settingsId) {
        const { error } = await supabase
          .from('site_settings')
          .update(settingsData as any)
          .eq('id', settingsId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert(settingsData as any);
        if (error) throw error;
        fetchSettings();
      }

      toast.success('Configurações salvas com sucesso!');
      reset(data);
      return true;
    } catch (error: any) {
      console.error('Error saving settings:', error);
      
      // Tratamento específico para erros do Supabase/Postgres
      if (error.code === '42501' || error.message?.includes('violates row-level security')) {
        toast.error('Erro de Permissão: Você não tem permissão para alterar as configurações do sistema. Verifique se seu usuário é administrador.');
      } else if (error.code === '23505') {
        toast.error('Erro: Já existe um registro de configurações. Tente atualizar o existente.');
      } else {
        toast.error('Erro ao salvar configurações: ' + (error.message || 'Erro desconhecido'));
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
    const success = await saveSettings(data);
    isSubmittingRef.current = false;
    if (success && activeTool) {
        setActiveTool(null);
    }
  };

  const handleSaveFromModal = async () => {
    await handleSubmit(async (data) => {
      isSubmittingRef.current = true;
      const success = await saveSettings(data);
      if (success) {
        blocker.proceed?.();
      } else {
        isSubmittingRef.current = false;
      }
    })();
  };

  const handleDiscard = () => {
    reset();
    blocker.proceed?.();
  };

  const handleRestoreDefaults = () => {
    setValue('max_upload_size_mb', 5);
    setValue('output_formats', ['webp', 'jpeg']);
    setValue('global_compression_level', 80);
    setValue('global_resize_enabled', true);
    setValue('global_max_width', 1920);
    setValue('global_max_height', 1920);
    setValue('portfolio_resize_enabled', true);
    setValue('portfolio_max_width', 840);
    setValue('portfolio_max_height', 500);
    setValue('pages_resize_enabled', true);
    setValue('pages_max_width', 840);
    setValue('pages_max_height', 500);
    setValue('services_resize_enabled', true);
    setValue('services_max_width', 800);
    setValue('services_max_height', 600);
    setValue('keep_aspect_ratio', true);
    setValue('keep_exif', false);
    toast.info('Valores padrão restaurados! Clique em Salvar para aplicar.');
  };

  const tools = [
    {
      id: 'general',
      title: 'Geral & Imagens',
      description: 'Nome do site, logo, contato, redes sociais e configurações de compressão de imagem.',
      icon: Globe,
      color: 'text-blue-600'
    },
    {
      id: 'appearance',
      title: 'Aparência & 404',
      description: 'Personalize a página de erro 404 e mensagens do sistema.',
      icon: Layout,
      color: 'text-purple-600'
    },
    {
      id: 'seo',
      title: 'SEO & Metadados',
      description: 'Gerencie indexação, palavras-chave e sitemaps.',
      icon: Search,
      color: 'text-green-600'
    },
    {
      id: 'legal',
      title: 'Páginas Legais',
      description: 'Edite a Política de Privacidade e Termos de Uso.',
      icon: FileText,
      color: 'text-orange-600'
    },
    {
      id: 'email',
      title: 'Serviço de E-mail',
      description: 'Configure provedores de envio (EmailJS, Supabase) e templates.',
      icon: Mail,
      color: 'text-red-600'
    },
    {
      id: 'analytics',
      title: 'Analytics & Scripts',
      description: 'Google Analytics, Tag Manager e scripts personalizados.',
      icon: BarChart3,
      color: 'text-indigo-600'
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Wrench className="text-gray-400" />
          Ferramentas do Sistema
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Central de configuração e manutenção do site.</p>
      </div>

      <UnsavedChangesModal
        isOpen={showModal}
        onSave={handleSaveFromModal}
        onDiscard={handleDiscard}
        onCancel={() => blocker.reset?.()}
      />

      <UnsavedChangesBar
        visible={isDirty && !activeTool}
        onSave={() => handleSubmit(onSubmit, onError)()}
        onReset={() => reset()}
        loading={loading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <SettingsCard
            key={tool.id}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            color={tool.color}
            onClick={() => setActiveTool(tool.id)}
          />
        ))}
      </div>

      {/* Shared Modal for all Tools */}
      <SettingsModal
        isOpen={!!activeTool}
        onClose={() => setActiveTool(null)}
        title={tools.find(t => t.id === activeTool)?.title || 'Configurações'}
        onSave={() => handleSubmit(onSubmit, onError)()}
        loading={loading}
      >
        <FormProvider {...methods}>
          <form className="space-y-6">
            
            {/* Conditional Rendering for Performance */}
            
            {activeTool === 'general' && (
              <>
                 {/* General Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                  <div className="flex items-center gap-2 border-b pb-4">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-medium text-gray-900">Informações Gerais</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Site</label>
                      <input type="text" {...register('site_name')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                      {errors.site_name && <p className="mt-1 text-sm text-red-600">{errors.site_name.message}</p>}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Site</label>
                      <textarea {...register('site_description')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>

                    <div className="col-span-2"><ImageUpload label="Logo do Site" value={watch('logo_url')} onChange={(url) => setValue('logo_url', url, { shouldValidate: true, shouldDirty: true })} folder="settings" error={errors.logo_url?.message} aspectRatio={1} minWidth={100} minHeight={100} description="Logo quadrado recomendado." /></div>
                    <div className="col-span-2"><ImageUpload label="Banner da Home" value={watch('banner_url')} onChange={(url) => setValue('banner_url', url, { shouldValidate: true, shouldDirty: true })} folder="settings" error={errors.banner_url?.message} aspectRatio={16 / 5} minWidth={1920} minHeight={600} description="Formato recomendado: 1920x600px (Proporção 16:5)" /></div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                  <div className="flex items-center gap-2 border-b pb-4">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-medium text-gray-900">Informações de Contato</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contato</label>
                      <input type="email" {...register('contact_email')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input type="text" {...register('contact_phone')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                      <input type="text" {...register('address')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                  <div className="flex items-center gap-2 border-b pb-4">
                    <Share2 className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-medium text-gray-900">Redes Sociais</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label><input type="text" {...register('facebook')} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label><input type="text" {...register('instagram')} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label><input type="text" {...register('linkedin')} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label><input type="text" {...register('whatsapp')} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                  </div>
                </div>

                {/* Image Settings */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-gray-500" />
                      <h2 className="text-lg font-medium text-gray-900">Configurações de Imagens</h2>
                    </div>
                    <button type="button" onClick={handleRestoreDefaults} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"><RotateCcw size={14} /> Restaurar Padrões</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho Máximo de Upload (MB)</label>
                      <input type="number" step="0.1" {...register('max_upload_size_mb')} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      {errors.max_upload_size_mb && <p className="mt-1 text-sm text-red-600">{errors.max_upload_size_mb.message}</p>}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Otimização Global (Qualidade: {globalCompressionLevel}%)</label>
                      <div className="flex items-center gap-4">
                        <input type="range" min="1" max="100" {...register('global_compression_level')} className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer" />
                        <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center overflow-hidden"><div style={{ filter: `blur(${(100 - globalCompressionLevel) / 20}px)` }} className="text-xs text-center text-gray-400">Preview</div></div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Formatos de Saída Permitidos</label>
                      <div className="flex flex-wrap gap-4">
                        {['webp', 'jpeg', 'png'].map(fmt => (
                          <label key={fmt} className="flex items-center space-x-2">
                            <input type="checkbox" value={fmt} {...register('output_formats')} className="rounded text-primary focus:ring-primary" />
                            <span className="uppercase text-sm text-gray-700">{fmt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2 space-y-6 mt-4">
                       <h3 className="font-medium text-gray-900 border-b pb-2">Regras de Redimensionamento</h3>
                       {[
                         { id: 'global', title: 'Padrão Global', desc: 'Usado quando não há regra específica.', enabled: globalResizeEnabled },
                         { id: 'portfolio', title: 'Portfólio', desc: 'Imagens de projetos e obras.', enabled: portfolioResizeEnabled },
                         { id: 'pages', title: 'Páginas', desc: 'Conteúdo de páginas institucionais.', enabled: pagesResizeEnabled },
                         { id: 'services', title: 'Serviços', desc: 'Imagens de serviços oferecidos.', enabled: servicesResizeEnabled },
                       ].map((ctx) => (
                         <div key={ctx.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input type="checkbox" {...register(`${ctx.id}_resize_enabled` as any)} className="rounded text-primary focus:ring-primary" />
                                      <span className="font-bold text-gray-800">{ctx.title}</span>
                                    </label>
                                    <p className="text-xs text-gray-500 ml-6">{ctx.desc}</p>
                                </div>
                            </div>
                            {ctx.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-gray-300">
                                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Largura Máx (px)</label><input type="number" {...register(`${ctx.id}_max_width` as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" /></div>
                                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Altura Máx (px)</label><input type="number" {...register(`${ctx.id}_max_height` as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" /></div>
                                </div>
                            )}
                         </div>
                       ))}
                    </div>

                    <div className="col-span-2 border-t pt-4">
                       <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" {...register('keep_exif')} className="rounded text-primary focus:ring-primary" />
                          <span className="font-medium text-gray-700">Manter Metadados EXIF</span>
                        </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTool === 'appearance' && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Layout className="w-5 h-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">Aparência & Página 404</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título da Página 404</label>
                    <input type="text" {...register('not_found_title')} placeholder="Ex: Página não encontrada" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem da Página 404</label>
                    <textarea {...register('not_found_message')} rows={3} placeholder="Ex: Desculpe, o conteúdo que você procura não existe." className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
            )}

            {activeTool === 'seo' && (
              <>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Search className="w-5 h-5 text-gray-500" />
                  <h2 className="text-lg font-medium text-gray-900">SEO & Metadados</h2>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                   <label className="flex items-start gap-3 cursor-pointer">
                      <div className="mt-1"><input type="checkbox" {...register('indexing_enabled')} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></div>
                      <div><span className="font-bold text-gray-900 block">Permitir Indexação nos Buscadores</span><span className="text-sm text-gray-600 block mt-1">Se desmarcado, adiciona <code>noindex</code>.</span></div>
                   </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Sufixo do Título do Site</label><input type="text" {...register('seo_title_suffix')} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                  <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Palavras-chave Globais</label><textarea {...register('seo_keywords')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                 <h2 className="text-lg font-medium text-gray-900">Arquivos de Indexação</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200"><h3 className="font-bold flex gap-2"><FileCode size={16}/> robots.txt</h3><a href="/robots.txt" target="_blank" className="text-blue-600 text-sm">Visualizar</a></div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200"><h3 className="font-bold flex gap-2"><Share2 size={16}/> sitemap.xml</h3><a href="/sitemap.xml" target="_blank" className="text-blue-600 text-sm">Visualizar</a></div>
                 </div>
              </div>
              </>
            )}

            {activeTool === 'legal' && (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                  <h2 className="text-lg font-medium text-gray-900">Política de Privacidade</h2>
                  <div className="prose max-w-none">
                    <React.Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-lg border border-gray-200" />}>
                      <TiptapEditor value={watch('privacy_policy') || ''} onChange={(content) => { if (content !== watch('privacy_policy')) setValue('privacy_policy', content, { shouldDirty: true }); }} placeholder="Digite a política de privacidade..." />
                    </React.Suspense>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                  <h2 className="text-lg font-medium text-gray-900">Termos de Uso</h2>
                  <div className="prose max-w-none">
                    <React.Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-lg border border-gray-200" />}>
                      <TiptapEditor value={watch('terms_of_use') || ''} onChange={(content) => { if (content !== watch('terms_of_use')) setValue('terms_of_use', content, { shouldDirty: true }); }} placeholder="Digite os termos de uso..." />
                    </React.Suspense>
                  </div>
                </div>
              </div>
            )}

            {activeTool === 'email' && <EmailSettingsTab />}
            {activeTool === 'analytics' && <AnalyticsSettingsTab />}

          </form>
        </FormProvider>
      </SettingsModal>
    </div>
  );
};

export default Settings;
