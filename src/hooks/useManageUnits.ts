import { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addUnit, removeUnit, updateUnit } from '../store/reducers/unitSlice';
import type { Unit } from '../types';
import { UnitRarity } from '../types';
import { normalizeUnitName } from '../utils/unitNameUtils';
import { calculateUnitPower } from '../utils/powerUtils';
import { getUnitDataByName } from '../types/unitNames';
import { MAX_TOTAL_UNITS, MAX_UNITS_PER_LEVEL } from '../constants';


export type SortColumn = 'name' | 'level' | 'rarity' | 'count' | null;
export type SortDirection = 'asc' | 'desc';

export interface UnitFilters {
    name: string;
    levelMin: string;
    levelMax: string;
    rarityMin: UnitRarity | '';
    rarityMax: UnitRarity | '';
    countMin: string;
    countMax: string;
}

export const useManageUnits = () => {
    const dispatch = useAppDispatch();
    const { units } = useAppSelector((state) => state.unit);
    const currentFormation = useAppSelector((state) => state.formation.currentFormation);

    // State
    const [isAdding, setIsAdding] = useState(false);
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [rowEditData, setRowEditData] = useState<Record<string, { name: string; level: number; rarity: UnitRarity; count: number }>>({});
    const [formData, setFormData] = useState({
        name: '',
        level: 10,
        rarity: UnitRarity.Common as UnitRarity,
        count: 1,
    });
    const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
    const [levelCounts, setLevelCounts] = useState<Record<number, number>>({});

    // Sorting
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Filters
    const [filters, setFilters] = useState<UnitFilters>({
        name: '',
        levelMin: '',
        levelMax: '',
        rarityMin: '',
        rarityMax: '',
        countMin: '',
        countMax: '',
    });

    // Derived State
    const countFormationUnits = (): number => {
        if (!currentFormation) return 0;
        let count = 0;
        for (const row of currentFormation.tiles) {
            for (const unit of row) {
                if (unit) count++;
            }
        }
        return count;
    };

    const formationUnitCount = countFormationUnits();
    const totalUnitCount = units.length + formationUnitCount;

    const unitCounts = useMemo(() => {
        return units.reduce((acc, unit) => {
            const key = `${unit.name}-${unit.level}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [units]);

    const uniqueUnits = useMemo(() => {
        let result = Array.from(
            new Map(units.map((unit) => [`${unit.name}-${unit.level}`, unit])).values()
        );

        // Rarity order for range filtering
        const rarityOrder: Record<UnitRarity, number> = {
            [UnitRarity.Common]: 0,
            [UnitRarity.Rare]: 1,
            [UnitRarity.Epic]: 2,
            [UnitRarity.Legendary]: 3,
        };

        // Apply filters
        result = result.filter((unit) => {
            const key = `${unit.name}-${unit.level}`;
            const count = unitCounts[key];

            if (filters.name && !unit.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
            if (filters.levelMin && filters.levelMin !== '' && unit.level < parseInt(filters.levelMin)) return false;
            if (filters.levelMax && filters.levelMax !== '' && unit.level > parseInt(filters.levelMax)) return false;

            if (filters.rarityMin) {
                if (rarityOrder[unit.rarity] < rarityOrder[filters.rarityMin]) return false;
            }
            if (filters.rarityMax) {
                if (rarityOrder[unit.rarity] > rarityOrder[filters.rarityMax]) return false;
            }

            if (filters.countMin && filters.countMin !== '' && count < parseInt(filters.countMin)) return false;
            if (filters.countMax && filters.countMax !== '' && count > parseInt(filters.countMax)) return false;

            return true;
        });

        // Apply sorting
        if (sortColumn) {
            result.sort((a, b) => {
                let comparison = 0;
                switch (sortColumn) {
                    case 'name':
                        comparison = a.name.localeCompare(b.name);
                        break;
                    case 'level':
                        comparison = a.level - b.level;
                        break;
                    case 'rarity':
                        comparison = rarityOrder[a.rarity] - rarityOrder[b.rarity];
                        break;
                    case 'count': {
                        const keyA = `${a.name}-${a.level}`;
                        const keyB = `${b.name}-${b.level}`;
                        comparison = unitCounts[keyA] - unitCounts[keyB];
                        break;
                    }
                }
                return sortDirection === 'asc' ? comparison : -comparison;
            });
        } else {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        return result;
    }, [units, filters, sortColumn, sortDirection, unitCounts]);

    // Handlers
    const handleAddNew = () => {
        setIsAdding(true);
        setFormData({ name: '', level: 10, rarity: UnitRarity.Common, count: 1 });
        setSelectedLevels([]);
        setLevelCounts({});
    };

    const handleRowEdit = (unit: Unit) => {
        const unitCount = units.filter((u) => u.name === unit.name && u.level === unit.level && u.rarity === unit.rarity).length;
        setEditingRowId(unit.id);
        setRowEditData({
            [unit.id]: {
                name: unit.name,
                level: unit.level,
                rarity: unit.rarity,
                count: unitCount,
            },
        });
    };

    const handleRowEditChange = (unitId: string, field: string, value: string | number) => {
        setRowEditData((prev) => ({
            ...prev,
            [unitId]: {
                ...prev[unitId],
                [field]: value,
            },
        }));
    };

    const handleRowSave = () => {
        if (!editingRowId || !rowEditData[editingRowId]) return;

        const editData = rowEditData[editingRowId];
        const normalizedName = normalizeUnitName(editData.name.trim());
        const maxUnitsPerLevel = MAX_UNITS_PER_LEVEL;
        const count = Math.max(1, Math.min(maxUnitsPerLevel, editData.count));

        const unitData = getUnitDataByName(normalizedName);
        const finalRarity = unitData ? unitData.rarity : editData.rarity;
        const getPower = unitData ? unitData.getPower : (level: number) => calculateUnitPower(finalRarity, level);

        const matchingUnits = units.filter(
            (u) =>
                normalizeUnitName(u.name) === normalizedName &&
                u.level === editData.level
        );

        if (count < matchingUnits.length) {
            const toRemove = matchingUnits.slice(count);
            toRemove.forEach((u) => dispatch(removeUnit(u.id)));
        }

        matchingUnits.slice(0, count).forEach((u) => {
            dispatch(
                updateUnit({
                    ...u,
                    name: normalizedName,
                    level: editData.level,
                    rarity: finalRarity,
                    power: getPower(editData.level),
                })
            );
        });

        if (count > matchingUnits.length) {
            const toAdd = count - matchingUnits.length;
            const maxTotalUnits = MAX_TOTAL_UNITS;

            const totalSpace = maxTotalUnits - totalUnitCount;
            if (totalSpace <= 0) {
                alert(`Cannot add more units. Maximum total units (roster + formation) is ${maxTotalUnits}.`);
                return;
            }

            const unitsToAdd = Math.min(toAdd, totalSpace);
            if (unitsToAdd < toAdd) {
                alert(`Cannot add ${toAdd} units. Maximum total units (roster + formation) is ${maxTotalUnits}. You can add ${totalSpace} more unit${totalSpace !== 1 ? 's' : ''}.`);
            }

            for (let i = 0; i < unitsToAdd; i++) {
                const newUnit: Unit = {
                    id: `unit-${Date.now()}-${i}-${Math.random()}`,
                    name: normalizedName,
                    level: editData.level,
                    rarity: finalRarity,
                    power: getPower(editData.level),
                    imageUrl: '', // This will be handled by the component or utility if needed, but for now empty string or we can import getUnitImagePath
                };
                dispatch(addUnit(newUnit));
            }
        }

        setEditingRowId(null);
        setRowEditData({});
    };

    const handleRowCancel = () => {
        setEditingRowId(null);
        setRowEditData({});
    };

    const handleClearRoster = () => {
        if (window.confirm('Are you sure you want to clear all units from the roster? This action cannot be undone.')) {
            units.forEach((unit) => dispatch(removeUnit(unit.id)));
        }
    };

    const handleSave = () => {
        if (!formData.name.trim() || selectedLevels.length === 0) return;

        const normalizedName = normalizeUnitName(formData.name.trim());
        const unitData = getUnitDataByName(normalizedName);
        const finalRarity = unitData ? unitData.rarity : formData.rarity;
        const getPower = unitData ? unitData.getPower : (level: number) => calculateUnitPower(finalRarity, level);

        const maxTotalUnits = 1000;
        const maxUnitsPerLevel = MAX_UNITS_PER_LEVEL;

        let totalToAdd = 0;
        for (const level of selectedLevels) {
            totalToAdd += levelCounts[level];
        }

        const totalSpace = maxTotalUnits - totalUnitCount;
        if (totalSpace <= 0) {
            alert(`Cannot add more units. Maximum total units (roster + formation) is ${maxTotalUnits}.`);
            return;
        }

        if (totalToAdd > totalSpace) {
            alert(`Cannot add ${totalToAdd} units. Maximum total units (roster + formation) is ${maxTotalUnits}. You can add ${totalSpace} more unit${totalSpace !== 1 ? 's' : ''}.`);
            return;
        }

        for (const level of selectedLevels) {
            const levelCount = levelCounts[level];
            const existingCount = units.filter(
                (u) => normalizeUnitName(u.name) === normalizedName && u.level === level
            ).length;
            const available = maxUnitsPerLevel - existingCount;

            if (levelCount > available) {
                alert(`Cannot add ${levelCount} units. Maximum count for ${normalizedName} level ${level} is ${maxUnitsPerLevel}. You can add ${available} more unit${available !== 1 ? 's' : ''}.`);
                return;
            }
        }

        for (const level of selectedLevels) {
            const levelCount = levelCounts[level];
            const currentLevel = level;
            for (let i = 0; i < levelCount; i++) {
                const newUnit: Unit = {
                    id: `unit-${Date.now()}-${Math.random()}-${currentLevel}-${i}`,
                    name: normalizedName,
                    level: currentLevel,
                    rarity: finalRarity,
                    power: getPower(currentLevel),
                    imageUrl: '',
                };
                dispatch(addUnit(newUnit));
            }
        }

        setIsAdding(false);
        setFormData({ name: '', level: 10, rarity: UnitRarity.Common, count: 1 });
        setSelectedLevels([]);
        setLevelCounts({});
    };

    const handleCancel = () => {
        setIsAdding(false);
        setFormData({ name: '', level: 10, rarity: UnitRarity.Common, count: 1 });
        setSelectedLevels([]);
        setLevelCounts({});
    };

    const handleLevelToggle = (level: number) => {
        setSelectedLevels((prev) => {
            if (prev.includes(level)) {
                const newCounts = { ...levelCounts };
                delete newCounts[level];
                setLevelCounts(newCounts);
                return prev.filter((l) => l !== level);
            } else {
                setLevelCounts((prev) => ({ ...prev, [level]: 1 }));
                return [...prev, level].sort((a, b) => a - b);
            }
        });
    };

    const handleLevelCountChange = (level: number, count: number) => {
        setLevelCounts((prev) => ({
            ...prev,
            [level]: Math.max(1, Math.min(100, count || 1)),
        }));
    };

    const handleSelectAllLevels = () => {
        const allLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const defaultCount = 1;
        if (selectedLevels.length === 10) {
            setSelectedLevels([]);
            setLevelCounts({});
        } else {
            setSelectedLevels(allLevels);
            const defaultCounts = allLevels.reduce((acc, level) => {
                acc[level] = defaultCount;
                return acc;
            }, {} as Record<number, number>);
            setLevelCounts(defaultCounts);
        }
    };

    const handleDelete = (unitId: string) => {
        if (window.confirm('Are you sure you want to remove this unit from the roster?')) {
            dispatch(removeUnit(unitId));
        }
    };

    const handleNameChange = (name: string) => {
        const unitData = getUnitDataByName(name);
        setFormData((prev) => ({
            ...prev,
            name: name,
            rarity: unitData ? unitData.rarity : prev.rarity,
        }));
    };

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleFilterChange = (field: keyof UnitFilters, value: string | UnitRarity) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            name: '',
            levelMin: '',
            levelMax: '',
            rarityMin: '',
            rarityMax: '',
            countMin: '',
            countMax: ''
        });
    };

    return {
        units,
        uniqueUnits,
        unitCounts,
        formationUnitCount,
        isAdding,
        editingRowId,
        rowEditData,
        formData,
        selectedLevels,
        levelCounts,
        sortColumn,
        sortDirection,
        filters,
        handleAddNew,
        handleRowEdit,
        handleRowEditChange,
        handleRowSave,
        handleRowCancel,
        handleClearRoster,
        handleSave,
        handleCancel,
        handleLevelToggle,
        handleLevelCountChange,
        handleSelectAllLevels,
        handleDelete,
        handleNameChange,
        handleSort,
        handleFilterChange,
        handleClearFilters,
        setFormData,
    };
};
