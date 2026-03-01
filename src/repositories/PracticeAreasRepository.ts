
import { supabase } from '../lib/supabase';
import { PracticeArea } from '../types/home-content';

export const PracticeAreasRepository = {
  async getAll() {
    const { data, error } = await supabase
      .from('practice_areas')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data as PracticeArea[];
  },

  async getActive() {
    const { data, error } = await supabase
      .from('practice_areas')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data as PracticeArea[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('practice_areas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as PracticeArea;
  },

  async create(data: Omit<PracticeArea, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('practice_areas')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result as PracticeArea;
  },

  async update(id: string, data: Partial<Omit<PracticeArea, 'id' | 'created_at' | 'updated_at'>>) {
    const { data: result, error } = await supabase
      .from('practice_areas')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as PracticeArea;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('practice_areas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  
  async reorder(items: { id: string; order_index: number }[]) {
    // This could be optimized with a stored procedure or batch update
    // For now, simple loop is fine for small lists
    for (const item of items) {
      await supabase
        .from('practice_areas')
        .update({ order_index: item.order_index })
        .eq('id', item.id);
    }
  }
};
