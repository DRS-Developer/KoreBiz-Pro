// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PartnersForm from './Form';
import { useSilenceConsoleError } from '../../../tests/utils/silenceConsoleError';
import { toastMocks } from '../../../tests/utils/toastMocks';

const mocks = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  createMock: vi.fn(),
  updateMock: vi.fn(),
  getByIdMock: vi.fn(),
}));
let currentId: string | undefined;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigateMock,
    useParams: () => ({ id: currentId }),
  };
});

vi.mock('../../../repositories/PartnersRepository', () => ({
  PartnersRepository: {
    create: mocks.createMock,
    update: mocks.updateMock,
    getById: mocks.getByIdMock,
  },
}));

vi.mock('../../../components/Admin/ImageUpload', async () => {
  const { createImageUploadMock } = await import('../../../tests/utils/componentMocks');
  return createImageUploadMock('https://cdn.example/logo.png');
});
vi.mock('../../../components/Skeletons/FormSkeleton', async () => {
  const { createFormSkeletonMock } = await import('../../../tests/utils/componentMocks');
  return createFormSkeletonMock();
});

describe('Partners Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentId = undefined;
  });
  useSilenceConsoleError();

  it('valida obrigatório de nome e impede envio vazio', async () => {
    render(<PartnersForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
    });
    expect(mocks.createMock).not.toHaveBeenCalled();
  });

  it('submete criação com sucesso', async () => {
    mocks.createMock.mockResolvedValue(undefined);
    render(<PartnersForm />);

    fireEvent.click(screen.getByRole('button', { name: 'mock-image-upload' }));
    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Parceiro QA' },
    });
    fireEvent.change(screen.getByPlaceholderText('https://...'), {
      target: { value: 'https://parceiro.com' },
    });
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(mocks.createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Parceiro QA',
          logo_url: 'https://cdn.example/logo.png',
          website_url: 'https://parceiro.com',
        })
      );
    });
    expect(toastMocks.success).toHaveBeenCalledWith('Parceiro criado!');
    expect(mocks.navigateMock).toHaveBeenCalledWith('/admin/parceiros');
  });

  it('trata erro ao salvar', async () => {
    mocks.createMock.mockRejectedValue(new Error('falhou'));
    render(<PartnersForm />);

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Parceiro QA' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith('Erro ao salvar.');
    });
    expect(mocks.navigateMock).not.toHaveBeenCalledWith('/admin/parceiros');
  });
});
