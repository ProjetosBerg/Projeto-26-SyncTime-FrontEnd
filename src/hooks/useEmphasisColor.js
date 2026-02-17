import { useState, useEffect } from 'react';
import { useMemorizeFilters, POSSIBLE_FILTERS_ENTITIES } from './useMemorizeInputsFilters';

export const useEmphasisColor = () => {
  const { getMemorizedFilters, memorizeFilters } = useMemorizeFilters(
    POSSIBLE_FILTERS_ENTITIES.SYSTEM_CONFIG
  );
  
  const [emphasisColor, setEmphasisColorState] = useState(() => {
    try {
      const storedColor = getMemorizedFilters()?.emphasisColor;
      return storedColor;
    } catch (error) {
      console.error('Error reading emphasisColor from localStorage:', error);
    }
    return 'rgb(20, 18, 129)'; 
  });

  useEffect(() => {
    try {
      memorizeFilters({...getMemorizedFilters(), emphasisColor });
      
      window.dispatchEvent(
        new CustomEvent('emphasisColorChange', { 
          detail: { emphasisColor } 
        })
      );
    } catch (error) {
      console.error('Error saving emphasisColor to localStorage:', error);
    }
  }, [emphasisColor]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedColor = getMemorizedFilters()?.emphasisColor;
        setEmphasisColorState(storedColor || 'rgb(20, 18, 129)');
      } catch (error) {
        console.error('Error reading emphasisColor from storage event:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('emphasisColorChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('emphasisColorChange', handleStorageChange);
    };
  }, []);

  const setEmphasisColor = (newColor) => {
    setEmphasisColorState(newColor);
  };

  return { emphasisColor, setEmphasisColor };
};