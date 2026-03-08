import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';
import { resetToastMocks, toastMocks } from './tests/utils/toastMocks';

vi.mock('sonner', () => ({
  toast: toastMocks,
}));

beforeEach(() => {
  resetToastMocks();
});
