import { describe, it, expect } from 'vitest';
import unitSaga from '../../../../src/store/sagas/unitSaga';

describe('unitSaga', () => {
  it('should be a generator function', () => {
    const generator = unitSaga();
    expect(generator).toBeDefined();
    expect(typeof generator.next).toBe('function');
  });

  it('should yield true', () => {
    const generator = unitSaga();
    const result = generator.next();
    expect(result.value).toBe(true);
    expect(result.done).toBe(false);
  });

  it('should complete after yielding', () => {
    const generator = unitSaga();
    generator.next();
    const result = generator.next();
    expect(result.done).toBe(true);
  });
});

