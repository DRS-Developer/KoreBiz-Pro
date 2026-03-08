import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import AdvancedImageEditorModal from './AdvancedImageEditorModal';

const mockGetCanvas = vi.fn();
const mockDrawImage = vi.fn();
const mockToBlob = vi.fn();

vi.mock('react-advanced-cropper', () => {
  const ReactModule = require('react');
  const Cropper = ReactModule.forwardRef((props: any, ref: any) => {
    ReactModule.useImperativeHandle(ref, () => ({
      getCanvas: mockGetCanvas,
    }));
    return <div data-testid="mock-cropper" data-rotate={String(props.rotate ?? 0)} />;
  });
  return { Cropper, CropperRef: {} };
});

describe('AdvancedImageEditorModal', () => {
  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCanvas.mockReturnValue({ width: 800, height: 600 });
    mockToBlob.mockImplementation((callback: (blob: Blob | null) => void) => {
      callback(new Blob(['ok'], { type: 'image/webp' }));
    });
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName.toLowerCase() === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({ filter: '', drawImage: mockDrawImage }),
          toBlob: mockToBlob,
        } as any;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('abre painel de ajustes e aplica rotação', () => {
    render(
      <AdvancedImageEditorModal imageSrc="blob:test" onClose={vi.fn()} onSave={vi.fn()} />
    );

    expect(screen.queryByText('Ajustes')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Ajustes de Imagem'));
    expect(screen.getByText('Ajustes')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Rotacionar 90°'));
    expect(screen.getByTestId('mock-cropper')).toHaveAttribute('data-rotate', '90');
  });

  it('exporta corte com filtros e dispara onSave', () => {
    const onSave = vi.fn();
    render(
      <AdvancedImageEditorModal
        imageSrc="blob:test"
        onClose={vi.fn()}
        onSave={onSave}
        minWidth={800}
        minHeight={600}
      />
    );

    fireEvent.click(screen.getByText('Salvar Corte'));

    expect(mockGetCanvas).toHaveBeenCalledWith({ width: 800, height: 600 });
    expect(mockDrawImage).toHaveBeenCalled();
    expect(mockToBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.9);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
