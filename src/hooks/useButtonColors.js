import { useState, useEffect } from 'react';
import { useMemorizeFilters, POSSIBLE_FILTERS_ENTITIES } from './useMemorizeInputsFilters';

export const useButtonColors = () => {
  const { getMemorizedFilters, memorizeFilters } = useMemorizeFilters(
    POSSIBLE_FILTERS_ENTITIES.SYSTEM_CONFIG
  );
  
  const [primaryButtonColor, setPrimaryButtonColorState] = useState(() => {
    try {
      const storedPrimary = getMemorizedFilters()?.primaryButtonColor;
      return storedPrimary || 'rgb(20, 18, 129)';
    } catch (error) {
      console.error('Error reading primaryButtonColor from localStorage:', error);
      return 'rgb(20, 18, 129)';
    }
  });

  const [secondaryButtonColor, setSecondaryButtonColorState] = useState(() => {
    try {
      const storedSecondary = getMemorizedFilters()?.secondaryButtonColor;
      return storedSecondary || 'rgb(100, 100, 100)';
    } catch (error) {
      console.error('Error reading secondaryButtonColor from localStorage:', error);
      return 'rgb(100, 100, 100)';
    }
  });

  useEffect(() => {
    try {
      const currentConfig = getMemorizedFilters() || {};
      memorizeFilters({
        ...currentConfig,
        primaryButtonColor,
        secondaryButtonColor
      });
      
      window.dispatchEvent(
        new CustomEvent('buttonColorsChange', { 
          detail: { primaryButtonColor, secondaryButtonColor } 
        })
      );
    } catch (error) {
      console.error('Error saving button colors to localStorage:', error);
    }
  }, [primaryButtonColor, secondaryButtonColor]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedConfig = getMemorizedFilters();
        setPrimaryButtonColorState(storedConfig?.primaryButtonColor || 'rgb(20, 18, 129)');
        setSecondaryButtonColorState(storedConfig?.secondaryButtonColor || 'rgb(100, 100, 100)');
      } catch (error) {
        console.error('Error reading button colors from storage event:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('buttonColorsChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('buttonColorsChange', handleStorageChange);
    };
  }, []);

  const setPrimaryButtonColor = (newColor) => {
    setPrimaryButtonColorState(newColor);
  };

  const setSecondaryButtonColor = (newColor) => {
    setSecondaryButtonColorState(newColor);
  };

  return { 
    primaryButtonColor, 
    setPrimaryButtonColor,
    secondaryButtonColor,
    setSecondaryButtonColor
  };
};