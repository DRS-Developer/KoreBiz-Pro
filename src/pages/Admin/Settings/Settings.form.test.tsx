// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Settings from './index';
import { useSilenceConsoleError } from '../../../tests/utils/silenceConsoleError';

const mocks = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastInfoMock: vi.fn(),
  fromMock: vi.fn(),
  selectMock: vi.fn(),
  limitMock: vi.fn(),
  singleMock: vi.fn(),
  updateMock: vi.fn(),
  eqMock: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccessMock,
    error: mocks.toastErrorMock,
    info: mocks.toastInfoMock,
  },
}));

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: mocks.fromMock,
  },
}));

vi.mock('../../../hooks/useFormGuard', () => ({
  useFormGuard: () => ({
    blocker: { proceed: vi.fn(), reset: vi.fn() },
    showModal: false,
  }),
}));

vi.mock('../../../components/Admin/ImageUpload', () => ({
  default: () => <div>mock-image-upload</div>,
}));

vi.mock('./EmailSettingsTab', () => ({ default: () => <div>email-tab</div> }));
vi.mock('./AnalyticsSettingsTab', () => ({ default: () => <div>analytics-tab</div> }));
vi.mock('./MenuSidebarTab', () => ({ default: () => <div>menu-tab</div> }));

describe('Settings Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.singleMock.mockResolvedValue({
      data: {
        id: 'settings-id',
        site_name: 'KoreBiz',
        social_links: {},
        image_settings: {},
        layout_settings: {},
      },
      error: null,
    });
    mocks.limitMock.mockReturnValue({ single: mocks.singleMock });
    mocks.selectMock.mockReturnValue({ limit: mocks.limitMock });
    mocks.eqMock.mockResolvedValue({ error: null });
    mocks.updateMock.mockReturnValue({ eq: mocks.eqMock });
    mocks.fromMock.mockImplementation((table: string) => {
      if (table === 'site_settings') {
        return {
          select: mocks.selectMock,
          update: mocks.updateMock,
        };
      }
      return {};
    });
  });
  useSilenceConsoleError();

  it('abre ferramenta de imagens e salva com sucesso', async () => {
    render(<Settings />);

    await screen.findByText('Configurações de Imagens');
    fireEvent.click(screen.getByText('Configurações de Imagens'));
    fireEvent.click(await screen.findByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() => {
      expect(mocks.fromMock).toHaveBeenCalledWith('site_settings');
      expect(mocks.updateMock).toHaveBeenCalled();
      expect(mocks.eqMock).toHaveBeenCalledWith('id', 'settings-id');
    });
    expect(mocks.toastSuccessMock).toHaveBeenCalledWith('Configurações salvas com sucesso!');
  });

  it('trata erro de permissão no salvamento', async () => {
    mocks.eqMock.mockResolvedValue({
      error: { code: '42501', message: 'violates row-level security' },
    });
    render(<Settings />);

    await screen.findByText('Configurações de Imagens');
    fireEvent.click(screen.getByText('Configurações de Imagens'));
    fireEvent.click(await screen.findByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() => {
      expect(mocks.toastErrorMock).toHaveBeenCalledWith(
        'Erro de Permissão: Você não tem permissão para alterar as configurações do sistema. Verifique se seu usuário é administrador.'
      );
    });
  });
});
