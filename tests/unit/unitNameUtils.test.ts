import { describe, it, expect } from 'vitest';
import { normalizeUnitName, deduplicateUnitNames } from '../../src/utils/unitNameUtils';

describe('unitNameUtils', () => {
  describe('normalizeUnitName', () => {
    it('should remove trailing numbers from unit names', () => {
      expect(normalizeUnitName('Archer 1')).toBe('Archer');
      expect(normalizeUnitName('Archer 10')).toBe('Archer');
      expect(normalizeUnitName('Warrior 5')).toBe('Warrior');
      expect(normalizeUnitName('Paladin 9')).toBe('Paladin');
    });

    it('should handle names without trailing numbers', () => {
      expect(normalizeUnitName('PALADIN')).toBe('PALADIN');
      expect(normalizeUnitName('Archer')).toBe('Archer');
      expect(normalizeUnitName('Warrior')).toBe('Warrior');
    });

    it('should trim whitespace', () => {
      // normalizeUnitName only removes trailing numbers if they're at the very end
      // So '  Archer 1  ' doesn't match the pattern (ends with spaces, not numbers)
      expect(normalizeUnitName('  Archer 1  ')).toBe('Archer 1'); // Trimmed but number not removed
      expect(normalizeUnitName('Archer 1')).toBe('Archer'); // Number removed when at end
      expect(normalizeUnitName('  Warrior  ')).toBe('Warrior');
    });

    it('should handle names with multiple spaces', () => {
      expect(normalizeUnitName('Bone Warrior 1')).toBe('Bone Warrior');
      expect(normalizeUnitName('Magic Archer 10')).toBe('Magic Archer');
    });

    it('should handle empty strings', () => {
      expect(normalizeUnitName('')).toBe('');
    });

    it('should handle names with only numbers', () => {
      // normalizeUnitName doesn't remove numbers-only strings, just trailing numbers
      expect(normalizeUnitName('123')).toBe('123');
      expect(normalizeUnitName('  456  ')).toBe('456'); // Trimmed
    });
  });

  describe('deduplicateUnitNames', () => {
    it('should remove duplicate unit names', () => {
      const names = ['Archer', 'Warrior', 'Archer', 'Paladin'];
      const result = deduplicateUnitNames(names);
      expect(result).toEqual(['Archer', 'Warrior', 'Paladin']);
    });

    it('should normalize and deduplicate names with numbers', () => {
      const names = ['Archer 1', 'Archer 2', 'Warrior 1', 'Archer 10'];
      const result = deduplicateUnitNames(names);
      expect(result).toEqual(['Archer', 'Warrior']);
    });

    it('should handle empty array', () => {
      expect(deduplicateUnitNames([])).toEqual([]);
    });

    it('should handle array with single item', () => {
      expect(deduplicateUnitNames(['Archer'])).toEqual(['Archer']);
    });

    it('should preserve order of first occurrence', () => {
      const names = ['Warrior', 'Archer', 'Paladin', 'Warrior', 'Archer'];
      const result = deduplicateUnitNames(names);
      expect(result).toEqual(['Warrior', 'Archer', 'Paladin']);
    });

    it('should handle names with different cases', () => {
      const names = ['Archer', 'ARCHER', 'archer'];
      const result = deduplicateUnitNames(names);
      // Since normalizeUnitName doesn't change case, these remain different
      expect(result).toEqual(['Archer', 'ARCHER', 'archer']);
    });

    it('should handle complex unit names', () => {
      const names = [
        'Bone Warrior 1',
        'Bone Warrior 2',
        'Magic Archer 1',
        'Bone Warrior 10',
        'Magic Archer 5',
      ];
      const result = deduplicateUnitNames(names);
      expect(result).toEqual(['Bone Warrior', 'Magic Archer']);
    });
  });
});

