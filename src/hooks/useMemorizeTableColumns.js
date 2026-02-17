import { useCallback } from 'react';

export const TABLE_CONFIG_KEYS = {
  TRANSACTIONS_RECORDS: 'transactions-records-table-config',
};

/**
 * Hook para memorizar configurações de colunas da tabela no localStorage
 * @param {string} tableKey - Chave identificadora da tabela (usar TABLE_CONFIG_KEYS)
 * @returns {Object} Funções para manipular as configurações memorizadas
 */
export const useMemorizeTableColumns = (tableKey) => {
  const STORAGE_KEY = tableKey || '';

  /**
   * Busca as configurações memorizadas da tabela
   * @returns {Object|null} { visibleColumns: string[], columnOrder: string[] } ou null
   */
  const getMemorizedConfig = useCallback(() => {
    if (!STORAGE_KEY) return null;
    
    const config = localStorage.getItem(STORAGE_KEY);
    if (!config) return null;
    
    try {
      return JSON.parse(config);
    } catch (error) {
      console.error('Erro ao parsear configurações da tabela:', error);
      return null;
    }
  }, [STORAGE_KEY]);

  /**
   * Memoriza as configurações completas da tabela
   * @param {Object} config - { visibleColumns: string[], columnOrder: string[] }
   */
  const memorizeConfig = useCallback(
    (config) => {
      if (!STORAGE_KEY) return;
      
      const configAsString = JSON.stringify(config);
      localStorage.setItem(STORAGE_KEY, configAsString);
    },
    [STORAGE_KEY]
  );

  /**
   * Atualiza apenas as colunas visíveis
   * @param {string[]} visibleColumns - Array com as chaves das colunas visíveis
   */
  const memorizeVisibleColumns = useCallback(
    (visibleColumns) => {
      if (!STORAGE_KEY) return;
      
      let config = getMemorizedConfig() || {};
      config = { ...config, visibleColumns };
      memorizeConfig(config);
    },
    [STORAGE_KEY, getMemorizedConfig, memorizeConfig]
  );

  /**
   * Atualiza apenas a ordem das colunas
   * @param {string[]} columnOrder - Array com as chaves das colunas na ordem desejada
   */
  const memorizeColumnOrder = useCallback(
    (columnOrder) => {
      if (!STORAGE_KEY) return;
      
      let config = getMemorizedConfig() || {};
      config = { ...config, columnOrder };
      memorizeConfig(config);
    },
    [STORAGE_KEY, getMemorizedConfig, memorizeConfig]
  );

  /**
   * Atualiza uma configuração específica
   * @param {string} key - Nome da configuração (ex: 'visibleColumns', 'columnOrder')
   * @param {any} value - Valor da configuração
   */
  const changeUniqueConfig = useCallback(
    (key, value) => {
      if (!STORAGE_KEY) return null;
      
      let config = getMemorizedConfig() || {};
      config = { ...config, [key]: value };
      memorizeConfig(config);
      return config;
    },
    [STORAGE_KEY, getMemorizedConfig, memorizeConfig]
  );

  /**
   * Remove as configurações memorizadas da tabela
   */
  const clearMemorizedConfig = useCallback(() => {
    if (!STORAGE_KEY) return;
    localStorage.removeItem(STORAGE_KEY);
  }, [STORAGE_KEY]);

  /**
   * Remove todas as configurações de tabelas memorizadas
   */
  const clearAllMemorizedConfigs = useCallback(() => {
    Object.values(TABLE_CONFIG_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }, []);

  return {
    getMemorizedConfig,
    memorizeConfig,
    memorizeVisibleColumns,
    memorizeColumnOrder,
    changeUniqueConfig,
    clearMemorizedConfig,
    clearAllMemorizedConfigs,
  };
};