import React from 'react';
import { SectionConfig, SectionVariant } from '../../types/home-config';
import HeroDefault from './Sections/Hero/HeroDefault'; // Static import for LCP
import ServicesDefault from './Sections/Services/ServicesDefault';
import ProjectsDefault from './Sections/Projects/ProjectsDefault';
import AboutDefault from './Sections/About/AboutDefault';
import PartnersDefault from './Sections/Partners/PartnersDefault';
import ContactDefault from './Sections/Contact/ContactDefault';

// Registry mapping
const SECTION_REGISTRY: Record<string, Record<string, React.ComponentType<any>>> = {
  hero: {
    default: HeroDefault,
  },
  services: {
    default: ServicesDefault,
    grid: ServicesDefault, // Alias
  },
  projects: {
    default: ProjectsDefault,
  },
  about: {
    default: AboutDefault,
  },
  partners: {
    default: PartnersDefault,
  },
  contact: {
    default: ContactDefault,
  }
};

function getComponent(id: string, variant: SectionVariant = 'default') {
  const sectionGroup = SECTION_REGISTRY[id];
  if (!sectionGroup) return null;
  
  return sectionGroup[variant] || sectionGroup['default'] || null;
}

interface HomeBuilderProps {
  sections: SectionConfig[];
}

const HomeBuilder: React.FC<HomeBuilderProps> = ({ sections }) => {
  // Safety check for sections
  if (!sections || !Array.isArray(sections)) {
    console.error('HomeBuilder received invalid sections:', sections);
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {sections
        .filter(section => section && section.enabled) // Check section existence
        .map((section, index) => {
          const Component = getComponent(section.id, section.variant);
          
          if (!Component) {
            console.warn(`Component not found for section: ${section.id} (${section.variant})`);
            return null;
          }

          // Render component directly without Suspense to avoid flickering
          return <Component key={`${section.id}-${index}`} {...(section.props || {})} />;
        })}
    </div>
  );
};

export default HomeBuilder;
