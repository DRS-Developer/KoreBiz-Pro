import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HomeContentRepository } from '../../../../repositories/HomeContentRepository';
import CtaTab from './CtaTab';

vi.mock('../../../../repositories/HomeContentRepository', () => ({
  HomeContentRepository: {
    getSection: vi.fn(),
    updateSection: vi.fn(),
  },
}));

describe('CtaTab', () => {
  const mockCtaData = {
    content: {
      title: 'Título CTA',
      description: 'Descrição CTA',
      primary_button_text: 'Botão 1',
      primary_button_link: '/link1',
      secondary_button_text: 'Botão 2',
      secondary_button_link: '/link2',
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (HomeContentRepository.getSection as any).mockImplementation((sectionId: string) => {
      if (sectionId === 'cta') return Promise.resolve(mockCtaData);
      return Promise.resolve(null);
    });
  });

  it('carrega e renderiza os dados do CTA', async () => {
    render(<CtaTab />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Título CTA')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Descrição CTA')).toBeInTheDocument();
    });
  });

  it('permite salvar após edição', async () => {
    render(<CtaTab />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Título CTA')).toBeInTheDocument();
    });

    const titleInput = screen.getByDisplayValue('Título CTA');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Novo Título');

    const saveButton = screen.getByRole('button', { name: /Salvar CTA/i });
    expect(saveButton).not.toBeDisabled();

    await userEvent.click(saveButton);

    expect(HomeContentRepository.updateSection).toHaveBeenCalledWith(
      'cta',
      expect.objectContaining({
        title: 'Novo Título',
      })
    );
  });
});
