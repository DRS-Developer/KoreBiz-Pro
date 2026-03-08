// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeroTab from './HeroTab';
import { useSilenceConsoleError } from '../../../../tests/utils/silenceConsoleError';

const mocks = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  getSectionMock: vi.fn(),
  updateSectionMock: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccessMock,
    error: mocks.toastErrorMock,
  },
}));

vi.mock('../../../../repositories/HomeContentRepository', () => ({
  HomeContentRepository: {
    getSection: mocks.getSectionMock,
    updateSection: mocks.updateSectionMock,
  },
}));

vi.mock('../../../../components/Admin/ImageUpload', () => ({
  default: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange('https://cdn.example/hero.png')}>
      mock-image-upload
    </button>
  ),
}));

vi.mock('../../../../components/Skeletons/FormSkeleton', () => ({
  default: () => <div>loading</div>,
}));

describe('HeroTab Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSectionMock.mockResolvedValue({
      content: {
        title: 'Título inicial',
        description: 'Descrição inicial',
        primary_button_text: 'Fale Conosco',
        primary_button_link: '/contato',
        secondary_button_text: 'Serviços',
        secondary_button_link: '/servicos',
        background_image: 'https://cdn.example/hero-old.png',
      },
    });
  });
  useSilenceConsoleError();

  it('carrega dados e salva alterações com sucesso', async () => {
    mocks.updateSectionMock.mockResolvedValue(undefined);
    render(<HeroTab />);

    await screen.findByDisplayValue('Título inicial');
    fireEvent.change(screen.getByDisplayValue('Título inicial'), {
      target: { value: 'Novo título principal' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() => {
      expect(mocks.updateSectionMock).toHaveBeenCalledWith(
        'hero',
        expect.objectContaining({ title: 'Novo título principal' })
      );
    });
    expect(mocks.toastSuccessMock).toHaveBeenCalledWith('Banner atualizado com sucesso!');
  });

  it('trata erro ao carregar conteúdo', async () => {
    mocks.getSectionMock.mockRejectedValue(new Error('falha'));
    render(<HeroTab />);

    await waitFor(() => {
      expect(mocks.toastErrorMock).toHaveBeenCalledWith('Erro ao carregar conteúdo do banner.');
    });
  });
});
