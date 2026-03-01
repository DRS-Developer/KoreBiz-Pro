import React, { useEffect, useState } from 'react';
import { Target, Eye, Heart, Award, Users, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';
import RichTextRenderer from '../components/RichTextRenderer';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import HtmlContent from '../components/HtmlContent';
import PageSkeleton from '../components/Skeletons/PageSkeleton';
import PageHeader from '../components/PageHeader';
import { useGlobalStore } from '../stores/useGlobalStore';

type Page = Database['public']['Tables']['pages']['Row'];

const Empresa: React.FC = () => {
  const { pages } = useGlobalStore();
  
  // Memory First
  const memoryPage = pages?.find(p => p.slug === 'empresa');

  const [page, setPage] = useState<Page | undefined>(memoryPage);
  const [loading, setLoading] = useState(!memoryPage);

  useEffect(() => {
    if (memoryPage) {
        setPage(memoryPage);
        setLoading(false);
        return;
    }

    const fetchPage = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('slug', 'empresa')
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            if (data) setPage(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    fetchPage();
  }, [memoryPage]);

  // Safe access to sections
  const sections = (page?.sections as any) || {};
  
  const mission = sections.mission || { 
    title: 'Missão', 
    description: 'Proporcionar soluções técnicas de excelência em instalações e manutenção, garantindo segurança, eficiência e tranquilidade para nossos clientes através de um atendimento humanizado e competente.' 
  };
  
  const vision = sections.vision || { 
    title: 'Visão', 
    description: 'Ser reconhecida como a principal referência em qualidade e confiabilidade no setor de instalações e manutenção em todo o estado, expandindo nossa atuação com inovação e sustentabilidade.' 
  };
  
  const values = sections.values || { 
    title: 'Valores', 
    description: 'Ética, Transparência, Comprometimento com prazos, Segurança em primeiro lugar, Respeito ao meio ambiente e Valorização humana.' 
  };

  const defaultDifferentials = [
    { icon: Award, title: 'Qualidade Certificada', description: 'Seguimos rigorosamente as normas técnicas vigentes (ABNT/NBR).', index: 0 },
    { icon: Users, title: 'Equipe Especializada', description: 'Profissionais treinados e em constante atualização.', index: 1 },
    { icon: Clock, title: 'Pontualidade', description: 'Respeito absoluto aos prazos acordados em cronograma.', index: 2 },
    { icon: Target, title: 'Foco no Cliente', description: 'Atendimento personalizado para entender sua real necessidade.', index: 3 },
  ];

  const differentials = sections.differentials?.items ? 
    defaultDifferentials.map((def, idx) => ({
      ...def,
      title: sections.differentials.items[idx]?.title || def.title,
      description: sections.differentials.items[idx]?.description || def.description
    })) : defaultDifferentials;

  if (loading) {
    return <PageSkeleton />;
  }

  // Fallback to static content if no dynamic page found
  if (!page) {
    return (
      <div className="flex flex-col min-h-screen">
        <SEO 
          title="Sobre a Empresa" 
          description="Conheça a KoreBiz: nossa história, missão, visão e valores. Referência em qualidade e segurança em instalações e manutenção."
        />

        {/* Page Header */}
        <PageHeader 
          title="Sobre a Empresa" 
          description="Conheça a KoreBiz: nossa história, missão, visão e valores. Referência em qualidade e segurança em instalações e manutenção."
        />

        {/* Introduction */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-blue-900 mb-6">Nossa História</h2>
                <div className="prose text-gray-700">
                  <p className="mb-4">
                    Fundada em 2010, a KoreBiz surgiu da necessidade de oferecer serviços técnicos especializados com um nível superior de qualidade e profissionalismo no mercado de São Paulo.
                  </p>
                  <p className="mb-4">
                    Iniciamos nossas atividades focados em instalações elétricas residenciais, mas rapidamente expandimos nossa atuação para atender demandas corporativas e industriais, sempre mantendo o compromisso com a excelência técnica e a segurança.
                  </p>
                  <p>
                    Hoje, somos referência em instalações e manutenção predial, contando com uma equipe multidisciplinar capaz de atender projetos de alta complexidade, desde a concepção até a execução e manutenção contínua.
                  </p>
                </div>
              </div>
              <div className="md:w-1/2">
                <OptimizedImage
                  src={undefined}
                  alt="Equipe KoreBiz" 
                  pageKey="empresa"
                  role="card"
                  className="rounded-lg shadow-xl"
                  effect=""
                  priority={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Mission */}
              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="text-blue-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Missão</h3>
                <p className="text-gray-600">
                  Proporcionar soluções técnicas de excelência em instalações e manutenção, garantindo segurança, eficiência e tranquilidade para nossos clientes através de um atendimento humanizado e competente.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="text-blue-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Visão</h3>
                <p className="text-gray-600">
                  Ser reconhecida como a principal referência em qualidade e confiabilidade no setor de instalações e manutenção em todo o estado, expandindo nossa atuação com inovação e sustentabilidade.
                </p>
              </div>

              {/* Values */}
              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="text-blue-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Valores</h3>
                <p className="text-gray-600">
                  Ética, Transparência, Comprometimento com prazos, Segurança em primeiro lugar, Respeito ao meio ambiente e Valorização humana.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Por que escolher a KoreBiz?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Diferenciais que fazem a nossa empresa ser a parceira ideal para o seu projeto.
            </p>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="text-blue-600" size={28} />
                </div>
                <h4 className="text-xl font-bold mb-2">Qualidade Certificada</h4>
                <p className="text-gray-600">Seguimos rigorosamente as normas técnicas vigentes (ABNT/NBR).</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-blue-600" size={28} />
                </div>
                <h4 className="text-xl font-bold mb-2">Equipe Especializada</h4>
                <p className="text-gray-600">Profissionais treinados e em constante atualização.</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-blue-600" size={28} />
                </div>
                <h4 className="text-xl font-bold mb-2">Pontualidade</h4>
                <p className="text-gray-600">Respeito absoluto aos prazos acordados em cronograma.</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="text-blue-600" size={28} />
                </div>
                <h4 className="text-xl font-bold mb-2">Foco no Cliente</h4>
                <p className="text-gray-600">Atendimento personalizado para entender sua real necessidade.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Render Dynamic Content
  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title={page.meta_title || page.title} 
        description={page.meta_description || 'Saiba mais sobre a KoreBiz.'}
        image={page.featured_image || undefined}
      />

      {/* Page Header */}
      <PageHeader 
        title={page.title} 
        description={page.meta_description || undefined} 
      />

      {/* Dynamic Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {page.featured_image && (
            <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
              <OptimizedImage 
                src={page.featured_image} 
                alt={page.title} 
                pageKey="empresa"
                role="hero"
                className="w-full h-[400px] object-cover"
                priority={true}
                effect=""
              />
            </div>
          )}

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            {typeof page.content === 'string' ? (
              <HtmlContent content={page.content} className="prose max-w-none text-gray-700 prose-headings:text-blue-900 prose-a:text-blue-600" />
            ) : (
              <RichTextRenderer content={page.content as any} className="prose max-w-none text-gray-700 prose-headings:text-blue-900 prose-a:text-blue-600" />
            )}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values - Always Visible */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-blue-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{mission.title}</h3>
              <HtmlContent 
                content={mission.description}
                className="text-gray-600"
              />
            </div>

            {/* Vision */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="text-blue-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{vision.title}</h3>
              <HtmlContent 
                content={vision.description}
                className="text-gray-600"
              />
            </div>

            {/* Values */}
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-blue-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{values.title}</h3>
              <HtmlContent 
                content={values.description}
                className="text-gray-600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Kept Static for now as it's a specific layout component */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Por que escolher a KoreBiz?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Diferenciais que fazem a nossa empresa ser a parceira ideal para o seu projeto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {differentials.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-blue-600" size={28} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                  <HtmlContent content={item.description} className="text-gray-600" />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Empresa;
