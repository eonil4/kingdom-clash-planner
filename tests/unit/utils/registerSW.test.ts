import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerServiceWorker } from '../../../src/utils/registerSW';

describe('registerServiceWorker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as { serviceWorker?: unknown }).serviceWorker;
  });

  it('should register service worker when supported', async () => {
    const mockRegister = vi.fn().mockResolvedValue({ scope: '/' });
    const mockServiceWorker = {
      register: mockRegister,
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
      configurable: true,
    });

    registerServiceWorker();

    // Trigger the load event
    window.dispatchEvent(new Event('load'));

    await vi.waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('/sw.js');
    });
  });

  it('should handle registration success', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const mockRegistration = { scope: '/', installing: null };
    const mockRegister = vi.fn().mockResolvedValue(mockRegistration);
    const mockServiceWorker = {
      register: mockRegister,
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
      configurable: true,
    });

    registerServiceWorker();
    window.dispatchEvent(new Event('load'));

    await vi.waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('SW registered:', mockRegistration);
    });

    consoleLogSpy.mockRestore();
  });

  it('should handle registration failure', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const mockError = new Error('Registration failed');
    const mockRegister = vi.fn().mockRejectedValue(mockError);
    const mockServiceWorker = {
      register: mockRegister,
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
      configurable: true,
    });

    registerServiceWorker();
    window.dispatchEvent(new Event('load'));

    await vi.waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('SW registration failed:', mockError);
    });

    consoleLogSpy.mockRestore();
  });

  it('should not register when service worker is not supported', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    registerServiceWorker();
    window.dispatchEvent(new Event('load'));

    expect(consoleLogSpy).not.toHaveBeenCalled();
    consoleLogSpy.mockRestore();
  });
});
