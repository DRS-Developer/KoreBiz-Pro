import { supabase } from '../lib/supabase';
import { MediaFile } from '../types/media';

class MediaRepository {
  async getAll(): Promise<{ data: MediaFile[], error: any }> {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data: data as MediaFile[] || [], error };
  }

  async getByFolder(folder: string): Promise<{ data: MediaFile[], error: any }> {
    if (folder === 'all') {
      return this.getAll();
    }

    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('folder', folder)
      .order('created_at', { ascending: false });

    return { data: data as MediaFile[] || [], error };
  }
  
  async delete(id: string): Promise<{ error: any }> {
      const { error } = await supabase
          .from('media_files')
          .delete()
          .eq('id', id);
      return { error };
  }
}

export const mediaRepository = new MediaRepository();