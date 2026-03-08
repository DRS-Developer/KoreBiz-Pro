// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeroTab from './HeroTab';
import { useSilenceConsoleError } from '../../../../tests/utils/silenceConsoleError';
import { toastMocks } from '../../../../tests/utils/toastMocks';

const mocks = vi.hoisted(() => ({
  getSectionMock: vi.fn(),
  updateSectionMock: vi.fn(),
}));

vi.mock('../../../../repositories/HomeContentRepository', () => ({
  HomeContentRepository: {
    getSection: mocks.getSectionMock,
    updateSection: mocks.updateSectionMock,
  },
}));

vi.mock('../../../../components/Admin/ImageUpload', async () => {
  const { createImageUploadMock } = await import('../../../../tests/utils/componentMocks');
  return createImageUploadMock('https://cdn.example/hero.png');
});
vi.mock('../../../../components/Skeletons/FormSkeleton', async () => {
  const { createFormSkeletonMock } = await import('../../../../tests/utils/componentMocks');
  return createFormSkeletonMock();
});

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
    expect(toastMocks.success).toHaveBeenCalledWith('Banner atualizado com sucesso!');
  });

  it('trata erro ao carregar conteúdo', async () => {
    mocks.getSectionMock.mockRejectedValue(new Error('falha'));
    render(<HeroTab />);

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith('Erro ao carregar conteúdo do banner.');
    });
  });
});
