import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { HTML5Backend } from 'react-dnd-html5-backend';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.clearAllTimers();
});

vi.mock('../../src/utils/deviceUtils', () => ({
  getDndBackend: () => HTML5Backend,
  getDndBackendOptions: () => ({}),
  isTouchDevice: () => false,
}));
