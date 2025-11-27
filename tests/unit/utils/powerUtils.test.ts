import { describe, it, expect } from 'vitest';
import { calculateUnitPower } from '../../../src/utils/powerUtils';
import { UnitRarity } from '../../../src/types';

describe('powerUtils', () => {
  describe('calculateUnitPower', () => {
    it('should calculate power for Common rarity at level 1', () => {
      expect(calculateUnitPower(UnitRarity.Common, 1)).toBe(100);
    });

    it('should calculate power for Common rarity at level 10', () => {
      expect(calculateUnitPower(UnitRarity.Common, 10)).toBe(38400);
    });

    it('should calculate power for Rare rarity at level 1', () => {
      expect(calculateUnitPower(UnitRarity.Rare, 1)).toBe(120);
    });

    it('should calculate power for Rare rarity at level 10', () => {
      expect(calculateUnitPower(UnitRarity.Rare, 10)).toBe(46080);
    });

    it('should calculate power for Epic rarity at level 1', () => {
      expect(calculateUnitPower(UnitRarity.Epic, 1)).toBe(140);
    });

    it('should calculate power for Epic rarity at level 10', () => {
      expect(calculateUnitPower(UnitRarity.Epic, 10)).toBe(53760);
    });

    it('should calculate power for Legendary rarity at level 1', () => {
      expect(calculateUnitPower(UnitRarity.Legendary, 1)).toBe(160);
    });

    it('should calculate power for Legendary rarity at level 10', () => {
      expect(calculateUnitPower(UnitRarity.Legendary, 10)).toBe(61440);
    });

    it('should calculate power for all levels of Common rarity', () => {
      const expected = [100, 200, 400, 800, 1600, 3200, 6400, 9600, 19200, 38400];
      for (let level = 1; level <= 10; level++) {
        expect(calculateUnitPower(UnitRarity.Common, level)).toBe(expected[level - 1]);
      }
    });

    it('should calculate power for all levels of Rare rarity', () => {
      const expected = [120, 240, 480, 960, 1920, 3840, 7680, 11520, 23040, 46080];
      for (let level = 1; level <= 10; level++) {
        expect(calculateUnitPower(UnitRarity.Rare, level)).toBe(expected[level - 1]);
      }
    });

    it('should calculate power for all levels of Epic rarity', () => {
      const expected = [140, 280, 560, 1120, 2240, 4480, 8960, 13440, 26880, 53760];
      for (let level = 1; level <= 10; level++) {
        expect(calculateUnitPower(UnitRarity.Epic, level)).toBe(expected[level - 1]);
      }
    });

    it('should calculate power for all levels of Legendary rarity', () => {
      const expected = [160, 320, 640, 1280, 2560, 5120, 10240, 20480, 30720, 61440];
      for (let level = 1; level <= 10; level++) {
        expect(calculateUnitPower(UnitRarity.Legendary, level)).toBe(expected[level - 1]);
      }
    });

    it('should clamp level below 1 to 1', () => {
      expect(calculateUnitPower(UnitRarity.Common, 0)).toBe(100);
      expect(calculateUnitPower(UnitRarity.Common, -1)).toBe(100);
      expect(calculateUnitPower(UnitRarity.Common, -10)).toBe(100);
    });

    it('should clamp level above 10 to 10', () => {
      expect(calculateUnitPower(UnitRarity.Common, 11)).toBe(38400);
      expect(calculateUnitPower(UnitRarity.Common, 100)).toBe(38400);
    });

    it('should handle mid-level values correctly', () => {
      expect(calculateUnitPower(UnitRarity.Common, 5)).toBe(1600);
      expect(calculateUnitPower(UnitRarity.Rare, 5)).toBe(1920);
      expect(calculateUnitPower(UnitRarity.Epic, 5)).toBe(2240);
      expect(calculateUnitPower(UnitRarity.Legendary, 5)).toBe(2560);
    });

    it('should return 0 for invalid rarity (fallback case)', () => {
      const invalidRarity = 'Invalid' as unknown as UnitRarity;
      expect(calculateUnitPower(invalidRarity, 1)).toBe(0);
    });
  });
});

