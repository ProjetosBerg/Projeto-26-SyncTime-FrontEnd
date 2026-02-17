import { useCallback } from 'react';

export const POSSIBLE_FILTERS_ENTITIES = {
  USERS: 'Users',
  SYSTEM_CONFIG: 'System Config'
};

export const FILTER_KEYS = {
  USERS: 'user',
  SYSTEM_CONFIG: 'system-config-filters'
};

export const MEMORIZED_FILTERS_STORAGE_KEY_TO_BE_REMOVED =
  Object.values(FILTER_KEYS);

const getStorageKey = (typeOfFilter) => {
  const key = Object.keys(POSSIBLE_FILTERS_ENTITIES).find(
    (entity) => POSSIBLE_FILTERS_ENTITIES[entity] === typeOfFilter
  );
  return FILTER_KEYS[key] || '';
};

export const useMemorizeFilters = (typeOfFilter = '') => {
  let MEMORIZED_FILTERS_STORAGE_KEY = '';

  switch (typeOfFilter) {
    case 'Users':
      MEMORIZED_FILTERS_STORAGE_KEY = FILTER_KEYS.USERS;
      break;
    case 'System Config':
      MEMORIZED_FILTERS_STORAGE_KEY = FILTER_KEYS.SYSTEM_CONFIG;
      break;
    default:
      MEMORIZED_FILTERS_STORAGE_KEY = getStorageKey(typeOfFilter);
      break;
  }

  const getMemorizedFilters = useCallback(() => {
    const filters = localStorage.getItem(MEMORIZED_FILTERS_STORAGE_KEY);
    if (!filters) return null;
    return JSON.parse(filters);
  }, [MEMORIZED_FILTERS_STORAGE_KEY]);


  const memorizeFilters = useCallback(
    (filters) => {
      const filtersAsString = JSON.stringify(filters);
      localStorage.setItem(MEMORIZED_FILTERS_STORAGE_KEY, filtersAsString);
    },
    [MEMORIZED_FILTERS_STORAGE_KEY]
  );


  const changeUniqueMemorizedFilter = (key, value) => {
    let filters = getMemorizedFilters();
    if (filters) {
      filters = { ...filters, [key]: value };
      const filtersAsString = JSON.stringify(filters);
      localStorage.setItem(MEMORIZED_FILTERS_STORAGE_KEY, filtersAsString);
    }
    return filters;
  };


  const clearMemorizedFilters = useCallback(() => {
    localStorage.removeItem(MEMORIZED_FILTERS_STORAGE_KEY);
  }, [MEMORIZED_FILTERS_STORAGE_KEY]);

  const clearAllMemorizedFilters = useCallback(() => {
    MEMORIZED_FILTERS_STORAGE_KEY_TO_BE_REMOVED.forEach((key) => {
      localStorage.removeItem(key);
    });
  }, []);

  return {
    getMemorizedFilters,
    memorizeFilters,
    clearMemorizedFilters,
    changeUniqueMemorizedFilter,
    clearAllMemorizedFilters 
  };
};
