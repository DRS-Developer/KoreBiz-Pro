import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building } from 'lucide-react';
import OptimizedImage from '../../../OptimizedImage';
import HtmlContent from '../../../HtmlContent';
import { useGlobalStore } from '../../../../stores/useGlobalStore';
import { useShallow } from 'zustand/react/shallow';
import Carousel from '../../../Carousel';

interface ProjectsDefaultProps {
  slidesToShow?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
}

const ProjectsDefault: React.FC<ProjectsDefaultProps> = ({ slidesToShow = 3, autoplay = true, autoplaySpeed = 4000 }) => {
  const { portfolio: allProjects } = useGlobalStore(useShallow((state) => ({ portfolio: state.portfolio })));
  const featuredProjects = (allProjects || [])?.filter(p => p.published) || [];

  if (featuredProjects.length === 0) return null;

  const getSlideClass = (slides: number) => {
    switch(slides) {
        case 1: return "w-full";
        case 2: return "w-full md:w-1/2";
        case 4: return "w-full md:w-1/2 lg:w-1/4";
        case 3: 
        default: return "w-full md:w-1/2 lg:w-1/3";
    }
  };

  const slideClass = getSlideClass(slidesToShow);

  return (
    <section className="pt-12 pb-6 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Projetos Recentes</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conheça alguns dos nossos trabalhos mais recentes.
          </p>
        </div>
        
        <Carousel slideClassName={slideClass} slidesToShow={slidesToShow} autoplay={autoplay} autoplaySpeed={autoplaySpeed}>
          {featuredProjects.map((project, index) => (
            <Link key={project.id} to={`/portfolio/${project.slug}`} className="block h-full">
              <div className="bg-gray-100 rounded-xl overflow-hidden shadow-md h-full flex flex-col">
                <div className="aspect-video bg-gray-200 overflow-hidden relative shrink-0">
                  {project.image_url ? (
                    <div className="w-full h-full">
                       <OptimizedImage
                         src={project.image_url} 
                         alt={project.title} 
                         pageKey="portfolio:list"
                         role="card"
                         className="w-full h-full object-cover"
                         effect=""
                         priority={index < 4}
                       />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Building size={48} />
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">
                    {project.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {project.title}
                  </h3>
                  <HtmlContent 
                    content={project.description}
                    className="text-gray-600 line-clamp-2 mt-auto"
                  />
                </div>
              </div>
            </Link>
          ))}
        </Carousel>

        <div className="text-right mt-8">
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
  );
};

export default ProjectsDefault;
