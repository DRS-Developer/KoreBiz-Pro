import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import OptimizedImage from '../../components/OptimizedImage';
import PageHeader from '../../components/PageHeader';
import { useGlobalStore } from '../../stores/useGlobalStore';
import HtmlContent from '../../components/HtmlContent';
import SEO from '../../components/SEO';

const AreasAtuacaoDetalhes: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { practiceAreas, isHydrated } = useGlobalStore();

  const area = useMemo(() => {
    if (!slug) return null;
    
    // Helper to slugify title for fallback matching
    const slugify = (text: string) => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    // Mapeamento de slugs legados/estáticos para títulos ou slugs do banco
    const legacyMappings: Record<string, string> = {
        'instalacoes-eletricas': 'Instalação Elétrica Residencial',
        'climatizacao': 'Instalação de Ar Condicionado',
        'automacao': 'Automação Residencial',
        'manutencao-predial': 'Manutenção Predial',
        'projetos-iluminacao': 'Projetos de Iluminação',
        'sistemas-seguranca': 'Sistemas de Segurança',
        'energia-solar': 'Energia Solar Fotovoltaica',
        'laudos-tecnicos': 'Laudos Técnicos e ART',
        // Adicionando mapeamentos para itens que podem não existir no banco
        'instalacoes-hidraulicas': 'Instalações Hidráulicas',
        'combate-a-incendio': 'Combate a Incêndio'
    };
    
    // Dados estáticos de fallback para itens críticos que podem não estar no banco
    const staticFallbackItems: Record<string, any> = {
        'instalacoes-eletricas': {
            id: 'static-eletrica',
            title: 'Instalação Elétrica Residencial',
            description: `
                <div class="space-y-8">
                    <p class="text-lg text-gray-700 leading-relaxed">
                        A KoreBiz-Pro oferece soluções completas em Instalações Elétricas, garantindo qualidade técnica e conformidade com todas as normas de segurança vigentes (NBR 5410). Nossa equipe é altamente qualificada para atender demandas de qualquer complexidade.
                    </p>
                    
                    <div>
                        <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span class="w-2 h-8 bg-blue-600 rounded mr-3"></span>
                            O que oferecemos
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
                                <span class="text-blue-600 mr-3 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </span>
                                <span class="text-gray-700 font-medium">Projetos elétricos residenciais e prediais</span>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
                                <span class="text-blue-600 mr-3 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </span>
                                <span class="text-gray-700 font-medium">Instalação e manutenção de quadros</span>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
                                <span class="text-blue-600 mr-3 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </span>
                                <span class="text-gray-700 font-medium">Troca de fiação e redimensionamento</span>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
                                <span class="text-blue-600 mr-3 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </span>
                                <span class="text-gray-700 font-medium">Instalação de tomadas e interruptores</span>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
                                <span class="text-blue-600 mr-3 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </span>
                                <span class="text-gray-700 font-medium">Aterramento e proteção (DPS)</span>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
                                <span class="text-blue-600 mr-3 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </span>
                                <span class="text-gray-700 font-medium">Laudos técnicos e inspeções</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-blue-50 p-8 rounded-xl border border-blue-100">
                        <h3 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600 mr-3"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                            Metodologia de Trabalho
                        </h3>
                        <p class="text-gray-700 leading-relaxed">
                            Trabalhamos com um processo estruturado que envolve diagnóstico técnico preciso, planejamento detalhado, execução supervisionada e testes rigorosos de qualidade antes da entrega final, assegurando a satisfação e segurança do cliente. Utilizamos materiais de primeira linha e seguimos rigorosamente os cronogramas estabelecidos.
                        </p>
                    </div>
                </div>
            `,
            image_url: '',
            link: '/areas-de-atuacao/instalacoes-eletricas',
            is_active: true,
            order_index: 1
        },
        'instalacoes-hidraulicas': {
            id: 'static-hidraulica',
            title: 'Instalações Hidráulicas',
            description: '<p>Realizamos projetos completos e execução de infraestrutura hidráulica, incluindo redes de água fria, água quente, esgoto sanitário e águas pluviais. Garantimos qualidade e conformidade com as normas técnicas vigentes.</p><ul><li>Redes de distribuição de água potável</li><li>Sistemas de aquecimento solar e a gás</li><li>Instalações de esgoto e ventilação</li><li>Sistemas de reaproveitamento de água de chuva</li><li>Manutenção e reparos hidráulicos</li></ul>',
            image_url: '',
            link: '/areas-de-atuacao/instalacoes-hidraulicas',
            is_active: true,
            order_index: 100
        },
        'combate-a-incendio': {
            id: 'static-incendio',
            title: 'Combate a Incêndio',
            description: '<p>Especialistas em segurança contra incêndio. Oferecemos instalação e manutenção de sistemas preventivos, garantindo a proteção do seu patrimônio e a segurança das pessoas.</p><ul><li>Instalação de hidrantes e mangotinhos</li><li>Sistemas de sprinklers (chuveiros automáticos)</li><li>Centrais de alarme e detecção de fumaça</li><li>Iluminação de emergência e sinalização</li><li>Manutenção preventiva e corretiva</li></ul>',
            image_url: '',
            link: '/areas-de-atuacao/combate-a-incendio',
            is_active: true,
            order_index: 101
        },
        'automacao': {
            id: 'static-automacao',
            title: 'Automação Residencial',
            description: '<p>Transforme sua casa em um ambiente inteligente, confortável e eficiente. Oferecemos soluções completas de automação residencial para controle de iluminação, climatização, áudio e vídeo, cortinas e muito mais.</p><ul><li>Controle de iluminação inteligente</li><li>Automação de cortinas e persianas</li><li>Sistemas de home theater e som ambiente</li><li>Integração com assistentes de voz</li><li>Controle de acesso e segurança</li></ul>',
            image_url: '',
            link: '/areas-de-atuacao/automacao',
            is_active: true,
            order_index: 102
        },
        'climatizacao': {
            id: 'static-climatizacao',
            title: 'Instalação de Ar Condicionado',
            description: '<p>Garanta o conforto térmico do seu ambiente com nossos serviços especializados em climatização. Realizamos instalação, manutenção e limpeza de ar condicionado para residências e empresas.</p><ul><li>Instalação de equipamentos Split, Cassete e Piso Teto</li><li>Manutenção preventiva e corretiva</li><li>Higienização e limpeza completa</li><li>Carga de gás e verificação de vazamentos</li><li>Projetos de climatização</li></ul>',
            image_url: '',
            link: '/areas-de-atuacao/climatizacao',
            is_active: true,
            order_index: 103
        }
    };

    const foundInStore = practiceAreas.find(p => {
        // 1. Try direct link match (best)
        if (p.link) {
            if (p.link.endsWith(`/${slug}`) || p.link === slug) {
                console.debug(`[AreasAtuacao] Match found by link for slug "${slug}":`, p.title);
                return true;
            }
        }
        
        // 2. Check legacy mappings
        if (legacyMappings[slug] && p.title === legacyMappings[slug]) {
            console.debug(`[AreasAtuacao] Match found by legacy mapping for slug "${slug}":`, p.title);
            return true;
        }

        // 3. Fallback: Try to match by slugified title
        const titleSlug = slugify(p.title);
        if (titleSlug === slug) {
            console.debug(`[AreasAtuacao] Match found by exact title slug for "${slug}":`, p.title);
            return true;
        }
        
        // 4. Loose match for plural/singular differences
        if (titleSlug.includes(slug) || slug.includes(titleSlug)) {
             console.debug(`[AreasAtuacao] Match found by loose title slug for "${slug}":`, p.title);
             return true;
        }

        return false;
    });

    // 5. Check static fallback
    if (staticFallbackItems[slug]) {
        console.debug(`[AreasAtuacao] Using static fallback for "${slug}"`);
        return staticFallbackItems[slug];
    }
    
    // Se o item foi encontrado no banco, mas a descrição é muito curta (placeholder ou incompleta),
    // podemos considerar usar o fallback estático se disponível para enriquecer.
    if (foundInStore && staticFallbackItems[slug] && (!foundInStore.description || foundInStore.description.length < 150)) {
        console.debug(`[AreasAtuacao] Enhancing existing item "${slug}" with static content due to short description`);
        return {
            ...foundInStore,
            description: staticFallbackItems[slug].description
        };
    }

    if (foundInStore) return foundInStore;

    return null;
  }, [practiceAreas, slug]);

  if (isHydrated && practiceAreas.length > 0 && !area) {
     // If hydrated, we have areas, but this specific one is missing -> 404
     return (
        <div className="flex flex-col min-h-screen">
            <PageHeader title="Área não encontrada" />
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-gray-600 mb-8">A área de atuação solicitada não foi encontrada.</p>
                <Link to="/areas-de-atuacao" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Voltar para lista
                </Link>
            </div>
        </div>
     );
  }

  if (!area) {
      // Loading state (waiting for hydration OR practiceAreas to be populated)
      return (
        <div className="flex flex-col min-h-screen">
            <div className="h-64 bg-gray-100 animate-pulse" />
            <div className="container mx-auto px-4 py-16">
                 <div className="h-8 bg-gray-100 rounded w-1/3 mb-8 animate-pulse" />
                 <div className="h-4 bg-gray-100 rounded w-full mb-4 animate-pulse" />
                 <div className="h-4 bg-gray-100 rounded w-full mb-4 animate-pulse" />
            </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title={area.title} 
        description={area.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || `Saiba mais sobre ${area.title}`}
        image={area.image_url || undefined}
      />
      {/* Header */}
      <PageHeader title={area.title}>
        <Link to="/areas-de-atuacao" className="text-blue-100 flex items-center mb-0 text-sm hover:text-white transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Voltar para Áreas de Atuação
        </Link>
      </PageHeader>

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {area.image_url && (
                <OptimizedImage
                src={area.image_url} 
                alt={area.title} 
                pageKey="areas:detail"
                role="hero"
                className="w-full h-96 object-cover rounded-xl shadow-lg mb-8"
                priority={true}
                effect=""
                />
            )}
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre esta área</h2>
              
              {/* Prioritize description (can contain HTML) */}
              <HtmlContent content={area.description || ''} />

              {/* Dynamic "What We Offer" Section */}
              {area.what_we_offer && area.what_we_offer.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="w-2 h-8 bg-blue-600 rounded mr-3"></span>
                        O que oferecemos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {area.what_we_offer.map((item: string, index: number) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
                                <span className="text-blue-600 mr-3 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </span>
                                <span className="text-gray-700 font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              {/* Dynamic "Methodology" Section */}
              {area.methodology && (
                <div className="mt-8 bg-blue-50 p-8 rounded-xl border border-blue-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mr-3"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                        Metodologia de Trabalho
                    </h3>
                    <HtmlContent content={area.methodology} className="text-gray-700 leading-relaxed" />
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar (Optional) */}
           <div className="lg:w-1/3 space-y-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Fale Conosco</h3>
                <p className="text-gray-600 mb-6">
                    Interessado em {area.title}? Entre em contato para um orçamento personalizado.
                </p>
                <Link to="/contato" className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Solicitar Orçamento
                </Link>
            </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AreasAtuacaoDetalhes;
