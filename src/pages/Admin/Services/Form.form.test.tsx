// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ServicesForm from './Form';
import { useSilenceConsoleError } from '../../../tests/utils/silenceConsoleError';

const mocks = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  setDraftMock: vi.fn(),
  clearDraftMock: vi.fn(),
  draftValue: null as any,
  updateServiceMock: vi.fn(),
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
  useFormDraft: () => [mocks.draftValue, mocks.setDraftMock, mocks.clearDraftMock],
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
    updateService: mocks.updateServiceMock,
  }),
}));

vi.mock('../../../components/Admin/ImageUpload', () => ({
  default: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange('https://cdn.example/service.png')}>
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

describe('Services Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.draftValue = null;
    mocks.singleMock.mockResolvedValue({ data: { id: 'svc-1' }, error: null });
    mocks.selectMock.mockReturnValue({ single: mocks.singleMock });
    mocks.insertMock.mockReturnValue({ select: mocks.selectMock });
    mocks.fromMock.mockReturnValue({ insert: mocks.insertMock });
  });
  useSilenceConsoleError();

  it('valida campos obrigatórios', async () => {
    render(
      <MemoryRouter>
        <ServicesForm />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Serviço' }));

    await waitFor(() => {
      expect(screen.getByText('O título é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('O slug é obrigatório')).toBeInTheDocument();
    });
    expect(mocks.insertMock).not.toHaveBeenCalled();
  });

  it('submete com sucesso e redireciona', async () => {
    mocks.draftValue = {
      published: false,
      order: 0,
      title: '',
      slug: '',
      short_description: '',
      full_description: 'Conteúdo inicial',
      icon: '',
      image_url: '',
      category: '',
    };

    render(
      <MemoryRouter>
        <ServicesForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Serviço Elétrico' },
    });
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'servico-eletrico' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Serviço' }));

    await waitFor(() => {
      expect(mocks.fromMock).toHaveBeenCalledWith('services');
      expect(mocks.insertMock).toHaveBeenCalled();
    });
    expect(mocks.toastSuccessMock).toHaveBeenCalledWith('Serviço criado com sucesso!');
    expect(mocks.navigateMock).toHaveBeenCalledWith('/admin/services');
  });

  it('trata erro de persistência no submit', async () => {
    mocks.draftValue = {
      published: false,
      order: 0,
      title: '',
      slug: '',
      short_description: '',
      full_description: 'Conteúdo inicial',
      icon: '',
      image_url: '',
      category: '',
    };
    mocks.singleMock.mockResolvedValue({ data: null, error: { message: 'erro ao inserir' } });

    render(
      <MemoryRouter>
        <ServicesForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Serviço Elétrico' },
    });
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'servico-eletrico' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Serviço' }));

    await waitFor(() => {
      expect(mocks.toastErrorMock).toHaveBeenCalledWith(expect.stringContaining('Erro ao salvar serviço'));
    });
    expect(mocks.navigateMock).not.toHaveBeenCalledWith('/admin/services');
  });
});
