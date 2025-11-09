import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { serializeUnits, serializeFormation } from '../utils/urlSerialization';

/**
 * Hook to sync Redux state with URL query parameters
 * Updates URL when units or formation changes
 */
export function useUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const units = useAppSelector((state) => state.unit.units);
  // Use a selector that extracts the tiles array to ensure we detect changes
  // Even if the currentFormation object reference doesn't change, the tiles array will
  const formationTiles = useAppSelector((state) => state.formation.currentFormation?.tiles);
  const currentFormation = useAppSelector((state) => state.formation.currentFormation);
  const isInitialMount = useRef(true);
  const lastSerializedState = useRef<{ units: string; formation: string }>({ units: '', formation: '' });
  const searchParamsRef = useRef(searchParams);
  
  // Keep searchParams ref updated
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);
  
  useEffect(() => {
    // Serialize current state
    const unitsString = serializeUnits(units);
    const formationString = serializeFormation(currentFormation);
    
    // Check if we need to update URL
    const needsUpdate = 
      lastSerializedState.current.units !== unitsString ||
      lastSerializedState.current.formation !== formationString;
    
    // On initial mount, check if units or formation params are missing and add them if needed
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Store the initial serialized state for comparison
      lastSerializedState.current = { units: unitsString, formation: formationString };
      
      // Check if params are missing or need reordering
      const hasUnitsParam = searchParamsRef.current.has('units');
      const hasFormationParam = searchParamsRef.current.has('formation');
      
      // Always reorder params so formation comes before units
      // Check current order by getting all param keys
      const currentParamKeys = Array.from(searchParamsRef.current.keys());
      const unitsIndex = currentParamKeys.indexOf('units');
      const formationIndex = currentParamKeys.indexOf('formation');
      const needsReorder = hasUnitsParam && hasFormationParam && unitsIndex < formationIndex;
      
      // If either param is missing or needs reordering, update URL
      if (!hasUnitsParam || !hasFormationParam || needsReorder) {
        const params: string[] = [];
        
        // Add all existing params except units and formation
        searchParamsRef.current.forEach((value, key) => {
          if (key !== 'units' && key !== 'formation') {
            params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
          }
        });
        
        // Always add formation param first (even if empty)
        if (!hasFormationParam) {
          params.push(`formation=${formationString || ''}`);
        } else {
          // Keep existing formation param value if it exists
          const existingFormation = searchParamsRef.current.get('formation');
          if (existingFormation !== null) {
            params.push(`formation=${existingFormation}`);
          } else {
            params.push(`formation=${formationString || ''}`);
          }
        }
        
        // Always add units param second (even if empty)
        if (!hasUnitsParam) {
          params.push(`units=${unitsString || ''}`);
        } else {
          // Keep existing units param value if it exists
          const existingUnits = searchParamsRef.current.get('units');
          if (existingUnits !== null) {
            params.push(`units=${existingUnits}`);
          } else {
            params.push(`units=${unitsString || ''}`);
          }
        }
        
        // Update URL directly using window.history to avoid URLSearchParams encoding
        const newQueryString = params.length > 0 ? `?${params.join('&')}` : '';
        const newUrl = `${window.location.pathname}${newQueryString}${window.location.hash}`;
        window.history.replaceState({}, '', newUrl);
      }
      return;
    }
    
    // Only update if the serialized state actually changed
    // Also check if params need reordering (formation should come before units)
    const currentParamKeys = Array.from(searchParamsRef.current.keys());
    const unitsIndex = currentParamKeys.indexOf('units');
    const formationIndex = currentParamKeys.indexOf('formation');
    const needsReorder = unitsIndex !== -1 && formationIndex !== -1 && unitsIndex < formationIndex;
    
    if (needsUpdate || needsReorder) {
      // Update the stored state
      lastSerializedState.current = { units: unitsString, formation: formationString };
      
      // Manually construct query string to avoid escaping commas and hash symbols
      // Preserve other params from the current URL
      const params: string[] = [];
      
      // Add all existing params except units and formation
      searchParamsRef.current.forEach((value, key) => {
        if (key !== 'units' && key !== 'formation') {
          params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      });
      
      // Always add formation param first (even if empty)
      // Uses ";" as separator instead of "#" to avoid URL fragment issues
      params.push(`formation=${formationString || ''}`);
      
      // Always add units param second (even if empty)
      // Uses ";" as separator instead of "#" to avoid URL fragment issues
      // Commas (,) and semicolons (;) can remain unescaped in query parameter values
      params.push(`units=${unitsString || ''}`);
      
      // Update URL directly using window.history to avoid URLSearchParams encoding
      // Commas and semicolons remain unescaped
      const newQueryString = params.length > 0 ? `?${params.join('&')}` : '';
      const newUrl = `${window.location.pathname}${newQueryString}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);
      
      // Note: We don't call setSearchParams here because it would re-encode the values
      // React Router will detect the URL change via the browser's popstate event
      // The searchParams from useSearchParams will automatically update on the next render
    }
  }, [units, formationTiles, currentFormation, setSearchParams]);
}

