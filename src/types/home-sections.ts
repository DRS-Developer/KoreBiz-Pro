export type SectionVariant = 'default' | 'grid' | 'cards' | 'featured' | 'compact';

export interface SectionConfig {
  id: string;
  enabled: boolean;
  variant?: SectionVariant;
  props?: Record<string, unknown>;
}
