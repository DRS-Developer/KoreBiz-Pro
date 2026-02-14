export interface MediaFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  width?: number;
  height?: number;
  mime_type: string;
  folder: string; // 'services', 'portfolio', 'pages', 'settings', 'general'
  created_at: string;
}

export type MediaFolder = 'all' | 'services' | 'portfolio' | 'pages' | 'settings' | 'general' | 'partners';
