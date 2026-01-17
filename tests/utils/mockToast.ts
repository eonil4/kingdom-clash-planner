import { vi } from 'vitest';

export const createMockToast = () => {
  const showError = vi.fn();
  const showSuccess = vi.fn();
  const showWarning = vi.fn();
  const showInfo = vi.fn();
  const showToast = vi.fn();

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showToast,
  };
};

export const mockUseToast = createMockToast();

export const setupToastMock = () => {
  vi.mock('../../src/hooks/useToast', () => ({
    useToast: () => mockUseToast,
  }));
};
