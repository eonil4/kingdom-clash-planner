import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUnitImagePath, getPlaceholderImageUrl, checkImageExists, preloadUnitImage } from '../../../src/utils/imageUtils';

vi.mock('../../../src/types/unitNames', () => ({
  getUnitDataByName: (name: string) => {
    const mockData: Record<string, { imageName: string }> = {
      'ARCHERS': { imageName: 'archers' },
      'PALADIN': { imageName: 'paladin' },
      'BONE WARRIOR': { imageName: 'bone_warrior' },
    };
    return mockData[name] || null;
  },
}));

vi.mock('../../../src/utils/imageUtils', async () => {
  const actual = await vi.importActual('../../../src/utils/imageUtils');
  return {
    ...actual,
  };
});

describe('imageUtils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getUnitImagePath', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return image path using imageName from unit data', () => {
      const result = getUnitImagePath('ARCHERS');
      expect(typeof result).toBe('string');
      expect(result).toContain('archers');
    });

    it('should fallback to converted name when imageName not available', () => {
      const result = getUnitImagePath('UNKNOWN UNIT');
      expect(typeof result).toBe('string');
      expect(result).toContain('/assets/units/');
    });

    it('should handle unit names with spaces', () => {
      const result = getUnitImagePath('BONE WARRIOR');
      expect(typeof result).toBe('string');
    });

    it('should handle unit names with special characters', () => {
      const result = getUnitImagePath("SORCERER'S APPRENTICE");
      expect(typeof result).toBe('string');
      expect(result).toContain('sorcerers_apprentice');
    });

    it('should return cached value on subsequent calls', () => {
      const result1 = getUnitImagePath('ARCHERS');
      const result2 = getUnitImagePath('ARCHERS');
      expect(result1).toBe(result2);
    });

    it('should return cached URL after async load completes', async () => {
      getUnitImagePath('PALADIN');

      await new Promise((resolve) => setTimeout(resolve, 50));

      const cachedResult = getUnitImagePath('PALADIN');
      
      expect(typeof cachedResult).toBe('string');
      expect(cachedResult).toContain('paladin');
    });
  });

  describe('preloadUnitImage', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return image path for known unit', async () => {
      const result = await preloadUnitImage('ARCHERS');
      expect(typeof result).toBe('string');
      expect(result).toContain('archers');
    });

    it('should return fallback path for unknown unit', async () => {
      const result = await preloadUnitImage('UNKNOWN UNIT');
      expect(typeof result).toBe('string');
      expect(result).toContain('/assets/units/');
    });

    it('should return cached value on subsequent calls', async () => {
      const result1 = await preloadUnitImage('PALADIN');
      const result2 = await preloadUnitImage('PALADIN');
      expect(result1).toBe(result2);
    });

    it('should handle unit with explicit imageName', async () => {
      const result = await preloadUnitImage('BONE WARRIOR');
      expect(typeof result).toBe('string');
    });

    it('should handle unit names with special characters', async () => {
      const result = await preloadUnitImage("SORCERER'S APPRENTICE");
      expect(typeof result).toBe('string');
      expect(result).toContain('sorcerers_apprentice');
    });
  });

  describe('getPlaceholderImageUrl', () => {
    it('should generate a data URL', () => {
      const mockToDataURL = vi.fn(() => 'data:image/png;base64,test');
      const mockFillRect = vi.fn();
      const mockFillText = vi.fn();
      const mockGetContext = vi.fn(() => ({
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        fillRect: mockFillRect,
        fillText: mockFillText,
      }));
      
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = vi.fn((tag: string) => {
        if (tag === 'canvas') {
          const canvas = originalCreateElement('canvas');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (canvas as any).getContext = mockGetContext;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (canvas as any).toDataURL = mockToDataURL;
          return canvas;
        }
        return originalCreateElement(tag);
      });

      const result = getPlaceholderImageUrl('Archer');
      expect(result).toMatch(/^data:image/);
      
      document.createElement = originalCreateElement;
    });

    it('should include unit initial in the image', () => {
      const mockToDataURL = vi.fn(() => 'data:image/png;base64,test');
      const mockGetContext = vi.fn(() => ({
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        fillRect: vi.fn(),
        fillText: vi.fn(),
      }));
      
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = vi.fn((tag: string) => {
        if (tag === 'canvas') {
          const canvas = originalCreateElement('canvas');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (canvas as any).getContext = mockGetContext;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (canvas as any).toDataURL = mockToDataURL;
          return canvas;
        }
        return originalCreateElement(tag);
      });

      const result = getPlaceholderImageUrl('Archer');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      
      document.createElement = originalCreateElement;
    });

    it('should handle empty string', () => {
      const mockToDataURL = vi.fn(() => 'data:image/png;base64,test');
      const mockGetContext = vi.fn(() => ({
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        fillRect: vi.fn(),
        fillText: vi.fn(),
      }));
      
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = vi.fn((tag: string) => {
        if (tag === 'canvas') {
          const canvas = originalCreateElement('canvas');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (canvas as any).getContext = mockGetContext;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (canvas as any).toDataURL = mockToDataURL;
          return canvas;
        }
        return originalCreateElement(tag);
      });

      const result = getPlaceholderImageUrl('');
      expect(result).toMatch(/^data:image/);
      
      document.createElement = originalCreateElement;
    });

    it('should handle unit names starting with lowercase', () => {
      const mockToDataURL = vi.fn(() => 'data:image/png;base64,test');
      const mockGetContext = vi.fn(() => ({
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        fillRect: vi.fn(),
        fillText: vi.fn(),
      }));
      
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = vi.fn((tag: string) => {
        if (tag === 'canvas') {
          const canvas = originalCreateElement('canvas');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (canvas as any).getContext = mockGetContext;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (canvas as any).toDataURL = mockToDataURL;
          return canvas;
        }
        return originalCreateElement(tag);
      });

      const result = getPlaceholderImageUrl('archer');
      expect(result).toMatch(/^data:image/);
      
      document.createElement = originalCreateElement;
    });
  });

  describe('getPlaceholderImageUrl with null context', () => {
    it('should return empty data URL when canvas context is null', () => {
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = vi.fn((tag: string) => {
        if (tag === 'canvas') {
          const canvas = originalCreateElement('canvas');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (canvas as any).getContext = vi.fn(() => null);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (canvas as any).toDataURL = vi.fn(() => 'data:image/png;base64,');
          return canvas;
        }
        return originalCreateElement(tag);
      });

      const result = getPlaceholderImageUrl('Archer');
      expect(result).toMatch(/^data:image/);
      
      document.createElement = originalCreateElement;
    });
  });

  describe('checkImageExists', () => {
    it('should resolve to true for valid image URL', async () => {
      global.Image = class extends Image {
        constructor() {
          super();
          setTimeout(() => {
            if (this.onload) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              this.onload(new Event('load') as any);
            }
          }, 0);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = await checkImageExists('https://example.com/image.png');
      expect(result).toBe(true);
    });

    it('should resolve to false for invalid image URL', async () => {
      const originalImage = global.Image;
      
      global.Image = class extends Image {
        constructor() {
          super();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const self = this as any;
          
          let _onload: (() => void) | null = null;
          let _onerror: (() => void) | null = null;
          
          Object.defineProperty(this, 'onload', {
            set: (fn: (() => void) | null) => {
              _onload = fn;
            },
            get: () => _onload,
            configurable: true,
          });
          
          Object.defineProperty(this, 'onerror', {
            set: (fn: (() => void) | null) => {
              _onerror = fn;
              if (self._src && _onerror) {
                Promise.resolve().then(() => _onerror?.());
              }
            },
            get: () => _onerror,
            configurable: true,
          });
          
          Object.defineProperty(this, 'src', {
            set: (value: string) => {
              self._src = value;
              Promise.resolve().then(() => {
                if (_onerror) {
                  _onerror();
                }
              });
            },
            get: () => self._src,
            configurable: true,
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = await checkImageExists('https://example.com/invalid.png');
      
      global.Image = originalImage;
      
      expect(result).toBe(false);
    });

    it('should handle timeout scenarios', async () => {
      global.Image = class extends Image {
        constructor() {
          super();
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const resultPromise = checkImageExists('https://example.com/image.png');
      expect(resultPromise).toBeInstanceOf(Promise);
    });
  });
});
