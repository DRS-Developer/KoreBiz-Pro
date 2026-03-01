export type ImageRole = 'hero' | 'card' | 'thumb' | 'logo';
export type PageKey =
  | 'home'
  | 'empresa'
  | 'areas:list'
  | 'areas:detail'
  | 'servicos:list'
  | 'servicos:detail'
  | 'portfolio:list'
  | 'portfolio:detail'
  | 'parceiros'
  | 'contato';

export interface ImageSize {
  width: number;
  height: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
}

export type ImageProfile = Record<ImageRole, ImageSize>;

export const IMAGE_PROFILES: Record<PageKey, ImageProfile> = {
  home: {
    hero: { width: 1600, height: 900, quality: 80, resize: 'cover' },
    card: { width: 800, height: 600, quality: 80, resize: 'cover' },
    thumb: { width: 400, height: 300, quality: 80, resize: 'cover' },
    logo: { width: 240, height: 120, quality: 80, resize: 'contain' },
  },
  empresa: {
    hero: { width: 1600, height: 900, quality: 80, resize: 'cover' },
    card: { width: 800, height: 600, quality: 80, resize: 'cover' },
    thumb: { width: 400, height: 300, quality: 80, resize: 'cover' },
    logo: { width: 240, height: 120, quality: 80, resize: 'contain' },
  },
  'areas:list': {
    hero: { width: 1280, height: 640, quality: 80, resize: 'cover' },
    card: { width: 600, height: 400, quality: 80, resize: 'cover' },
    thumb: { width: 320, height: 200, quality: 80, resize: 'cover' },
    logo: { width: 240, height: 120, quality: 80, resize: 'contain' },
  },
  'areas:detail': {
    hero: { width: 1600, height: 800, quality: 80, resize: 'cover' },
    card: { width: 800, height: 500, quality: 80, resize: 'cover' },
    thumb: { width: 400, height: 250, quality: 80, resize: 'cover' },
    logo: { width: 240, height: 120, quality: 80, resize: 'contain' },
  },
  'servicos:list': {
    hero: { width: 1280, height: 640, quality: 80, resize: 'cover' },
    card: { width: 600, height: 400, quality: 80, resize: 'cover' },
    thumb: { width: 320, height: 200, quality: 80, resize: 'cover' },
    logo: { width: 240, height: 120, quality: 80, resize: 'contain' },
  },
  'servicos:detail': {
    hero: { width: 1600, height: 800, quality: 80, resize: 'cover' },
    card: { width: 800, height: 500, quality: 80, resize: 'cover' },
    thumb: { width: 400, height: 250, quality: 80, resize: 'cover' },
    logo: { width: 240, height: 120, quality: 80, resize: 'contain' },
  },
  'portfolio:list': {
    hero: { width: 1280, height: 640, quality: 80, resize: 'cover' },
    card: { width: 600, height: 400, quality: 80, resize: 'cover' },
    thumb: { width: 320, height: 200, quality: 80, resize: 'cover' },
    logo: { width: 240, height: 120, quality: 80, resize: 'contain' },
  },
  'portfolio:detail': {
    hero: { width: 1600, height: 900, quality: 80, resize: 'cover' },
    card: { width: 800, height: 600, quality: 80, resize: 'cover' },
    thumb: { width: 400, height: 300, quality: 80, resize: 'cover' },
    logo: { width: 240, height: 120, quality: 80, resize: 'contain' },
  },
  parceiros: {
    hero: { width: 1280, height: 640, quality: 80, resize: 'cover' },
    card: { width: 400, height: 250, quality: 80, resize: 'contain' },
    thumb: { width: 240, height: 150, quality: 80, resize: 'contain' },
    logo: { width: 240, height: 120, quality: 80, resize: 'contain' },
  },
  contato: {
    hero: { width: 1280, height: 640, quality: 80, resize: 'cover' },
    card: { width: 600, height: 400, quality: 80, resize: 'cover' },
    thumb: { width: 320, height: 200, quality: 80, resize: 'cover' },
    logo: { width: 240, height: 120, quality: 80, resize: 'contain' },
  },
};

export interface ManagedImageResult {
  original: string;
  webp: string;
}
