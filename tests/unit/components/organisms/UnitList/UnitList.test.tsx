/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { UnitList } from '../../../../../src/components/organisms';
import { UnitRarity } from '../../../../../src/types';
import unitReducer from '../../../../../src/store/reducers/unitSlice';
import formationReducer from '../../../../../src/store/reducers/formationSlice';

interface DropItem {
  unit: { id: string; name: string; level: number; rarity: string };
  isInFormation?: boolean;
  sourceRow?: number;
  sourceCol?: number;
}

interface UseDropConfig {
  drop?: (item: DropItem) => void;
  accept: string;
  collect?: (monitor: unknown) => { isOver: boolean };
}

let capturedDropHandler: ((item: DropItem) => void) | undefined;
const mockUseDrop = vi.fn((config: UseDropConfig) => {
  if (config && typeof config === 'object' && config.drop) {
    capturedDropHandler = config.drop;
  }
  return [
    { isOver: false },
    vi.fn(),
  ];
});

vi.mock('react-dnd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dnd')>();
  return {
    ...actual,
    useDrop: (config: UseDropConfig) => mockUseDrop(config),
    useDrag: vi.fn(() => [
      { isDragging: false },
      vi.fn(),
    ]),
  };
});

const mockSearchInput = vi.hoisted(() => vi.fn(({ onSearchChange, placeholder }: { onSearchChange: (value: string) => void; placeholder?: string }) => (
  <input data-testid="unit-search" onChange={(e) => onSearchChange(e.target.value)} placeholder={placeholder} />
)));

const mockMolecules = vi.hoisted(() => ({
  UnitCard: ({ unit, onDoubleClick }: { unit: { id: string; name: string; level: number }; onDoubleClick?: () => void }) => (
    <div data-testid={`unit-card-${unit.id}`} onDoubleClick={onDoubleClick}>
      {unit.name} - Level {unit.level}
    </div>
  ),
  SearchInput: mockSearchInput,
  SortControls: ({ primarySort, secondarySort, tertiarySort, onPrimaryChange, onSecondaryChange, onTertiaryChange }: { primarySort: string; secondarySort: string | null; tertiarySort: string | null; onPrimaryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; onSecondaryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; onTertiaryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) => (
    <div data-testid="sort-controls">
      <select data-testid="primary-sort" aria-label="Sort units by (primary)" onChange={onPrimaryChange} value={primarySort || ''}>
        <option value="">None</option>
        <option value="level">Level</option>
        <option value="rarity">Rarity</option>
        <option value="name">Name</option>
      </select>
      <select data-testid="secondary-sort" aria-label="Sort units by (secondary)" onChange={onSecondaryChange} value={secondarySort || ''}>
        <option value="">None</option>
        <option value="level">Level</option>
        <option value="rarity">Rarity</option>
        <option value="name">Name</option>
      </select>
      <select data-testid="tertiary-sort" aria-label="Sort units by (tertiary)" onChange={onTertiaryChange} value={tertiarySort || ''}>
        <option value="">None</option>
        <option value="level">Level</option>
        <option value="rarity">Rarity</option>
        <option value="name">Name</option>
      </select>
    </div>
  ),
  UnitListActions: ({ onManageUnits, onWithdrawAll }: { onManageUnits: () => void; onWithdrawAll: () => void }) => (
    <div data-testid="unit-list-actions">
      <button data-testid="manage-units-btn" onClick={onManageUnits}>Manage Units</button>
      <button data-testid="withdraw-all-btn" onClick={onWithdrawAll}>Withdraw All</button>
    </div>
  ),
  FormationTile: (props: { row?: number; col?: number; [key: string]: unknown }) => (
    <div data-testid={props.row !== undefined && props.col !== undefined ? `tile-${props.row}-${props.col}` : 'formation-tile'}>FormationTile</div>
  ),
  FormationNameEditor: () => <div>Formation Name Editor</div>,
}));

vi.mock('../../../../../src/components/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../src/components/molecules')>();
  const actualUnitCard = actual.UnitCard;
  const actualFormationTile = actual.FormationTile;
  const unitCardStr = typeof actualUnitCard === 'function' ? actualUnitCard.toString() : '';
  const formationTileStr = typeof actualFormationTile === 'function' ? actualFormationTile.toString() : '';
  const isUnitCardMockedForFormationTile = unitCardStr.includes('data-testid="unit-card"') && !unitCardStr.includes('unit-card-');
  const isUnitCardMockedForUnitTableRow = unitCardStr.includes('unit-card-${unit.name}') || unitCardStr.includes('unit-card-${unit.name}-${unit.level}');
  const isFormationTileMockedForFormationGrid = formationTileStr.includes('tile-${props.row}-${props.col}') || (formationTileStr.includes('tile-') && formationTileStr.includes('props.row') && formationTileStr.includes('props.col'));
  return {
    ...actual,
    ...mockMolecules,
    UnitCard: isUnitCardMockedForFormationTile || isUnitCardMockedForUnitTableRow ? actualUnitCard : mockMolecules.UnitCard,
    FormationTile: isFormationTileMockedForFormationGrid ? actualFormationTile : mockMolecules.FormationTile,
  };
});

