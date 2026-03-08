// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ContactInfoEditor from './ContactInfoEditor';

const mocks = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
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

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccessMock,
    error: mocks.toastErrorMock,
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
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.eqMock.mockResolvedValue({ error: null });
    mocks.updateMock.mockReturnValue({ eq: mocks.eqMock });
    mocks.fromMock.mockReturnValue({ update: mocks.updateMock });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

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
    expect(mocks.toastSuccessMock).toHaveBeenCalledWith('Informações de contato atualizadas!');
    expect(mocks.refetchMock).toHaveBeenCalled();
    expect(mocks.onSuccessMock).toHaveBeenCalled();
    expect(mocks.onCloseMock).toHaveBeenCalled();
  });

  it('trata erro de persistência', async () => {
    mocks.eqMock.mockResolvedValue({ error: { message: 'falha' } });
    render(<ContactInfoEditor isOpen onClose={mocks.onCloseMock} onSuccess={mocks.onSuccessMock} />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() => {
      expect(mocks.toastErrorMock).toHaveBeenCalledWith('Erro ao salvar alterações.');
    });
    expect(mocks.onCloseMock).not.toHaveBeenCalled();
  });
});
