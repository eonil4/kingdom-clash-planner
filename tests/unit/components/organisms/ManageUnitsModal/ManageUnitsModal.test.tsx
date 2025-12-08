import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ManageUnitsModal } from '../../../../../src/components/organisms';
import { UnitRarity } from '../../../../../src/types';
import formationReducer from '../../../../../src/store/reducers/formationSlice';

vi.unmock('../../../../../src/components/organisms/ManageUnitsModal');
vi.unmock('../../../../../src/components/organisms');

vi.mock('../../../../../src/store/reducers/unitSlice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../src/store/reducers/unitSlice')>();
  return {
    ...actual,
    addUnit: vi.fn((unit) => ({ type: 'unit/addUnit', payload: unit })),
    removeUnit: vi.fn((id) => ({ type: 'unit/removeUnit', payload: id })),
    updateUnit: vi.fn((unit) => ({ type: 'unit/updateUnit', payload: unit })),
  };
});

import unitReducer from '../../../../../src/store/reducers/unitSlice';

vi.mock('../../../../../src/utils/imageUtils', () => ({
  getUnitImagePath: vi.fn((name) => `/images/${name}.png`),
}));

const mockNormalizeUnitName = vi.hoisted(() => vi.fn((name: string) => name.trim()));

vi.mock('../../../../../src/utils/unitNameUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../src/utils/unitNameUtils')>();
  return {
    ...actual,
    normalizeUnitName: mockNormalizeUnitName,
  };
});

