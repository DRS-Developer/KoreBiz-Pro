// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserForm from './Form';
import { useSilenceConsoleError } from '../../../tests/utils/silenceConsoleError';
import { toastMocks } from '../../../tests/utils/toastMocks';

const mocks = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  signUpMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigateMock,
  };
});

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: mocks.signUpMock,
    },
  },
}));

describe('Users Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  useSilenceConsoleError();

  it('valida campos obrigatórios e regras de senha', async () => {
    render(<UserForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Criar Usuário' }));

    await waitFor(() => {
      expect(screen.getByText('Nome completo é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('E-mail é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('A senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
      expect(screen.getByText('Confirmação de senha é obrigatória')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('joao@exemplo.com'), {
      target: { value: 'email-invalido' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('******')[0], {
      target: { value: '123' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('******')[1], {
      target: { value: '1234' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar Usuário' }));

    await waitFor(() => {
      expect(screen.getByText('E-mail inválido')).toBeInTheDocument();
      expect(screen.getByText('A senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
      expect(screen.getByText('As senhas devem coincidir')).toBeInTheDocument();
    });
  });

  it('submete com sucesso e navega para listagem', async () => {
    mocks.signUpMock.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });

    render(<UserForm />);

    fireEvent.change(screen.getByPlaceholderText('João Silva'), {
      target: { value: 'João QA' },
    });
    fireEvent.change(screen.getByPlaceholderText('joao@exemplo.com'), {
      target: { value: 'joao@qa.com' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('******')[0], {
      target: { value: 'senhaforte1' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('******')[1], {
      target: { value: 'senhaforte1' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'admin' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Criar Usuário' }));

    await waitFor(() => {
      expect(mocks.signUpMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'joao@qa.com',
          password: 'senhaforte1',
        })
      );
    });
    await waitFor(() => {
      expect(toastMocks.success).toHaveBeenCalled();
      expect(mocks.navigateMock).toHaveBeenCalledWith('/admin/usuarios');
    });
  });

  it('trata erro de submissão exibindo feedback', async () => {
    mocks.signUpMock.mockResolvedValue({
      data: null,
      error: { message: 'Usuário já existe' },
    });

    render(<UserForm />);

    fireEvent.change(screen.getByPlaceholderText('João Silva'), {
      target: { value: 'João QA' },
    });
    fireEvent.change(screen.getByPlaceholderText('joao@exemplo.com'), {
      target: { value: 'joao@qa.com' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('******')[0], {
      target: { value: 'senhaforte1' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('******')[1], {
      target: { value: 'senhaforte1' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Criar Usuário' }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith(expect.stringContaining('Erro ao criar usuário'));
    });
    expect(mocks.navigateMock).not.toHaveBeenCalled();
  });
});
