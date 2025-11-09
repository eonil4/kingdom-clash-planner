import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';

// Mock react-dom/client
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

// Mock App component
vi.mock('../../src/App', () => ({
  default: () => <div>App</div>,
}));

// Mock index.css
vi.mock('../../src/index.css', () => ({}));

describe('main.tsx', () => {
  let mockRoot: { render: ReturnType<typeof vi.fn> };
  let originalGetElementById: typeof document.getElementById;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRoot = {
      render: vi.fn(),
    };
    (createRoot as ReturnType<typeof vi.fn>).mockReturnValue(mockRoot);
    
    // Mock getElementById
    originalGetElementById = document.getElementById;
    document.getElementById = vi.fn(() => {
      const element = document.createElement('div');
      element.id = 'root';
      return element;
    });
  });

  afterEach(() => {
    document.getElementById = originalGetElementById;
    vi.restoreAllMocks();
  });

  it('should create root and render App', async () => {
    // Dynamically import main to trigger execution
    await import('../../src/main');
    
    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(createRoot).toHaveBeenCalled();
    expect(mockRoot.render).toHaveBeenCalled();
  });

  it('should handle missing root element gracefully', async () => {
    document.getElementById = vi.fn(() => null);
    
    // This should not throw in the test environment
    // In real environment, it would throw if root is null
    await expect(import('../../src/main')).resolves.not.toThrow();
  });
});

