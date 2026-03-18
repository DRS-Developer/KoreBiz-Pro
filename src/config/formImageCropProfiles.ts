export const FORM_IMAGE_CROP_KEYS = [
  'services.featured',
  'portfolio.cover',
  'portfolio.gallery',
  'pages.featured',
  'partners.logo',
  'practice-areas.image',
  'home.hero',
  'home.about',
  'settings.logo',
  'settings.og',
] as const;

export type FormImageCropKey = (typeof FORM_IMAGE_CROP_KEYS)[number];

export interface FormImageCropProfile {
  formKey: FormImageCropKey;
  label: string;
  description: string;
  aspectWidth: number;
  aspectHeight: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  isActive: boolean;
}

export interface ResolvedFormImageCropProfile extends FormImageCropProfile {
  aspectRatio: number;
}

export const DEFAULT_FORM_IMAGE_CROP_PROFILES: Record<FormImageCropKey, FormImageCropProfile> = {
  'services.featured': {
    formKey: 'services.featured',
    label: 'Serviços · Imagem destacada',
    description: 'Imagem principal dos cards e listagem de serviços.',
    aspectWidth: 4,
    aspectHeight: 3,
    minWidth: 800,
    minHeight: 600,
    maxWidth: 1920,
    maxHeight: 1440,
    isActive: true,
  },
  'portfolio.cover': {
    formKey: 'portfolio.cover',
    label: 'Portfólio · Capa do projeto',
    description: 'Imagem de destaque da página de detalhe do projeto.',
    aspectWidth: 84,
    aspectHeight: 50,
    minWidth: 840,
    minHeight: 500,
    maxWidth: 2520,
    maxHeight: 1500,
    isActive: true,
  },
  'portfolio.gallery': {
    formKey: 'portfolio.gallery',
    label: 'Portfólio · Galeria',
    description: 'Imagens adicionais da galeria de cada projeto.',
    aspectWidth: 4,
    aspectHeight: 3,
    minWidth: 800,
    minHeight: 600,
    maxWidth: 1920,
    maxHeight: 1440,
    isActive: true,
  },
  'pages.featured': {
    formKey: 'pages.featured',
    label: 'Páginas · Imagem destacada',
    description: 'Imagem principal para páginas institucionais.',
    aspectWidth: 84,
    aspectHeight: 50,
    minWidth: 840,
    minHeight: 500,
    maxWidth: 2520,
    maxHeight: 1500,
    isActive: true,
  },
  'partners.logo': {
    formKey: 'partners.logo',
    label: 'Parceiros · Logotipo',
    description: 'Logo exibido na seção de parceiros.',
    aspectWidth: 2,
    aspectHeight: 1,
    minWidth: 240,
    minHeight: 120,
    maxWidth: 1200,
    maxHeight: 600,
    isActive: true,
  },
  'practice-areas.image': {
    formKey: 'practice-areas.image',
    label: 'Áreas de Atuação · Imagem',
    description: 'Imagem ou ícone dos cards de áreas de atuação.',
    aspectWidth: 4,
    aspectHeight: 3,
    minWidth: 800,
    minHeight: 600,
    maxWidth: 1920,
    maxHeight: 1440,
    isActive: true,
  },
  'home.hero': {
    formKey: 'home.hero',
    label: 'Home · Hero',
    description: 'Imagem de fundo do banner principal da home.',
    aspectWidth: 16,
    aspectHeight: 9,
    minWidth: 1920,
    minHeight: 1080,
    maxWidth: 3840,
    maxHeight: 2160,
    isActive: true,
  },
  'home.about': {
    formKey: 'home.about',
    label: 'Home · Sobre nós',
    description: 'Imagem ilustrativa da seção Sobre Nós.',
    aspectWidth: 4,
    aspectHeight: 3,
    minWidth: 800,
    minHeight: 600,
    maxWidth: 1920,
    maxHeight: 1440,
    isActive: true,
  },
  'settings.logo': {
    formKey: 'settings.logo',
    label: 'Configurações · Logo do site',
    description: 'Logo institucional usado no cabeçalho e branding.',
    aspectWidth: 16,
    aspectHeight: 9,
    minWidth: 320,
    minHeight: 180,
    maxWidth: 1920,
    maxHeight: 1080,
    isActive: true,
  },
  'settings.og': {
    formKey: 'settings.og',
    label: 'Configurações · OG Image',
    description: 'Imagem para compartilhamento social e SEO.',
    aspectWidth: 1200,
    aspectHeight: 630,
    minWidth: 1200,
    minHeight: 630,
    maxWidth: 2400,
    maxHeight: 1260,
    isActive: true,
  },
};

export const getAspectRatio = (aspectWidth: number, aspectHeight: number): number => {
  if (aspectWidth <= 0 || aspectHeight <= 0) {
    return 16 / 9;
  }
  return aspectWidth / aspectHeight;
};

export const resolveFormImageCropProfile = (
  formKey: FormImageCropKey,
  override?: Partial<FormImageCropProfile> | null
): ResolvedFormImageCropProfile => {
  const base = DEFAULT_FORM_IMAGE_CROP_PROFILES[formKey];
  const merged: FormImageCropProfile = {
    ...base,
    ...override,
    formKey,
  };

  return {
    ...merged,
    aspectRatio: getAspectRatio(merged.aspectWidth, merged.aspectHeight),
  };
};
