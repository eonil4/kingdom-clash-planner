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

// Mock ResizeObserver with callback invocation
globalThis.ResizeObserver = class ResizeObserver {
  private callback: ResizeObserverCallback;
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  observe(target: Element) {
    // Immediately invoke callback with mock entries
    this.callback([
      {
        target,
        contentRect: { width: 500, height: 400 } as DOMRectReadOnly,
        borderBoxSize: [{ inlineSize: 500, blockSize: 400 }] as ResizeObserverSize[],
        contentBoxSize: [{ inlineSize: 500, blockSize: 400 }] as ResizeObserverSize[],
        devicePixelContentBoxSize: [{ inlineSize: 500, blockSize: 400 }] as ResizeObserverSize[],
      } as ResizeObserverEntry,
    ], this);
  }
  
  unobserve() {}
  disconnect() {}
};

// Mock deviceUtils for integration tests (unit tests may override this)
vi.mock('../src/utils/deviceUtils', () => ({
  getDndBackend: () => HTML5Backend,
  getDndBackendOptions: () => ({}),
  isTouchDevice: () => false,
}));