vi.mock('../../../../../src/utils/powerUtils', () => ({
  calculateUnitPower: vi.fn(() => 100),
  formatNumber: vi.fn((value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')),
}));

vi.mock('../../../../../src/types/unitNames', () => ({
  UNIT_NAMES_ARRAY: ['TestUnit'],
  getUnitDataByName: vi.fn(() => ({
    name: 'TestUnit',
    rarity: UnitRarity.Common,
    getPower: () => 100,
  })),
}));

vi.mock('../../../../../src/components/atoms', async () => {
  const actual = await vi.importActual('../../../../../src/components/atoms');
  return {
    ...actual,
    IconButton: ({ icon, onClick, 'aria-label': ariaLabel }: { icon: React.ReactNode; onClick: () => void; 'aria-label'?: string }) => (
      <button onClick={onClick} aria-label={ariaLabel}>
        {icon}
      </button>
    ),
    Button: ({ children, onClick, variant, color, disabled }: { children: React.ReactNode; onClick?: () => void; variant?: string; color?: string; disabled?: boolean }) => (
      <button onClick={onClick} disabled={disabled} data-variant={variant} data-color={color}>
        {children}
      </button>
    ),
    Select: ({ children, value, onChange, ...props }: { children: React.ReactNode; value?: string | number; onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; [key: string]: unknown }) => (
      <select value={value} onChange={onChange} {...props}>
        {children}
      </select>
    ),
    TextField: ({ label, value, onChange, ...props }: { label?: string; value?: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; [key: string]: unknown }) => (
      <div>
        {label && <label>{label}</label>}
        <input value={value} onChange={onChange} {...props} />
      </div>
    ),
  };
});

vi.mock('../../../../../src/components/molecules', () => ({
  UnitCard: ({ unit }: { unit: { name: string; level: number } }) => (
    <div data-testid={`unit-card-${unit.name}-${unit.level}`}>
      {unit.name} Lv{unit.level}
    </div>
  ),
  UnitFilters: () => (
    <div data-testid="unit-filters">Filters</div>
  ),
  UnitTableRow: ({ unit }: { unit: { id: string; name: string } }) => (
    <tr data-testid={`unit-table-row-${unit.id}`}>
      <td>{unit.name}</td>
    </tr>
  ),
  SortableTableHeader: ({ label }: { label: string }) => (
    <th>{label}</th>
  ),
  FormationTile: vi.fn(() => <div data-testid="formation-tile">FormationTile</div>),
  FormationNameEditor: vi.fn(() => <div>Formation Name Editor</div>),
}));

vi.mock('../../../../../src/components/organisms/AddUnitForm', () => ({
  AddUnitForm: () => (
    <div data-testid="add-unit-form">
      <h3>Add New Unit</h3>
      <label>
        <input type="checkbox" data-testid="select-all-levels" />
        Select All Levels
      </label>
    </div>
  ),
  default: () => (
    <div data-testid="add-unit-form">
      <h3>Add New Unit</h3>
      <label>
        <input type="checkbox" data-testid="select-all-levels" />
        Select All Levels
      </label>
    </div>
  ),
}));

vi.mock('../../../../../src/components/organisms/UnitTable', () => ({
  UnitTable: ({ uniqueUnits }: { uniqueUnits: { id: string; name: string }[] }) => (
    <div data-testid="unit-table">
      <h3>Unit Roster</h3>
      <table>
        <tbody>
          {uniqueUnits.map((unit) => (
            <tr key={unit.id}>
              <td>{unit.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  default: ({ uniqueUnits }: { uniqueUnits: { id: string; name: string }[] }) => (
    <div data-testid="unit-table">
      <h3>Unit Roster</h3>
      <table>
        <tbody>
          {uniqueUnits.map((unit) => (
            <tr key={unit.id}>
              <td>{unit.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));

vi.mock('@mui/icons-material/Close', () => ({
  default: () => <span data-testid="close-icon" aria-label="Close">Close</span>,
}));

vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/material')>();
  return {
    ...actual,
    Dialog: ({ children, open, ...props }: { children: React.ReactNode; open: boolean; onClose?: () => void; maxWidth?: string; fullWidth?: boolean; PaperProps?: { className?: string }; [key: string]: unknown }) => {
      if (!open) return null;
      return (
        <div data-testid="mui-dialog" role="dialog" {...props}>
          {children}
        </div>
      );
    },
    DialogTitle: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div data-testid="dialog-title" {...props}>
        {children}
      </div>
    ),
    DialogContent: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div data-testid="dialog-content" {...props}>
        {children}
      </div>
    ),
    Box: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>
        {children}
      </div>
    ),
    Typography: ({ children, variant, ...props }: { children: React.ReactNode; variant?: string; [key: string]: unknown }) => {
      const Tag = variant === 'h6' ? 'h3' : 'div';
      return <Tag {...props}>{children}</Tag>;
    },
  };
});

const createMockStore = (units = [
  { id: '1', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
  { id: '2', name: 'TestUnit', level: 2, rarity: UnitRarity.Common, power: 100 },
]) => {
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
        currentFormation: {
          id: '1',
          name: 'Formation',
          tiles: Array(7).fill(null).map(() => Array(7).fill(null)),
          power: 0,
        },
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

describe('ManageUnitsModal', () => {
  const mockUnits = [
    { id: '1', name: 'TestUnit', level: 1, rarity: UnitRarity.Common, power: 100 },
    { id: '2', name: 'TestUnit', level: 2, rarity: UnitRarity.Common, power: 100 },
  ];

  const renderWithProvider = (component: React.ReactElement, units = mockUnits) => {
    const store = createMockStore(units);
    return render(
      <DndProvider backend={HTML5Backend}>
        <Provider store={store}>{component}</Provider>
      </DndProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    renderWithProvider(<ManageUnitsModal open={false} onClose={vi.fn()} />);
    
    expect(screen.queryByText(/manage units/i)).not.toBeInTheDocument();
  });

  it('should render when open is true', () => {
    renderWithProvider(<ManageUnitsModal open={true} onClose={vi.fn()} />);
    
    expect(screen.getByText(/manage units/i)).toBeInTheDocument();
  });

  it('should display unit count information', async () => {
    renderWithProvider(<ManageUnitsModal open={true} onClose={vi.fn()} />);
    
    await waitFor(() => {
      const elements = screen.getAllByText(/unit roster/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    renderWithProvider(<ManageUnitsModal open={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display units in the table', async () => {
    renderWithProvider(<ManageUnitsModal open={true} onClose={vi.fn()} />);
    
    await waitFor(() => {
      const unitElements = screen.getAllByText(/testunit/i);
      expect(unitElements.length).toBeGreaterThan(0);
    });
  });

  it('should show Add New Unit form when isAdding is true', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ManageUnitsModal open={true} onClose={vi.fn()} />);
    
    const addButton = await screen.findByText(/add new unit/i);
    await user.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText(/add new unit/i)).toBeInTheDocument();
    });
  });
});
