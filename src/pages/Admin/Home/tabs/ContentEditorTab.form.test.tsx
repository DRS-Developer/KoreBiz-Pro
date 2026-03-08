// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContentEditorTab from './ContentEditorTab';
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
    <button type="button" onClick={() => onChange('https://cdn.example/about.png')}>
      mock-image-upload
    </button>
  ),
}));

vi.mock('../../../../components/Skeletons/FormSkeleton', () => ({
  default: () => <div>loading</div>,
}));

describe('ContentEditorTab Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSectionMock.mockImplementation(async (section: string) => {
      if (section === 'about') {
        return {
          content: {
            title: 'Sobre inicial',
            subtitle: 'Sub inicial',
            description: 'Desc inicial',
            image_url: 'https://cdn.example/old-about.png',
            button_text: 'Conheça',
            button_link: '/empresa',
            features: ['Atendimento 24h'],
          },
        };
      }
      return {
        content: {
          title: 'CTA inicial',
          description: 'CTA desc',
          primary_button_text: 'Contato',
          primary_button_link: '/contato',
          secondary_button_text: 'Serviços',
          secondary_button_link: '/servicos',
        },
      };
    });
  });
  useSilenceConsoleError();

  it('adiciona item em diferenciais e salva seção Sobre', async () => {
    mocks.updateSectionMock.mockResolvedValue(undefined);
    render(<ContentEditorTab />);

    await screen.findByDisplayValue('Sobre inicial');
    fireEvent.click(screen.getByRole('button', { name: /Adicionar Item/i }));
    expect(screen.getByDisplayValue('Novo diferencial')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Salvar "Sobre Nós"/i }));

    await waitFor(() => {
      expect(mocks.updateSectionMock).toHaveBeenCalledWith(
        'about',
        expect.objectContaining({
          title: 'Sobre inicial',
          features: expect.arrayContaining(['Atendimento 24h']),
        })
      );
    });
    expect(mocks.toastSuccessMock).toHaveBeenCalledWith('Seção "Sobre Nós" atualizada!');
  });

  it('trata erro ao salvar CTA', async () => {
    mocks.updateSectionMock.mockRejectedValue(new Error('falha'));
    render(<ContentEditorTab />);

    await screen.findByDisplayValue('CTA inicial');
    fireEvent.change(screen.getByDisplayValue('CTA inicial'), {
      target: { value: 'CTA alterado para teste' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar CTA' }));

    await waitFor(() => {
      expect(mocks.toastErrorMock).toHaveBeenCalledWith('Erro ao atualizar seção.');
    });
  });
});
