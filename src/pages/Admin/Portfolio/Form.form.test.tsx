// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PortfolioForm from './Form';
import { useSilenceConsoleError } from '../../../tests/utils/silenceConsoleError';
import { toastMocks } from '../../../tests/utils/toastMocks';

const mocks = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  setDraftMock: vi.fn(),
  clearDraftMock: vi.fn(),
  updatePortfolioMock: vi.fn(),
  generateUniqueSlugMock: vi.fn(async () => 'slug-gerado'),
  checkAvailabilityMock: vi.fn(async () => true),
  fromMock: vi.fn(),
  insertMock: vi.fn(),
  selectMock: vi.fn(),
  singleMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigateMock,
    useParams: () => ({ id: undefined }),
  };
});

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

vi.mock('../../../hooks/useFormDraft', () => ({
  useFormDraft: () => [null, mocks.setDraftMock, mocks.clearDraftMock],
}));

vi.mock('../../../hooks/useDebounce', () => ({
  useDebounce: () => '',
}));

vi.mock('../../../hooks/useSlug', () => ({
  useSlug: () => ({
    generateUniqueSlug: mocks.generateUniqueSlugMock,
    checkAvailability: mocks.checkAvailabilityMock,
    isChecking: false,
    formatSlug: (value: string) => value,
  }),
}));

vi.mock('../../../stores/useGlobalStore', () => ({
  useGlobalStore: () => ({
    updatePortfolio: mocks.updatePortfolioMock,
  }),
}));

vi.mock('../../../components/Admin/ImageUpload', () => ({
  default: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange('https://cdn.example/portfolio.png')}>
      mock-image-upload
    </button>
  ),
}));

vi.mock('../../../components/Admin/TiptapEditor', () => ({
  default: ({ value, onChange, label }: any) => (
    <textarea
      aria-label={label || 'editor'}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('../../../components/Admin/SEOSnippetPreview', () => ({
  default: () => <div>seo-preview</div>,
}));

vi.mock('../../../components/Admin/UnsavedChangesModal', () => ({
  default: () => null,
}));

vi.mock('../../../components/Skeletons/FormSkeleton', () => ({
  default: () => <div>loading</div>,
}));

describe('Portfolio Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.singleMock.mockResolvedValue({ data: { id: 'pf-1' }, error: null });
    mocks.selectMock.mockReturnValue({ single: mocks.singleMock });
    mocks.insertMock.mockReturnValue({ select: mocks.selectMock });
    mocks.fromMock.mockReturnValue({ insert: mocks.insertMock });
  });
  useSilenceConsoleError();

  it('valida campos obrigatórios', async () => {
    render(
      <MemoryRouter>
        <PortfolioForm />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Criar Projeto' }));

    await waitFor(() => {
      expect(screen.getByText('O título é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('O slug é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('A categoria é obrigatória')).toBeInTheDocument();
    });
    expect(mocks.insertMock).not.toHaveBeenCalled();
  });

  it('submete criação com sucesso', async () => {
    render(
      <MemoryRouter>
        <PortfolioForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Projeto Solar' },
    });
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'projeto-solar' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Comercial' },
    });
    const detailedEditor = await screen.findByLabelText('Descrição Detalhada');
    fireEvent.change(detailedEditor, {
      target: { value: 'Projeto comercial com geração distribuída.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar Projeto' }));

    await waitFor(() => {
      expect(mocks.fromMock).toHaveBeenCalledWith('portfolios');
      expect(mocks.insertMock).toHaveBeenCalled();
    });
    expect(toastMocks.success).toHaveBeenCalledWith('Projeto criado com sucesso!');
    expect(mocks.navigateMock).toHaveBeenCalledWith('/admin/portfolio');
  });

  it('trata erro de submissão', async () => {
    mocks.singleMock.mockResolvedValue({ data: null, error: { message: 'erro ao inserir' } });

    render(
      <MemoryRouter>
        <PortfolioForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Projeto Solar' },
    });
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'projeto-solar' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Comercial' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar Projeto' }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith(expect.stringContaining('Erro ao salvar projeto'));
    });
    expect(mocks.navigateMock).not.toHaveBeenCalledWith('/admin/portfolio');
  });
});
