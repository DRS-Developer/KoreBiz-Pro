// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Contato from './Contato';
import { supabase } from '../lib/supabase';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    icon: vi.fn(),
    Marker: { prototype: { options: { icon: {} } } }
  },
}));

// Mock React-Leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => <div>TileLayer</div>,
  Marker: ({ children }: any) => <div>Marker {children}</div>,
  Popup: ({ children }: any) => <div>Popup {children}</div>,
  useMap: () => ({ setView: vi.fn() }),
}));

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({ data: {}, error: null })),
      })),
    })),
  },
}));

// Mock Hooks
vi.mock('../hooks/useSiteSettings', () => ({
  useSiteSettings: () => ({
    displayAddress: 'Rua Teste',
    displayPhone: '(11) 9999-9999',
    whatsappLink: 'https://wa.me/551199999999',
    settings: { contact_email: 'test@example.com' },
    loading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('../stores/useAuthStore', () => ({
  useAuthStore: () => ({ session: null }),
}));

describe('Contato Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    cleanup();
  });

  it('should render contact form correctly', () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <Contato />
        </BrowserRouter>
      </HelmetProvider>
    );
    expect(screen.getByLabelText('Nome Completo')).not.toBeNull();
    expect(screen.getByLabelText('Email')).not.toBeNull();
  });

  it('should not expose contact info editor on public page', () => {
    render(
      <HelmetProvider>
        <BrowserRouter>
          <Contato />
        </BrowserRouter>
      </HelmetProvider>
    );

    expect(screen.queryByText('Editar Informações de Contato')).toBeNull();
    expect(screen.queryByText('Salvar Alterações')).toBeNull();
    expect(screen.queryByText('Configurar Contato')).toBeNull();
  });

  it('should submit form via backend API', async () => {
    // Mock successful backend response
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { success: true },
      error: null,
    });

    render(
      <HelmetProvider>
        <BrowserRouter>
          <Contato />
        </BrowserRouter>
      </HelmetProvider>
    );

    // Fill form
    fireEvent.change(screen.getByLabelText('Nome Completo'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Telefone / WhatsApp'), { target: { value: '(11) 99999-9999' } });
    fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: 'Orçamento' } });
    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Teste de mensagem com mais de 10 caracteres' } });

    // Submit
    const buttons = screen.getAllByRole('button', { name: /Enviar Mensagem/i });
    await act(async () => {
        fireEvent.click(buttons[0]);
    });

    // Verify API call
    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith('submit-contact', {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '(11) 99999-9999',
          subject: 'Orçamento',
          message: 'Teste de mensagem com mais de 10 caracteres',
        },
      });
    });

    // Verify success message (toast mock would be ideal, but assuming simple console check or UI update if implemented)
    // Since toast is external, we mainly verify the function call was correct.
  });

  it('should handle backend errors correctly', async () => {
    // Mock backend error
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: { message: 'Erro no servidor' },
    });

    render(
      <HelmetProvider>
        <BrowserRouter>
          <Contato />
        </BrowserRouter>
      </HelmetProvider>
    );

    // Fill form
    fireEvent.change(screen.getByLabelText('Nome Completo'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Telefone / WhatsApp'), { target: { value: '(11) 99999-9999' } });
    fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: 'Orçamento' } });
    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Teste de mensagem com mais de 10 caracteres' } });

    // Submit
    const buttons = screen.getAllByText(/Enviar Mensagem/i);
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalled();
    });

    // We expect it to stop loading
    expect(screen.queryByText('Enviando...')).toBeNull();
  });
});
