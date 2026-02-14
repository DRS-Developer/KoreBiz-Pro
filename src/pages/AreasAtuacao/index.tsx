import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Building, Wrench, Droplet, Flame, Cpu, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const areas = [
  {
    id: 'eletrica',
    title: 'Instalações Elétricas',
    slug: 'instalacoes-eletricas',
    description: 'Projetos, execução e manutenção de sistemas elétricos de baixa e média tensão.',
    icon: <Zap size={40} className="text-blue-600" />,
  },
  {
    id: 'civil',
    title: 'Manutenção Predial',
    slug: 'manutencao-predial',
    description: 'Conservação e reparos estruturais, pintura, alvenaria e acabamentos.',
    icon: <Building size={40} className="text-blue-600" />,
  },
  {
    id: 'hidraulica',
    title: 'Instalações Hidráulicas',
    slug: 'instalacoes-hidraulicas',
    description: 'Redes de água fria, quente, esgoto e águas pluviais.',
    icon: <Droplet size={40} className="text-blue-600" />,
  },
  {
    id: 'incendio',
    title: 'Combate a Incêndio',
    slug: 'combate-a-incendio',
    description: 'Instalação e manutenção de hidrantes, sprinklers e sistemas de detecção.',
    icon: <Flame size={40} className="text-blue-600" />,
  },
  {
    id: 'automacao',
    title: 'Automação',
    slug: 'automacao',
    description: 'Sistemas inteligentes para controle de iluminação, acesso e climatização.',
    icon: <Cpu size={40} className="text-blue-600" />,
  },
  {
    id: 'ar-condicionado',
    title: 'Climatização',
    slug: 'climatizacao',
    description: 'Instalação, manutenção e limpeza de sistemas de ar condicionado.',
    icon: <Wrench size={40} className="text-blue-600" />,
  },
];

const AreasAtuacao: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader 
        title="Áreas de Atuação" 
        description="Conheça as especialidades técnicas onde a ArsInstalações se destaca." 
      />

      {/* Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {areas.map((area) => (
            <Link 
              key={area.id} 
              to={`/areas-de-atuacao/${area.slug}`}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full"
            >
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                {React.cloneElement(area.icon as React.ReactElement, { 
                  className: "text-blue-600 group-hover:text-white transition-colors" 
                })}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                {area.title}
              </h3>
              <p className="text-gray-600 mb-6 flex-grow">
                {area.description}
              </p>
              <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                Ver detalhes <ArrowRight size={16} className="ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AreasAtuacao;
