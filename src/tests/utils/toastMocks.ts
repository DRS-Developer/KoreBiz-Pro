import { vi } from 'vitest';

export const toastMocks = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};

export const resetToastMocks = () => {
  toastMocks.success.mockReset();
  toastMocks.error.mockReset();
  toastMocks.info.mockReset();
};
