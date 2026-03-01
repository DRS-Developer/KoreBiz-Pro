
import { supabase } from '../lib/supabase';
import { Partner } from '../types/home-content';

export const PartnersRepository = {
  async getAll() {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data as Partner[];
  },

  async getActive() {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data as Partner[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Partner;
  },

  async create(data: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('partners')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result as Partner;
  },

  async update(id: string, data: Partial<Omit<Partner, 'id' | 'created_at' | 'updated_at'>>) {
    const { data: result, error } = await supabase
      .from('partners')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as Partner;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  
  async reorder(items: { id: string; order_index: number }[]) {
    for (const item of items) {
      await supabase
        .from('partners')
        .update({ order_index: item.order_index })
        .eq('id', item.id);
    }
  }
};
