import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MapPin, Phone, Mail, MessageSquare, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { toast } from 'sonner';
import { useSiteSettings } from '../hooks/useSiteSettings';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import PageHeader from '../components/PageHeader';

import LocationMap from '../components/LocationMap';

// Validation Schema
const schema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  subject: yup.string().required('Assunto é obrigatório'),
  message: yup.string().required('Mensagem é obrigatória').min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
}).required();

type FormData = yup.InferType<typeof schema>;

const Contato: React.FC = () => {
  const { displayAddress, displayPhone, whatsappLink, settings, loading: settingsLoading } = useSiteSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });
  
  const mapSettings = (settings?.map_settings as any) || { lat: -23.55052, lng: -46.633308, zoom: 15 };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-contact', {
        body: data
      });

      if (error) throw error;

      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Ocorreu um erro ao enviar sua mensagem. Tente novamente ou use o WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Fale Conosco" 
        description="Entre em contato com a ArsInstalações para solicitar um orçamento ou tirar dúvidas sobre nossos serviços de elétrica e manutenção."
      />

      {/* Header */}
      <PageHeader 
        title="Entre em Contato" 
        description="Estamos prontos para atender sua solicitação. Fale conosco." 
      />

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Info */}
          <div className="lg:w-1/3 space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Informações</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <MapPin className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Endereço</h4>
                    <div className="text-gray-600 whitespace-pre-line min-h-[1.5em]">
                      {settingsLoading ? (
                        <Skeleton width={200} />
                      ) : (
                        displayAddress
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Phone className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Telefone</h4>
                    <div className="text-gray-600 min-h-[1.5em]">
                      {settingsLoading ? <Skeleton width={150} /> : displayPhone}
                    </div>
                    <p className="text-gray-500 text-sm">Seg-Sex 8h às 18h</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Mail className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Email</h4>
                    <p className="text-gray-600">
                      {settingsLoading ? <Skeleton width={180} /> : (settings?.contact_email || 'contato@arsinstalacoes.com.br')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4">Atendimento via WhatsApp</h4>
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg"
                >
                  <MessageSquare className="mr-2" size={20} />
                  Iniciar Conversa
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="bg-gray-200 h-80 rounded-xl flex items-center justify-center text-gray-500 overflow-hidden">
              <LocationMap 
                  lat={mapSettings.lat} 
                  lng={mapSettings.lng} 
                  zoom={mapSettings.zoom} 
                  address={displayAddress} 
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Envie uma Mensagem</h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input 
                      type="text" 
                      id="name" 
                      {...register('name')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Seu nome"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      {...register('phone')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="(11) 99999-9999"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      {...register('email')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="seu@email.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                    <select 
                      id="subject" 
                      {...register('subject')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="Orçamento">Solicitar Orçamento</option>
                      <option value="Dúvida">Dúvida Técnica</option>
                      <option value="Trabalhe Conosco">Trabalhe Conosco</option>
                      <option value="Outros">Outros</option>
                    </select>
                    {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <textarea 
                    id="message" 
                    rows={5}
                    {...register('message')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Descreva sua solicitação com detalhes..."
                  ></textarea>
                  {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">Enviando...</span>
                  ) : (
                    <span className="flex items-center">Enviar Mensagem <Send className="ml-2" size={18} /></span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contato;
