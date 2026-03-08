// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PracticeAreasForm from './Form';
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

vi.mock('../../../repositories/PracticeAreasRepository', () => ({
  PracticeAreasRepository: {
    create: mocks.createMock,
    update: mocks.updateMock,
    getById: mocks.getByIdMock,
  },
}));

vi.mock('../../../components/Admin/ImageUpload', () => ({
  default: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange('https://cdn.example/area.png')}>
      mock-image-upload
    </button>
  ),
}));

vi.mock('../../../components/Skeletons/FormSkeleton', () => ({
  default: () => <div>loading</div>,
}));

vi.mock('react-quill-new', () => ({
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="mock-quill"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe('PracticeAreas Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentId = undefined;
  });
  useSilenceConsoleError();

  it('valida título obrigatório', async () => {
    render(<PracticeAreasForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(screen.getByText('Título é obrigatório')).toBeInTheDocument();
    });
    expect(mocks.createMock).not.toHaveBeenCalled();
  });

  it('adiciona e remove item de "o que oferecemos"', async () => {
    render(<PracticeAreasForm />);

    fireEvent.change(
      screen.getByPlaceholderText('Adicionar item (ex: Projetos elétricos residenciais)'),
      { target: { value: 'Projetos de energia solar' } }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(screen.getByText('Projetos de energia solar')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remover' }));
    expect(screen.queryByText('Projetos de energia solar')).toBeNull();
  });

  it('submete criação com sucesso e trata erro', async () => {
    mocks.createMock.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('erro'));
    render(<PracticeAreasForm />);

    fireEvent.click(screen.getByRole('button', { name: 'mock-image-upload' }));
    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Direito Tributário' },
    });
    fireEvent.change(screen.getByPlaceholderText('/servicos/...'), {
      target: { value: '/servicos/tributario' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(mocks.createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Direito Tributário',
          image_url: 'https://cdn.example/area.png',
        })
      );
    });
    expect(toastMocks.success).toHaveBeenCalledWith('Área de atuação criada!');
    expect(mocks.navigateMock).toHaveBeenCalledWith('/admin/areas-atuacao');

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Direito Cível' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith('Erro ao salvar.');
    });
  });
});
