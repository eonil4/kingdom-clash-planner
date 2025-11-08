import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setUnits } from '../store/reducers/unitSlice';
import { setFormations, setCurrentFormation } from '../store/reducers/formationSlice';
import { allMockUnits, mockFormations } from '../utils/mockData';

export function useInitializeData() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setUnits(allMockUnits));
    dispatch(setFormations(mockFormations));
    if (mockFormations.length > 0) {
      dispatch(setCurrentFormation(mockFormations[0]));
    }
  }, [dispatch]);
}

