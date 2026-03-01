import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Save, Loader2, MapPin, Phone, Mail, MessageSquare, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useSiteSettings } from '../../hooks/useSiteSettings';

interface ContactInfoEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const schema = yup
  .object({
    contact_email: yup.string().email('Email inválido').required('Email é obrigatório'),
    contact_phone: yup.string().required('Telefone é obrigatório'),
    address: yup.string().required('Endereço é obrigatório'),
    whatsapp: yup.string().nullable(),
    map_lat: yup.number().typeError('Latitude deve ser um número').required('Latitude é obrigatória'),
    map_lng: yup.number().typeError('Longitude deve ser um número').required('Longitude é obrigatória'),
    map_zoom: yup
      .number()
      .typeError('Zoom deve ser um número')
      .min(1, 'Zoom mínimo é 1')
      .max(20, 'Zoom máximo é 20')
      .required('Zoom é obrigatório'),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const ContactInfoEditor: React.FC<ContactInfoEditorProps> = ({ isOpen, onClose, onSuccess }) => {
  const { settings, refetch } = useSiteSettings();
  const [activeTab, setActiveTab] = React.useState<'info' | 'map'>('info');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
  });

  const mapZoom = watch('map_zoom');

  useEffect(() => {
    if (!isOpen || !settings) return;

    const mapSettings = (settings.map_settings as any) || {};
    reset({
      contact_email: settings.contact_email || '',
      contact_phone: settings.contact_phone || '',
      address: settings.address || '',
      whatsapp: (settings.social_links as any)?.whatsapp || '',
      map_lat: mapSettings.lat ?? -23.55052,
      map_lng: mapSettings.lng ?? -46.633308,
      map_zoom: mapSettings.zoom ?? 15,
    });
  }, [isOpen, settings, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!settings?.id) throw new Error('Configuração não encontrada');

      const { error } = await supabase
        .from('site_settings')
        .update({
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          address: data.address,
          social_links: {
            ...(settings?.social_links as object),
            whatsapp: data.whatsapp,
          },
          map_settings: {
            lat: data.map_lat,
            lng: data.map_lng,
            zoom: data.map_zoom,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast.success('Informações de contato atualizadas!');
      await refetch();
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error('Erro ao salvar alterações.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Editar Informações de Contato</h3>
          <button
            onClick={onClose}
            className="text-gray-400 p-1 rounded-full"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('info')}
          >
            Informações
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'map' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('map')}
          >
            Mapa de Localização
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {activeTab === 'info' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" /> Endereço
                </label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Rua Exemplo, 123 - Cidade/UF"
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Phone size={16} className="text-blue-600" /> Telefone
                  </label>
                  <input
                    type="text"
                    {...register('contact_phone')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="(11) 9999-9999"
                  />
                  {errors.contact_phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.contact_phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <MessageSquare size={16} className="text-green-600" /> WhatsApp
                  </label>
                  <input
                    type="text"
                    {...register('whatsapp')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Mail size={16} className="text-blue-600" /> Email de Contato
                </label>
                <input
                  type="email"
                  {...register('contact_email')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="contato@exemplo.com"
                />
                {errors.contact_email && <p className="text-sm text-red-500 mt-1">{errors.contact_email.message}</p>}
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <Globe size={16} className="mt-0.5 shrink-0" />
                  Para obter as coordenadas, vá ao Google Maps, clique com o botão direito no local desejado e copie os
                  números (Latitude, Longitude).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    {...register('map_lat')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="-23.55052"
                  />
                  {errors.map_lat && <p className="text-sm text-red-500 mt-1">{errors.map_lat.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    {...register('map_lng')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="-46.633308"
                  />
                  {errors.map_lng && <p className="text-sm text-red-500 mt-1">{errors.map_lng.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zoom Inicial (1-20)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    {...register('map_zoom')}
                    className="flex-1 h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <span className="w-12 text-center font-mono border rounded px-2 py-1 bg-gray-50 text-sm">
                    {typeof mapZoom === 'number' ? mapZoom : ''}
                  </span>
                </div>
                {errors.map_zoom && <p className="text-sm text-red-500 mt-1">{errors.map_zoom.message}</p>}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 size={18} /> : <Save size={18} />}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactInfoEditor;