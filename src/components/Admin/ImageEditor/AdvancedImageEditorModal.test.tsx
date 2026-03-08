import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdvancedImageEditorModal from './AdvancedImageEditorModal';

const filerobotPropsRef: { current: any } = { current: null };
const mockCanvasToBlob = vi.fn();

vi.mock('react-filerobot-image-editor', () => {
  const MockFilerobot = (props: any) => {
    filerobotPropsRef.current = props;
    return (
      <button
        type="button"
        data-testid="mock-filerobot-save"
        onClick={() => {
          props.onSave({
            imageCanvas: {
              toBlob: mockCanvasToBlob,
            },
          });
        }}
      >
        mock-save
      </button>
    );
  };
  return {
    __esModule: true,
    default: MockFilerobot,
    TABS: {
      ADJUST: 'Adjust',
      FILTERS: 'Filters',
      FINETUNE: 'Finetune',
      RESIZE: 'Resize',
    },
    TOOLS: {
      CROP: 'Crop',
    },
  };
});

describe('AdvancedImageEditorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanvasToBlob.mockImplementation((callback: (blob: Blob | null) => void) => {
      callback(new Blob(['ok'], { type: 'image/webp' }));
    });
  });

  it('configura o Filerobot com regras de crop e tabs esperadas', () => {
    render(
      <AdvancedImageEditorModal
        imageSrc="blob:test"
        onClose={vi.fn()}
        onSave={vi.fn()}
        aspectRatio={4 / 3}
        minWidth={800}
        minHeight={600}
      />
    );

    expect(filerobotPropsRef.current).toBeTruthy();
    expect(filerobotPropsRef.current.source).toBe('blob:test');
    expect(filerobotPropsRef.current.Crop).toEqual(
      expect.objectContaining({
        ratio: 4 / 3,
        minWidth: 800,
        minHeight: 600,
      })
    );
    expect(filerobotPropsRef.current.tabsIds).toEqual(['Adjust', 'Filters', 'Finetune', 'Resize']);
  });

  it('converte saída do editor para blob e dispara onSave', async () => {
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

    fireEvent.click(screen.getByTestId('mock-filerobot-save'));
    await Promise.resolve();

    expect(mockCanvasToBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.9);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
