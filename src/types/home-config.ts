export type HomeSectionId = 
  | "hero" 
  | "about" 
  | "valueProps" 
  | "services" 
  | "projects" 
  | "process" 
  | "testimonials" 
  | "partners" 
  | "stats" 
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
