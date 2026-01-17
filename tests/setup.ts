import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Cleanup after each test to ensure test isolation
afterEach(() => {
  cleanup();
  // Clear all mocks to prevent test interference
  vi.clearAllMocks();
  // Clear all timers
  vi.clearAllTimers();
});

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock deviceUtils for integration tests (unit tests may override this)
vi.mock('../src/utils/deviceUtils', () => ({
  getDndBackend: () => HTML5Backend,
  getDndBackendOptions: () => ({}),
  isTouchDevice: () => false,
}));

