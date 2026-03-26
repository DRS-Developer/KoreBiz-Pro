import React from 'react';
import { SectionConfig, SectionVariant } from '../../types/home-sections';
import HeroDefault from './Sections/Hero/HeroDefault'; // Static import for LCP
import ServicesDefault from './Sections/Services/ServicesDefault';
import ProjectsDefault from './Sections/Projects/ProjectsDefault';
import AboutDefault from './Sections/About/AboutDefault';
import PartnersDefault from './Sections/Partners/PartnersDefault';
import ContactDefault from './Sections/Contact/ContactDefault';
import GalleryDefault from './Sections/Gallery/GalleryDefault';
import CTADefault from './Sections/CTA/CTADefault';
import GridDefault from './Sections/Grid/GridDefault';
import CardListDefault from './Sections/CardList/CardListDefault';
import FormEmbedDefault from './Sections/FormEmbed/FormEmbedDefault';
import TestimonialsDefault from './Sections/Testimonials/TestimonialsDefault';
import FaqDefault from './Sections/Faq/FaqDefault';
import StatsDefault from './Sections/Stats/StatsDefault';
import ProcessDefault from './Sections/Process/ProcessDefault';
import PricingDefault from './Sections/Pricing/PricingDefault';
import ComparisonDefault from './Sections/Comparison/ComparisonDefault';
import LogosWallDefault from './Sections/LogosWall/LogosWallDefault';
import CaseHighlightsDefault from './Sections/CaseHighlights/CaseHighlightsDefault';
import BeforeAfterDefault from './Sections/BeforeAfter/BeforeAfterDefault';
import FeatureTabsDefault from './Sections/FeatureTabs/FeatureTabsDefault';
import TeamCardsDefault from './Sections/TeamCards/TeamCardsDefault';
import TrustBadgesDefault from './Sections/TrustBadges/TrustBadgesDefault';
import MediaSplitDefault from './Sections/MediaSplit/MediaSplitDefault';
import IconFeaturesDefault from './Sections/IconFeatures/IconFeaturesDefault';
import ChecklistStepsDefault from './Sections/ChecklistSteps/ChecklistStepsDefault';
import QuoteHighlightDefault from './Sections/QuoteHighlight/QuoteHighlightDefault';
import MilestonesDefault from './Sections/Milestones/MilestonesDefault';
import DualCtaBandDefault from './Sections/DualCtaBand/DualCtaBandDefault';
import KpiStripDefault from './Sections/KpiStrip/KpiStripDefault';
import ImageQuoteDefault from './Sections/ImageQuote/ImageQuoteDefault';
import BenefitGridDefault from './Sections/BenefitGrid/BenefitGridDefault';
import MiniTimelineDefault from './Sections/MiniTimeline/MiniTimelineDefault';
import ValueCardsDefault from './Sections/ValueCards/ValueCardsDefault';
import QuickFactsDefault from './Sections/QuickFacts/QuickFactsDefault';
import FeatureBulletsDefault from './Sections/FeatureBullets/FeatureBulletsDefault';
import StatBannerDefault from './Sections/StatBanner/StatBannerDefault';
import OutcomeTilesDefault from './Sections/OutcomeTiles/OutcomeTilesDefault';
import HighlightListDefault from './Sections/HighlightList/HighlightListDefault';

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
  gallery: {
    default: GalleryDefault,
  },
  grid: {
    default: GridDefault,
  },
  'card-list': {
    default: CardListDefault,
  },
  'form-embed': {
    default: FormEmbedDefault,
  },
  testimonials: {
    default: TestimonialsDefault,
  },
  faq: {
    default: FaqDefault,
  },
  stats: {
    default: StatsDefault,
  },
  process: {
    default: ProcessDefault,
  },
  pricing: {
    default: PricingDefault,
  },
  comparison: {
    default: ComparisonDefault,
  },
  'logos-wall': {
    default: LogosWallDefault,
  },
  'case-highlights': {
    default: CaseHighlightsDefault,
  },
  'before-after': {
    default: BeforeAfterDefault,
  },
  'feature-tabs': {
    default: FeatureTabsDefault,
  },
  'team-cards': {
    default: TeamCardsDefault,
  },
  'trust-badges': {
    default: TrustBadgesDefault,
  },
  'media-split': {
    default: MediaSplitDefault,
  },
  'icon-features': {
    default: IconFeaturesDefault,
  },
  'checklist-steps': {
    default: ChecklistStepsDefault,
  },
  'quote-highlight': {
    default: QuoteHighlightDefault,
  },
  milestones: {
    default: MilestonesDefault,
  },
  'dual-cta-band': {
    default: DualCtaBandDefault,
  },
  'kpi-strip': {
    default: KpiStripDefault,
  },
  'image-quote': {
    default: ImageQuoteDefault,
  },
  'benefit-grid': {
    default: BenefitGridDefault,
  },
  'mini-timeline': {
    default: MiniTimelineDefault,
  },
  'value-cards': {
    default: ValueCardsDefault,
  },
  'quick-facts': {
    default: QuickFactsDefault,
  },
  'feature-bullets': {
    default: FeatureBulletsDefault,
  },
  'stat-banner': {
    default: StatBannerDefault,
  },
  'outcome-tiles': {
    default: OutcomeTilesDefault,
  },
  'highlight-list': {
    default: HighlightListDefault,
  },
  cta: {
    default: CTADefault,
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
