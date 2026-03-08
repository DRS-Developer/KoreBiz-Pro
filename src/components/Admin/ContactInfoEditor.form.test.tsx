// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactInfoEditor from './ContactInfoEditor';
import { useSilenceConsoleError } from '../../tests/utils/silenceConsoleError';
import { toastMocks } from '../../tests/utils/toastMocks';

const mocks = vi.hoisted(() => ({
  refetchMock: vi.fn(async () => {}),
  onCloseMock: vi.fn(),
  onSuccessMock: vi.fn(),
  fromMock: vi.fn(),
  updateMock: vi.fn(),
  eqMock: vi.fn(),
  settings: {
    id: 'settings-1',
    contact_email: 'contato@korebiz.com',
    contact_phone: '(11) 9999-9999',
    address: 'Rua Teste, 100',
    social_links: { whatsapp: '(11) 98888-7777' },
    map_settings: { lat: -23.5, lng: -46.6, zoom: 14 },
  },
}));

vi.mock('../../hooks/useSiteSettings', () => ({
  useSiteSettings: () => ({
    settings: mocks.settings,
    refetch: mocks.refetchMock,
  }),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: mocks.fromMock,
  },
}));

describe('ContactInfoEditor Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.eqMock.mockResolvedValue({ error: null });
    mocks.updateMock.mockReturnValue({ eq: mocks.eqMock });
    mocks.fromMock.mockReturnValue({ update: mocks.updateMock });
  });
  useSilenceConsoleError();

  it('valida formato de email', async () => {
    render(<ContactInfoEditor isOpen onClose={mocks.onCloseMock} onSuccess={mocks.onSuccessMock} />);

    fireEvent.change(screen.getByPlaceholderText('contato@exemplo.com'), {
      target: { value: 'invalido' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
    expect(mocks.fromMock).not.toHaveBeenCalled();
  });

  it('salva com sucesso e executa callbacks', async () => {
    render(<ContactInfoEditor isOpen onClose={mocks.onCloseMock} onSuccess={mocks.onSuccessMock} />);

    fireEvent.change(screen.getByPlaceholderText('contato@exemplo.com'), {
      target: { value: 'contato@korebiz.com.br' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() => {
      expect(mocks.fromMock).toHaveBeenCalledWith('site_settings');
      expect(mocks.updateMock).toHaveBeenCalled();
      expect(mocks.eqMock).toHaveBeenCalledWith('id', 'settings-1');
    });
    expect(toastMocks.success).toHaveBeenCalledWith('Informações de contato atualizadas!');
    expect(mocks.refetchMock).toHaveBeenCalled();
    expect(mocks.onSuccessMock).toHaveBeenCalled();
    expect(mocks.onCloseMock).toHaveBeenCalled();
  });

  it('trata erro de persistência', async () => {
    mocks.eqMock.mockResolvedValue({ error: { message: 'falha' } });
    render(<ContactInfoEditor isOpen onClose={mocks.onCloseMock} onSuccess={mocks.onSuccessMock} />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith('Erro ao salvar alterações.');
    });
    expect(mocks.onCloseMock).not.toHaveBeenCalled();
  });
});
