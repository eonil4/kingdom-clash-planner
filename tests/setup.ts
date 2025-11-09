import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test to ensure test isolation
afterEach(() => {
  cleanup();
  // Clear all mocks to prevent test interference
  vi.clearAllMocks();
  // Clear all timers
  vi.clearAllTimers();
});

