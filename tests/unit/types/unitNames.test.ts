import { describe, it, expect } from 'vitest';
import {
  getUnitData,
  getUnitDataByName,
  getUnitDataByIndex,
  getUnitNameByIndex,
  getIndexByUnitName,
  UnitDataMap,
  UNIT_NAME_TO_INDEX,
  INDEX_TO_UNIT_NAME,
} from '../../../src/types/unitNames';
import { UnitRarity } from '../../../src/types';

describe('unitNames', () => {
  describe('getUnitData', () => {
    it('should return unit data for valid unit key', () => {
      const result = getUnitData('ARCHERS');
      expect(result).toBeDefined();
      expect(result.name).toBe('Archers');
      expect(result.index).toBe(2);
      expect(result.rarity).toBe(UnitRarity.Common);
    });

    it('should return unit data for all unit keys in UnitDataMap', () => {
      Object.keys(UnitDataMap).forEach((key) => {
        const result = getUnitData(key as keyof typeof UnitDataMap);
        expect(result).toBeDefined();
        expect(result.name).toBe(UnitDataMap[key as keyof typeof UnitDataMap].name);
      });
    });
  });

  describe('getUnitDataByName', () => {
    it('should return unit data for valid unit name', () => {
      const result = getUnitDataByName('Archers');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Archers');
      expect(result?.index).toBe(2);
      expect(result?.rarity).toBe(UnitRarity.Common);
    });

    it('should return undefined for invalid unit name', () => {
      const result = getUnitDataByName('INVALID UNIT');
      expect(result).toBeUndefined();
    });

    it('should return unit data for all unit names in UnitDataMap', () => {
      Object.values(UnitDataMap).forEach((unitData) => {
        const result = getUnitDataByName(unitData.name);
        expect(result).toBeDefined();
        expect(result?.name).toBe(unitData.name);
        expect(result?.index).toBe(unitData.index);
        expect(result?.rarity).toBe(unitData.rarity);
      });
    });

    it('should handle case-sensitive unit names', () => {
      const result = getUnitDataByName('archers');
      expect(result).toBeUndefined();
    });
  });

  describe('getUnitDataByIndex', () => {
    it('should return unit data for valid index', () => {
      const result = getUnitDataByIndex(2);
      expect(result).toBeDefined();
      expect(result?.index).toBe(2);
    });

    it('should return undefined for invalid index', () => {
      const result = getUnitDataByIndex(999);
      expect(result).toBeUndefined();
    });

    it('should return unit data for all valid indices', () => {
      const indices = new Set(Object.values(UnitDataMap).map((data) => data.index));
      indices.forEach((index) => {
        const result = getUnitDataByIndex(index);
        expect(result).toBeDefined();
        expect(result?.index).toBe(index);
      });
    });

    it('should handle negative index', () => {
      const result = getUnitDataByIndex(-1);
      expect(result).toBeUndefined();
    });
  });

  describe('getUnitNameByIndex', () => {
    it('should return unit name for valid index', () => {
      const result = getUnitNameByIndex(2);
      expect(result).toBe('Archers');
    });

    it('should return undefined for invalid index', () => {
      const result = getUnitNameByIndex(999);
      expect(result).toBeUndefined();
    });

    it('should return correct name for all valid indices', () => {
      Object.values(UnitDataMap).forEach((unitData) => {
        const result = getUnitNameByIndex(unitData.index);
        expect(result).toBe(unitData.name);
      });
    });
  });

  describe('getIndexByUnitName', () => {
    it('should return index for valid unit name', () => {
      const result = getIndexByUnitName('Archers');
      expect(result).toBe(2);
    });

    it('should return undefined for invalid unit name', () => {
      const result = getIndexByUnitName('INVALID UNIT');
      expect(result).toBeUndefined();
    });

    it('should return correct index for all unit names', () => {
      Object.values(UnitDataMap).forEach((unitData) => {
        const result = getIndexByUnitName(unitData.name);
        expect(result).toBe(unitData.index);
      });
    });
  });

  describe('UnitDataMap', () => {
    it('should have all units with valid data structure', () => {
      Object.values(UnitDataMap).forEach((unitData) => {
        expect(unitData).toHaveProperty('name');
        expect(unitData).toHaveProperty('index');
        expect(unitData).toHaveProperty('rarity');
        expect(unitData).toHaveProperty('imageName');
        expect(unitData).toHaveProperty('getPower');
        expect(typeof unitData.name).toBe('string');
        expect(typeof unitData.index).toBe('number');
        expect(typeof unitData.imageName).toBe('string');
        expect(typeof unitData.getPower).toBe('function');
      });
    });

    it('should have unique indices for all units', () => {
      const indices = Object.values(UnitDataMap).map((data) => data.index);
      const uniqueIndices = new Set(indices);
      expect(uniqueIndices.size).toBe(indices.length);
    });

    it('should have valid rarity values', () => {
      const validRarities = [UnitRarity.Common, UnitRarity.Rare, UnitRarity.Epic, UnitRarity.Legendary];
      Object.values(UnitDataMap).forEach((unitData) => {
        expect(validRarities).toContain(unitData.rarity);
      });
    });

    it('should have getPower function that returns valid power values', () => {
      Object.values(UnitDataMap).forEach((unitData) => {
        for (let level = 1; level <= 10; level++) {
          const power = unitData.getPower(level);
          expect(typeof power).toBe('number');
          expect(power).toBeGreaterThan(0);
        }
      });
    });

    it('should have imageName for all units', () => {
      Object.values(UnitDataMap).forEach((unitData) => {
        expect(unitData.imageName).toBeTruthy();
        expect(typeof unitData.imageName).toBe('string');
        expect(unitData.imageName.length).toBeGreaterThan(0);
      });
    });
  });

  describe('UNIT_NAME_TO_INDEX', () => {
    it('should map all unit names to their indices', () => {
      Object.values(UnitDataMap).forEach((unitData) => {
        expect(UNIT_NAME_TO_INDEX[unitData.name]).toBe(unitData.index);
      });
    });

    it('should have same number of entries as UnitDataMap', () => {
      expect(Object.keys(UNIT_NAME_TO_INDEX).length).toBe(Object.keys(UnitDataMap).length);
    });
  });

  describe('INDEX_TO_UNIT_NAME', () => {
    it('should map all indices to their unit names', () => {
      Object.values(UnitDataMap).forEach((unitData) => {
        expect(INDEX_TO_UNIT_NAME[unitData.index]).toBe(unitData.name);
      });
    });

    it('should have same number of entries as UnitDataMap', () => {
      expect(Object.keys(INDEX_TO_UNIT_NAME).length).toBe(Object.keys(UnitDataMap).length);
    });
  });

  describe('Integration tests', () => {
    it('should maintain consistency between all lookup functions', () => {
      Object.values(UnitDataMap).forEach((unitData) => {
        const byName = getUnitDataByName(unitData.name);
        expect(byName?.index).toBe(unitData.index);

        const byIndex = getUnitDataByIndex(unitData.index);
        expect(byIndex?.name).toBe(unitData.name);

        const nameByIndex = getUnitNameByIndex(unitData.index);
        expect(nameByIndex).toBe(unitData.name);

        const indexByName = getIndexByUnitName(unitData.name);
        expect(indexByName).toBe(unitData.index);

        expect(UNIT_NAME_TO_INDEX[unitData.name]).toBe(unitData.index);
        expect(INDEX_TO_UNIT_NAME[unitData.index]).toBe(unitData.name);
      });
    });
  });
});

