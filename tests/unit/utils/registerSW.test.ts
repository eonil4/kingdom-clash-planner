import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerServiceWorker } from '../../../src/utils/registerSW';

describe('registerServiceWorker', () => {
  let originalServiceWorker: ServiceWorkerContainer | undefined;
  const loadListeners: EventListener[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    originalServiceWorker = navigator.serviceWorker;
    
    // Track load event listeners
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = vi.fn((event: string, listener: EventListener) => {
      if (event === 'load') {
        loadListeners.push(listener);
      }
      return originalAddEventListener.call(window, event, listener);
    }) as typeof window.addEventListener;
  });

  afterEach(() => {
    // Remove all load listeners
    loadListeners.forEach(listener => {
      window.removeEventListener('load', listener);
    });
    loadListeners.length = 0;
    
    // Restore original serviceWorker
    if (originalServiceWorker !== undefined) {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalServiceWorker,
        writable: true,
        configurable: true,
      });
    }
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

    // Delete serviceWorker from navigator to simulate unsupported browser
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    // Should not throw error
    expect(() => {
      registerServiceWorker();
    }).not.toThrow();

    // Dispatch load event - should not attempt registration
    window.dispatchEvent(new Event('load'));

    // Wait a bit to ensure no async operations
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(consoleLogSpy).not.toHaveBeenCalled();
        consoleLogSpy.mockRestore();
        resolve();
      }, 100);
    });
  });

  it('should handle serviceWorker becoming undefined after initial check', () => {
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

    // Simulate serviceWorker becoming undefined before load event
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    // Trigger the load event - should not throw or call register
    expect(() => {
      window.dispatchEvent(new Event('load'));
    }).not.toThrow();

    expect(mockRegister).not.toHaveBeenCalled();
  });
});
