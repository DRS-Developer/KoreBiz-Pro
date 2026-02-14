import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Building, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { Database } from '../types/database.types';
import SEO from '../components/SEO';
import HomeSkeleton from '../components/Skeletons/HomeSkeleton';
import OptimizedImage from '../components/OptimizedImage';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useGlobalStore } from '../stores/useGlobalStore';

type Service = Database['public']['Tables']['services']['Row'];
type Portfolio = Database['public']['Tables']['portfolios']['Row'];

const Home: React.FC = () => {
  const { settings, whatsappLink, loading: loadingSettings } = useSiteSettings();
  
  // Use Global Store (Already Hydrated by AppLoader)
  const { services: allServices, portfolio: allProjects, isHydrated } = useGlobalStore();

  const services = allServices?.filter(s => s.published).slice(0, 3) || [];
  const featuredProjects = allProjects?.filter(p => p.published).slice(0, 3) || [];
  
  // Only settings loading matters now since data is instant
  const isGlobalLoading = loadingSettings || !isHydrated;

  // Helper to get icon based on service category (simple logic)
  const getServiceIcon = (category: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('elétrica') || cat.includes('energia')) return <Zap size={32} />;
    if (cat.includes('predial') || cat.includes('manutenção')) return <Building size={32} />;
    return <Wrench size={32} />;
  };

  if (isGlobalLoading) {
    return (
      <div className="relative">
        <HomeSkeleton />
        <div className="absolute top-4 right-4 bg-white/80 p-2 rounded shadow text-xs text-gray-500 z-50">
          Aguardando dados...
        </div>
      </div>
    );
    }
  
    const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Home"
        description={settings?.site_description || 'Excelência técnica e compromisso com a qualidade para sua empresa e residência. Especialistas em elétrica, hidráulica e manutenção predial.'}
        image={settings?.image_settings?.banner_url}
      />
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white py-24 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
          <OptimizedImage
            src={(settings?.image_settings as { banner_url?: string })?.banner_url || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop"} 
            alt="Banner Principal" 
            className="w-full h-full object-cover"
            priority={true}
          />
        </div>
        <div className="container mx-auto px-4 relative z-20">
          <motion.div 
            className="max-w-3xl"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {settings?.site_name || 'Soluções Completas em Instalações e Manutenção'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
              {settings?.site_description || 'Excelência técnica e compromisso com a qualidade para sua empresa e residência. Especialistas em elétrica, hidráulica e manutenção predial.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/contato" 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors text-center inline-flex items-center justify-center"
              >
                Solicitar Orçamento
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link 
                to="/servicos" 
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white font-bold py-3 px-8 rounded-lg transition-colors text-center"
              >
                Nossos Serviços
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Nossas Especialidades</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Oferecemos uma ampla gama de serviços técnicos com profissionais altamente qualificados.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {services.length > 0 ? (
              services.map((service) => (
                <motion.div 
                  key={service.id} 
                  variants={fadeInUp}
                  className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-blue-600 group"
                >
                  <div className="bg-blue-100 w-full h-48 flex items-center justify-center mb-6 overflow-hidden rounded-md group-hover:bg-blue-200 transition-colors">
                    {service.image_url ? (
                       <OptimizedImage
                         src={service.image_url} 
                         alt={service.title} 
                         className="w-full h-full object-cover"
                       />
                    ) : (
                      <span className="text-blue-600 group-hover:text-blue-800 transition-colors">
                        {getServiceIcon(service.category || '')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {service.short_description || 'Serviço especializado com garantia de qualidade e segurança.'}
                  </p>
                  <Link to={`/servicos/${service.slug}`} className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center">
                    Saiba mais <ArrowRight size={16} className="ml-1" />
                  </Link>
                </motion.div>
              ))
            ) : (
              // Fallback content if no services found
              <>
                <motion.div variants={fadeInUp} className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-blue-600 group">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                    <Zap className="text-blue-600 group-hover:text-white transition-colors" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Instalações Elétricas</h3>
                  <p className="text-gray-600 mb-4">
                    Projetos, instalações e manutenção de redes elétricas residenciais, comerciais e industriais.
                  </p>
                </motion.div>
                {/* ... other fallbacks ... */}
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Projects / Portfolio */}
      {featuredProjects.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Projetos Recentes</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Conheça alguns dos nossos trabalhos mais recentes.
              </p>
            </motion.div>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {featuredProjects.map((project) => (
                <Link key={project.id} to={`/portfolio/${project.slug}`} className="group block h-full">
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all h-full flex flex-col"
                  >
                    <div className="aspect-video bg-gray-200 overflow-hidden relative">
                      {project.image_url ? (
                        <div className="w-full h-full">
                           <OptimizedImage
                             src={project.image_url} 
                             alt={project.title} 
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                           />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Building size={48} />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">
                        {project.category}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
            <div className="text-center mt-12">
              <Link 
                to="/portfolio" 
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                Ver Todos os Projetos
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Teaser */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="md:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <OptimizedImage
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop" 
                alt="Sobre a ArsInstalações" 
                className="rounded-lg shadow-xl"
              />
            </motion.div>
            <motion.div 
              className="md:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h4 className="text-blue-600 font-bold uppercase tracking-wide mb-2">Sobre Nós</h4>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Compromisso com a Qualidade e Segurança</h2>
              <p className="text-lg text-gray-600 mb-6">
                A ArsInstalações nasceu com o propósito de oferecer serviços técnicos de alta qualidade, focando na segurança e satisfação total dos nossos clientes.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="text-green-500 mr-3" size={24} />
                  <span>Profissionais certificados e experientes</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="text-green-500 mr-3" size={24} />
                  <span>Atendimento personalizado e consultivo</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="text-green-500 mr-3" size={24} />
                  <span>Garantia em todos os serviços prestados</span>
                </li>
              </ul>
              <Link 
                to="/empresa" 
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-block"
              >
                Conheça Nossa História
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white text-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para começar seu projeto?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Entre em contato conosco hoje mesmo e solicite um orçamento sem compromisso. Nossa equipe está pronta para atender você.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/contato" 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-lg transition-colors text-lg"
              >
                Falar com um Especialista
              </Link>
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white font-bold py-4 px-10 rounded-lg transition-colors text-lg"
              >
                WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
