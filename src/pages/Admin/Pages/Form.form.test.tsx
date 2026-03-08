// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PageForm from './Form';
import { useSilenceConsoleError } from '../../../tests/utils/silenceConsoleError';

const mocks = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  setDraftMock: vi.fn(),
  clearDraftMock: vi.fn(),
  updatePageMock: vi.fn(),
  generateUniqueSlugMock: vi.fn(async () => 'pagina-gerada'),
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

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccessMock,
    error: mocks.toastErrorMock,
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

vi.mock('../../../hooks/useFormDraft', () => ({
  useFormDraft: () => [null, mocks.setDraftMock, mocks.clearDraftMock],
}));

vi.mock('../../../hooks/useDebounce', () => ({
  useDebounce: () => '',
}));

vi.mock('../../../hooks/useSlug', () => ({
  useSlug: () => ({
    generateUniqueSlug: mocks.generateUniqueSlugMock,
    formatSlug: (value: string) => value,
  }),
}));

vi.mock('../../../stores/useGlobalStore', () => ({
  useGlobalStore: () => ({
    updatePage: mocks.updatePageMock,
  }),
}));

vi.mock('../../../components/Admin/ImageUpload', () => ({
  default: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange('https://cdn.example/page.png')}>
      mock-image-upload
    </button>
  ),
}));

vi.mock('../../../components/Admin/TiptapEditor', () => ({
  default: ({ value, onChange }: any) => (
    <textarea
      aria-label="Conteúdo Editor"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('../../../components/Admin/PageSectionsEditor', () => ({
  default: () => <div>sections-editor</div>,
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

describe('Pages Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.singleMock.mockResolvedValue({ data: { id: 'pg-1' }, error: null });
    mocks.selectMock.mockReturnValue({ single: mocks.singleMock });
    mocks.insertMock.mockReturnValue({ select: mocks.selectMock });
    mocks.fromMock.mockReturnValue({ insert: mocks.insertMock });
  });
  useSilenceConsoleError();

  it('valida campos obrigatórios', async () => {
    render(
      <MemoryRouter>
        <PageForm />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Página' }));

    await waitFor(() => {
      expect(screen.getByText('O título é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('O slug é obrigatório')).toBeInTheDocument();
    });
    expect(mocks.insertMock).not.toHaveBeenCalled();
  });

  it('submete página com sucesso', async () => {
    render(
      <MemoryRouter>
        <PageForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Título da página'), {
      target: { value: 'Página Institucional' },
    });
    fireEvent.change(screen.getByPlaceholderText('slug-da-pagina'), {
      target: { value: 'pagina-institucional' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Página' }));

    await waitFor(() => {
      expect(mocks.fromMock).toHaveBeenCalledWith('pages');
      expect(mocks.insertMock).toHaveBeenCalled();
    });
    expect(mocks.toastSuccessMock).toHaveBeenCalledWith('Página criada com sucesso!');
    expect(mocks.navigateMock).toHaveBeenCalledWith('/admin/paginas');
  });

  it('trata falha de persistência', async () => {
    mocks.singleMock.mockResolvedValue({ data: null, error: { message: 'erro no banco' } });

    render(
      <MemoryRouter>
        <PageForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Título da página'), {
      target: { value: 'Página Institucional' },
    });
    fireEvent.change(screen.getByPlaceholderText('slug-da-pagina'), {
      target: { value: 'pagina-institucional' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Página' }));

    await waitFor(() => {
      expect(mocks.toastErrorMock).toHaveBeenCalledWith('Erro ao salvar página');
    });
    expect(mocks.navigateMock).not.toHaveBeenCalledWith('/admin/paginas');
  });
});
