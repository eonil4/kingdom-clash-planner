import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setUnits } from '../store/reducers/unitSlice';
import { setCurrentFormation } from '../store/reducers/formationSlice';
import { deserializeUnits, deserializeFormation } from '../utils/urlSerialization';
import { FORMATION_GRID_SIZE, DEFAULT_FORMATION_NAME } from '../constants';

export function useInitializeData() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Check URL params first
    // Uses ";" as separator instead of "#" to avoid URL fragment issues
    const unitsParam = searchParams.get('units');
    const formationParam = searchParams.get('formation');
    
    // Load units from URL if valid, otherwise initialize empty
    if (unitsParam && unitsParam.trim()) {
      try {
        const units = deserializeUnits(unitsParam);
        // deserializeUnits always returns an array (may be empty if invalid data)
        // If we have a param, use the deserialized result (even if empty due to invalid data)
        dispatch(setUnits(units));
      } catch (error) {
        console.error('Failed to deserialize units from URL:', error);
        dispatch(setUnits([]));
      }
    } else {
      dispatch(setUnits([]));
    }
    
    // Load formation from URL if valid, otherwise use default empty formation
    if (formationParam && formationParam.trim()) {
      try {
        const { name, tiles } = deserializeFormation(formationParam);
        // Validate that we got a proper FORMATION_GRID_SIZE x FORMATION_GRID_SIZE grid
        if (tiles && tiles.length === FORMATION_GRID_SIZE && tiles.every(row => row.length === FORMATION_GRID_SIZE)) {
          // Calculate power using the same logic as the reducer
          let power = 0;
          for (const row of tiles) {
            for (const unit of row) {
              if (unit) {
                power += unit.power;
              }
            }
          }
          const formation = {
            id: '1',
            name, // Use the name from the URL
            tiles,
            power,
          };
          dispatch(setCurrentFormation(formation));
        } else {
          // Invalid formation, use default empty formation
          const defaultFormation = {
            id: '1',
            name: DEFAULT_FORMATION_NAME,
            tiles: Array(FORMATION_GRID_SIZE)
              .fill(null)
              .map(() => Array(FORMATION_GRID_SIZE).fill(null)),
            power: 0,
          };
          dispatch(setCurrentFormation(defaultFormation));
        }
      } catch (error) {
        console.error('Failed to deserialize formation from URL:', error);
        // Use default empty formation on error
        const defaultFormation = {
          id: '1',
          name: DEFAULT_FORMATION_NAME,
          tiles: Array(FORMATION_GRID_SIZE)
            .fill(null)
            .map(() => Array(FORMATION_GRID_SIZE).fill(null)),
          power: 0,
        };
        dispatch(setCurrentFormation(defaultFormation));
      }
    } else {
      // No formation in URL, use default empty formation
      const defaultFormation = {
        id: '1',
        name: DEFAULT_FORMATION_NAME,
        tiles: Array(FORMATION_GRID_SIZE)
          .fill(null)
          .map(() => Array(FORMATION_GRID_SIZE).fill(null)),
        power: 0,
      };
      dispatch(setCurrentFormation(defaultFormation));
    }
  }, [dispatch, searchParams]);
}
