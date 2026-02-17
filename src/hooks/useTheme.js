import { useState, useEffect } from 'react';
import { useMemorizeFilters,POSSIBLE_FILTERS_ENTITIES } from './useMemorizeInputsFilters';

export const useTheme = () => {
  const { getMemorizedFilters, memorizeFilters } = useMemorizeFilters(POSSIBLE_FILTERS_ENTITIES.SYSTEM_CONFIG);
  const [theme, setThemeState] = useState(() => {
    try {
      const storedTheme = getMemorizedFilters()?.theme;
      
        return storedTheme;
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      memorizeFilters({...getMemorizedFilters(), theme });

      
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [theme]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
      const storedTheme = getMemorizedFilters()?.theme;
        setThemeState(storedTheme || 'dark');
      } catch (error) {
        console.error('Error reading theme from storage event:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleStorageChange);
    };
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme, setTheme };
};