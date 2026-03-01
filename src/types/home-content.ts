
export interface HomeContent {
  id: string;
  section_key: string;
  content: any; // Using any for flexibility with JSONB, but can be typed more strictly
  updated_at: string;
}

export interface PracticeArea {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  order_index: number;
  is_active: boolean;
  what_we_offer?: string[]; // Array of strings for the list
  methodology?: string; // HTML string or rich text for methodology
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroContent {
  title: string;
  description: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  background_image: string;
}

export interface AboutContent {
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  features: string[];
}

export interface CTAContent {
  title: string;
  description: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
}
