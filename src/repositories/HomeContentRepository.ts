
import { supabase } from '../lib/supabase';
import { HomeContent, HeroContent, AboutContent, CTAContent } from '../types/home-content';

export const HomeContentRepository = {
  async getSection(key: string) {
    const { data, error } = await supabase
      .from('home_content')
      .select('*')
      .eq('section_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as HomeContent;
  },

  async updateSection(key: string, content: HeroContent | AboutContent | CTAContent | any) {
    // First check if it exists
    const { data: existing } = await supabase
      .from('home_content')
      .select('id')
      .eq('section_key', key)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('home_content')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('section_key', key)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('home_content')
        .insert({ section_key: key, content })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    }
  }
};