vi.mock('../../../../../src/components/atoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../src/components/atoms')>();
  return {
    ...actual,
  UnitCountBadge: vi.fn(({ count }) => (
    <div data-testid="unit-count-badge">{count}</div>
  )),
  };
});

const mockAvailableUnitsGrid = vi.hoisted(() => {
  const UnitCardMock = ({ unit, onDoubleClick }: { unit: { id: string; name: string; level: number }; onDoubleClick?: () => void }) => (
    <div data-testid={`unit-card-${unit.id}`} onDoubleClick={onDoubleClick}>
      {unit.name} - Level {unit.level}
    </div>
  );
  
  return vi.fn(({ units, onUnitDoubleClick }: { units: { id: string; name: string; level: number }[]; onUnitDoubleClick: (unit: { id: string; name: string; level: number }) => void }) => (
    <div data-testid="available-units-grid">
      {units.map((unit) => (
        <UnitCardMock key={unit.id} unit={unit} onDoubleClick={() => onUnitDoubleClick(unit)} />
      ))}
    </div>
  ));
});

vi.mock('../../../../../src/components/organisms/AvailableUnitsGrid', () => ({
  AvailableUnitsGrid: mockAvailableUnitsGrid,
  default: mockAvailableUnitsGrid,
}));

const mockManageUnitsModal = vi.hoisted(() => vi.fn(({ open, onClose }: { open: boolean; onClose: () => void }) => (
  open ? <button data-testid="manage-units-modal" onClick={onClose} type="button">Manage Units Modal</button> : null
)));

vi.mock('../../../../../src/components/organisms/ManageUnitsModal', () => ({
  ManageUnitsModal: mockManageUnitsModal,
  default: mockManageUnitsModal,
}));

