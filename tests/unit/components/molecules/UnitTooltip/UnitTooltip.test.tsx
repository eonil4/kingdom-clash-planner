import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UnitTooltip from '../../../../../src/components/molecules/UnitTooltip/UnitTooltip';
import { UnitRarity } from '../../../../../src/types';

describe('UnitTooltip', () => {
  const createMockUnit = (overrides = {}) => ({
    id: 'test-id',
    name: 'TestUnit',
    level: 5,
    rarity: UnitRarity.Rare,
    power: 12500,
    ...overrides,
  });

  it('should render unit name', () => {
    // Arrange
    const unit = createMockUnit({ name: 'Archers' });

    // Act
    render(<UnitTooltip unit={unit} roles={[]} />);

    // Assert
    expect(screen.getByText('Archers')).toBeInTheDocument();
  });

  it('should render unit level', () => {
    // Arrange
    const unit = createMockUnit({ level: 7 });

    // Act
    render(<UnitTooltip unit={unit} roles={[]} />);

    // Assert
    expect(screen.getByText('Level:')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('should render unit rarity', () => {
    // Arrange
    const unit = createMockUnit({ rarity: UnitRarity.Epic });

    // Act
    render(<UnitTooltip unit={unit} roles={[]} />);

    // Assert
    expect(screen.getByText('Rarity:')).toBeInTheDocument();
    expect(screen.getByText(UnitRarity.Epic)).toBeInTheDocument();
  });

  it('should render formatted power', () => {
    // Arrange
    const unit = createMockUnit({ power: 25000 });

    // Act
    render(<UnitTooltip unit={unit} roles={[]} />);

    // Assert
    expect(screen.getByText('Power:')).toBeInTheDocument();
    expect(screen.getByText('25 000')).toBeInTheDocument();
  });

  it('should render zero power when power is undefined', () => {
    // Arrange
    const unit = createMockUnit({ power: undefined });

    // Act
    render(<UnitTooltip unit={unit} roles={[]} />);

    // Assert
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render roles when provided', () => {
    // Arrange
    const unit = createMockUnit();

    // Act
    render(<UnitTooltip unit={unit} roles={['Tank', 'DPS']} />);

    // Assert
    expect(screen.getByText('Roles:')).toBeInTheDocument();
    expect(screen.getByText('Tank, DPS')).toBeInTheDocument();
  });

  it('should not render roles section when roles array is empty', () => {
    // Arrange
    const unit = createMockUnit();

    // Act
    render(<UnitTooltip unit={unit} roles={[]} />);

    // Assert
    expect(screen.queryByText('Roles:')).not.toBeInTheDocument();
  });

  it('should render Legendary unit indicator', () => {
    // Arrange
    const unit = createMockUnit({ rarity: UnitRarity.Legendary });

    // Act
    render(<UnitTooltip unit={unit} roles={[]} />);

    // Assert
    expect(screen.getByText('⭐ Legendary Unit')).toBeInTheDocument();
  });

  it('should render Epic unit indicator', () => {
    // Arrange
    const unit = createMockUnit({ rarity: UnitRarity.Epic });

    // Act
    render(<UnitTooltip unit={unit} roles={[]} />);

    // Assert
    expect(screen.getByText('💜 Epic Unit')).toBeInTheDocument();
  });

  it('should render Rare unit indicator', () => {
    // Arrange
    const unit = createMockUnit({ rarity: UnitRarity.Rare });

    // Act
    render(<UnitTooltip unit={unit} roles={[]} />);

    // Assert
    expect(screen.getByText('💙 Rare Unit')).toBeInTheDocument();
  });

  it('should render Common unit indicator', () => {
    // Arrange
    const unit = createMockUnit({ rarity: UnitRarity.Common });

    // Act
    render(<UnitTooltip unit={unit} roles={[]} />);

    // Assert
    expect(screen.getByText('⚪ Common Unit')).toBeInTheDocument();
  });
});
