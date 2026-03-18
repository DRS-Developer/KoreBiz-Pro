export type HomeSectionId = 
  | "hero" 
  | "about" 
  | "valueProps" 
  | "services" 
  | "projects" 
  | "gallery"
  | "grid"
  | "card-list"
  | "form-embed"
  | "process" 
  | "testimonials" 
  | "partners" 
  | "stats" 
  | "pricing"
  | "comparison"
  | "logos-wall"
  | "case-highlights"
  | "before-after"
  | "feature-tabs"
  | "team-cards"
  | "trust-badges"
  | "media-split"
  | "icon-features"
  | "checklist-steps"
  | "quote-highlight"
  | "milestones"
  | "dual-cta-band"
  | "kpi-strip"
  | "image-quote"
  | "benefit-grid"
  | "mini-timeline"
  | "value-cards"
  | "quick-facts"
  | "feature-bullets"
  | "stat-banner"
  | "outcome-tiles"
  | "highlight-list"
  | "faq" 
  | "cta" 
  | "contact";

export type SectionVariant = "default" | string;

export interface SectionConfig {
  id: HomeSectionId;
  enabled: boolean;
  variant?: SectionVariant;
  props?: Record<string, any>;
  order?: number; // Optional, order is usually determined by array position
}

export interface HomeConfig {
  sections: SectionConfig[];
}

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  sections: [
    { id: "hero", enabled: true, variant: "default" },
    { id: "services", enabled: true, variant: "default" }, // Practice Areas / Services
    { id: "projects", enabled: true, variant: "default" },
    { id: "about", enabled: true, variant: "default" },
    { id: "partners", enabled: true, variant: "default" },
    { id: "contact", enabled: true, variant: "default", props: { showMap: true } }
  ]
};