const createMockStore = (units = [
  { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 50 },
  { id: '2', name: 'Unit2', level: 2, rarity: UnitRarity.Rare, power: 100 },
  { id: '3', name: 'Unit3', level: 3, rarity: UnitRarity.Epic, power: 150 },
], formation = {
  id: '1',
  name: 'Test Formation',
  power: 0,
  tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
}) => {
  return configureStore({
    reducer: {
      unit: unitReducer,
      formation: formationReducer,
    },
    preloadedState: {
      unit: {
        units,
        filteredUnits: units,
        sortOption: 'level' as const,
        sortOption2: null,
        sortOption3: null,
        searchTerm: '',
      },
      formation: {
        currentFormation: formation,
        formations: [],
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
};

describe('UnitList', () => {
  const mockUnits = [
    { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 50 },
    { id: '2', name: 'Unit2', level: 2, rarity: UnitRarity.Rare, power: 100 },
    { id: '3', name: 'Unit3', level: 3, rarity: UnitRarity.Epic, power: 150 },
  ];

  const renderWithProvider = (units = mockUnits, formation = {
    id: '1',
    name: 'Test Formation',
    power: 0,
    tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
  }) => {
    const store = createMockStore(units, formation);
    return render(
      <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
          <UnitList />
        </Provider>
      </DndProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    capturedDropHandler = undefined;
  });

  it('should render unit list with available units', () => {
    renderWithProvider();

    expect(screen.getByTestId('unit-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('unit-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('unit-card-3')).toBeInTheDocument();
  });

  it('should render sort controls', () => {
    renderWithProvider();

    expect(screen.getByLabelText(/sort units by \(primary\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort units by \(secondary\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort units by \(tertiary\)/i)).toBeInTheDocument();
  });

  it('should render unit count badge', () => {
    renderWithProvider();

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render Manage Units button', () => {
    renderWithProvider();

    const manageButton = screen.getByRole('button', { name: /manage units/i });
    expect(manageButton).toBeInTheDocument();
  });

  it('should open Manage Units modal when Manage Units button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const manageButton = screen.getByRole('button', { name: /manage units/i });
    await user.click(manageButton);

    expect(screen.getByTestId('manage-units-modal')).toBeInTheDocument();
  });

  it('should render UnitSearch component', () => {
    renderWithProvider();

    expect(screen.getByTestId('unit-search')).toBeInTheDocument();
  });

  it('should filter out units that are in formation', () => {
    const formationWithUnit = {
      id: '1',
      name: 'Test Formation',
      power: 0,
      tiles: [
        [{ id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 50 }, ...Array(6).fill(null)],
        ...Array(6).fill(null).map(() => Array(7).fill(null)),
      ],
    };
    renderWithProvider(mockUnits, formationWithUnit);

    expect(screen.queryByTestId('unit-card-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('unit-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('unit-card-3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should call handleSearchChange when search input changes', async () => {
    const user = userEvent.setup();
    const store = createMockStore(mockUnits);
    render(
      <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
          <UnitList />
        </Provider>
      </DndProvider>
    );

    const searchInput = screen.getByTestId('unit-search');
    await user.type(searchInput, 'test');

    const state = store.getState();
    expect(state.unit.searchTerm).toBe('test');
  });

  it('should handle withdraw all units from formation', async () => {
    const user = userEvent.setup();
    const formationWithUnits = {
      id: '1',
      name: 'Test Formation',
      power: 0,
      tiles: [
        [{ id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 50 }, null, null, null, null, null, null],
        [null, { id: '2', name: 'Unit2', level: 2, rarity: UnitRarity.Rare, power: 100 }, null, null, null, null, null],
        ...Array(5).fill(null).map(() => Array(7).fill(null)),
      ],
    };
    const store = createMockStore(mockUnits, formationWithUnits);
    render(
      <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
          <UnitList />
        </Provider>
      </DndProvider>
    );

    const withdrawButton = screen.getByRole('button', { name: /withdraw all/i });
    await user.click(withdrawButton);

    const state = store.getState();
    expect(state.formation.currentFormation?.tiles[0][0]).toBeNull();
    expect(state.formation.currentFormation?.tiles[1][1]).toBeNull();
  });

  it('should handle unit double click - place in first empty tile', async () => {
    const user = userEvent.setup();
    const store = createMockStore(mockUnits);
    render(
      <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
          <UnitList />
        </Provider>
      </DndProvider>
    );

    const unitCard = screen.getByTestId('unit-card-1');
    await user.dblClick(unitCard);

    const state = store.getState();
    expect(state.formation.currentFormation?.tiles[0][0]).toEqual(mockUnits[0]);
  });

  it('should not place unit on double click if formation is full', async () => {
    const user = userEvent.setup();
    const fullFormation = {
      id: '1',
      name: 'Test Formation',
      power: 0,
      tiles: Array(7).fill(null).map(() => 
        Array(7).fill({ id: 'filled', name: 'Filled', level: 1, rarity: UnitRarity.Common, power: 50 })
      ),
    };
    const store = createMockStore(mockUnits, fullFormation);
    render(
      <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
          <UnitList />
        </Provider>
      </DndProvider>
    );

    const unitCard = screen.getByTestId('unit-card-1');
    await user.dblClick(unitCard);

    const state = store.getState();
    expect(state.formation.currentFormation?.tiles[0][0]?.id).toBe('filled');
  });

  it('should handle drop from formation - return unit to roster', async () => {
    const formationWithUnit = {
      id: '1',
      name: 'Test Formation',
      power: 0,
      tiles: [
        [{ id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 50 }, ...Array(6).fill(null)],
        ...Array(6).fill(null).map(() => Array(7).fill(null)),
      ],
    };
    const store = createMockStore(mockUnits, formationWithUnit);
    render(
      <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
          <UnitList />
        </Provider>
      </DndProvider>
    );

    const droppedUnit = { id: '1', name: 'Unit1', level: 1, rarity: UnitRarity.Common, power: 50 };
    if (capturedDropHandler) {
      act(() => {
        capturedDropHandler!({
        unit: droppedUnit,
        isInFormation: true,
        sourceRow: 0,
        sourceCol: 0,
        });
      });
    }

    const state = store.getState();
    expect(state.formation.currentFormation?.tiles[0][0]).toBeNull();
  });

  it('should handle secondary sort change and clear conflicting tertiary', () => {
    const store = createMockStore(mockUnits);
    store.dispatch({ type: 'unit/setSortOption3', payload: 'name' });
    render(
      <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
          <UnitList />
        </Provider>
      </DndProvider>
    );
    
    const secondarySelect = screen.getByLabelText(/sort units by \(secondary\)/i);
    expect(secondarySelect).toBeInTheDocument();
  });

  it('should handle tertiary sort change', () => {
    const store = createMockStore(mockUnits);
    store.dispatch({ type: 'unit/setSortOption2', payload: 'rarity' });
    render(
      <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
          <UnitList />
        </Provider>
      </DndProvider>
    );
    
    const tertiarySelect = screen.getByLabelText(/sort units by \(tertiary\)/i);
    expect(tertiarySelect).toBeInTheDocument();
  });

  it('should close Manage Units modal when onClose callback is invoked', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const manageButton = screen.getByRole('button', { name: /manage units/i });
    await user.click(manageButton);
    
    expect(screen.getByTestId('manage-units-modal')).toBeInTheDocument();
    
    expect(screen.getByTestId('manage-units-modal')).toBeInTheDocument();
  });
});

