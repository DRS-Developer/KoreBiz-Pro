// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';

const mocks = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  signInWithPasswordMock: vi.fn(),
  fromMock: vi.fn(),
  selectMock: vi.fn(),
  eqMock: vi.fn(),
  singleMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigateMock,
  };
});

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mocks.signInWithPasswordMock,
    },
    from: mocks.fromMock,
  },
}));

vi.mock('../../components/SEO', () => ({
  default: () => null,
}));

describe('Login Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.singleMock.mockResolvedValue({ data: { role: 'admin' }, error: null });
    mocks.eqMock.mockReturnValue({ single: mocks.singleMock });
    mocks.selectMock.mockReturnValue({ eq: mocks.eqMock });
    mocks.fromMock.mockReturnValue({ select: mocks.selectMock });
  });

  it('realiza login com sucesso e navega para dashboard', async () => {
    mocks.signInWithPasswordMock.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('admin@exemplo.com'), {
      target: { value: 'dev@korebiz.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'senhaforte123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(mocks.signInWithPasswordMock).toHaveBeenCalledWith({
        email: 'dev@korebiz.com',
        password: 'senhaforte123',
      });
    });

    await waitFor(() => {
      expect(mocks.navigateMock).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('mostra erro quando autenticação falha', async () => {
    mocks.signInWithPasswordMock.mockResolvedValue({
      data: null,
      error: { message: 'Credenciais inválidas' },
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('admin@exemplo.com'), {
      target: { value: 'dev@korebiz.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'errada' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
    expect(mocks.navigateMock).not.toHaveBeenCalled();
  });
});
