import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setUnits } from '../store/reducers/unitSlice';
import { setFormations, setCurrentFormation } from '../store/reducers/formationSlice';
import { mockFormations } from '../utils/mockData';

export function useInitializeData() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize with empty unit roster
    dispatch(setUnits([]));
    dispatch(setFormations(mockFormations));
    if (mockFormations.length > 0) {
      dispatch(setCurrentFormation(mockFormations[0]));
    }
  }, [dispatch]);
}

