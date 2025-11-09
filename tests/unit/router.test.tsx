import { describe, it, expect, vi } from 'vitest';
import { router } from '../../src/router';

// Mock FormationPlanner
vi.mock('../../src/pages/FormationPlanner', () => ({
  default: () => <div>FormationPlanner</div>,
}));

describe('router', () => {
  it('should create router with correct routes', () => {
    expect(router).toBeDefined();
    expect(router.routes).toBeDefined();
    expect(router.routes.length).toBe(1);
    expect(router.routes[0].path).toBe('/');
  });
});
