// Sistema de Cores Centralizado
// Este arquivo contém todas as cores utilizadas na aplicação para garantir consistência e fidelidade visual.

export const THEME_COLORS = {
  // Cores Básicas
  white: '#ffffff',
  black: '#000000',

  // Escala de Cinza (Baseada no Tailwind Gray e valores customizados encontrados)
  gray: {
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af', // Usado em BackgroundControls
    500: '#6b7280',
    placeholder: '#adb5bd', // Cor específica encontrada no TiptapEditor
    sliderTrack: '#374151', // Usado no AdvancedImageEditorModal
  },

  // Cores Semânticas do Sistema (Baseadas no Tailwind)
  primary: {
    blue500: '#3b82f6', // Usado em BackgroundControls e Slider Thumb
    blue600: '#2563EB', // Primary Color Default
    blue900: '#1E3A8A', // PageHeader Overlay Base
  },
  
  status: {
    red500: '#ef4444',
    orange500: '#f97316',
    yellow500: '#eab308',
    green500: '#22c55e',
    violet500: '#8b5cf6',
    pink500: '#ec4899',
  },

  // Cores Específicas de Terceiros / Contextos Específicos
  google: {
    title: '#1a0dab',    // Azul dos títulos de busca do Google
    description: '#4d5156', // Cinza das descrições de busca do Google
  },

  // Cores de Editor de Imagem (Presets)
  editorPresets: [
    '#ffffff', // White
    '#000000', // Black
    '#f3f4f6', // Gray 100
    '#9ca3af', // Gray 400
    '#ef4444', // Red 500
    '#f97316', // Orange 500
    '#eab308', // Yellow 500
    '#22c55e', // Green 500
    '#3b82f6', // Blue 500
    '#8b5cf6', // Violet 500
    '#ec4899', // Pink 500
  ]
};

// Definições de opacidade usadas no sistema
export const OPACITY = {
  pageHeaderOverlay: 0.9, // 90%
};
