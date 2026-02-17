import { useState, useRef, useEffect } from 'react';
import { Filter, X, Plus, ChevronDown, Check, RotateCcw, Download } from 'lucide-react';
import styles from './TableHeaderWithFilter.module.css';
import { useTheme } from '../../../hooks/useTheme';
import { useEmphasisColor } from '../../../hooks/useEmphasisColor';
import xlsxImage from '../../../assets/xlsx.png';
import pdfImage from '../../../assets/pdf.png';
import csvImage from '../../../assets/csv.png';
const TableHeaderWithFilter = ({ 
  title, 
  columns = [], 
  onFiltersChange,
  showDisabledToggle = false,
  showDisabled = false,
  onToggleDisabled,
  isExportacao = false,
  onExport
}) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [filters, setFilters] = useState([]); 
  const [draftFilters, setDraftFilters] = useState([]); 
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const panelRef = useRef(null);
  const exportRef = useRef(null);

  const accentColor = emphasisColor || '#0ea5e9';

  const operators = {
    text: [
      { value: 'contains', label: 'Contém' },
      { value: 'equals', label: 'É igual a' },
      { value: 'startsWith', label: 'Começa com' },
      { value: 'endsWith', label: 'Termina com' }
    ],
    number: [
      { value: 'equals', label: 'Igual a' },
      { value: 'gt', label: 'Maior que' },
      { value: 'lt', label: 'Menor que' },
      { value: 'gte', label: 'Maior ou igual' },
      { value: 'lte', label: 'Menor ou igual' },
      { value: 'between', label: 'Entre' }
    ],
    date: [
      { value: 'equals', label: 'Na data' },
      { value: 'gt', label: 'Depois de' },
      { value: 'lt', label: 'Antes de' },
      { value: 'between', label: 'Entre' }
    ]
  };

  const exportFormats = [
    { value: 'csv', label: 'CSV', icon: <img src={csvImage} alt="CSV" style={{ width: '16px', height: '16px' }} /> },
    { value: 'xlsx', label: 'XLSX', icon: <img src={xlsxImage} alt="XLSX" style={{ width: '16px', height: '16px' }} /> },
    { value: 'pdf', label: 'PDF', icon: <img src={pdfImage} alt="PDF" style={{ width: '16px', height: '16px' }} /> }
  ];

  const addAlpha = (color, alpha) => {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        handleCancel();
      }
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };

    if (showFilterPanel || showExportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterPanel, showExportDropdown]);

  useEffect(() => {
    const activeCount = filters.filter(f => f.value && f.value.trim() !== '').length;
    setActiveFiltersCount(activeCount);
  }, [filters]);

  useEffect(() => {
    if (showFilterPanel) {
      setDraftFilters([...filters]);
    }
  }, [showFilterPanel, filters]);

  const handleApply = () => {
    const cleanedFilters = draftFilters.filter(f => {
      if (!f.value || f.value.trim() === '') {
        return false;
      }
      if (f.operator === 'between' && (!f.value2 || f.value2.trim() === '')) {
        return false;
      }
      return true;
    });

    setFilters(cleanedFilters);
    
    if (onFiltersChange) {
      onFiltersChange(cleanedFilters);
    }
    
    setShowFilterPanel(false);
  };

  const handleCancel = () => {
    setDraftFilters([...filters]); 
    setShowFilterPanel(false);
  };

  const addFilter = () => {
    const newFilter = {
      id: Date.now(),
      column: columns[0]?.id || '',
      operator: operators[columns[0]?.type || 'text'][0].value,
      value: '',
      value2: '' 
    };
    setDraftFilters([...draftFilters, newFilter]);
  };

  const removeFilter = (id) => {
    setDraftFilters(draftFilters.filter(f => f.id !== id));
  };

  const updateFilter = (id, field, value) => {
    setDraftFilters(draftFilters.map(f => {
      if (f.id === id) {
        const updated = { ...f, [field]: value };
        
        if (field === 'column') {
          const column = columns.find(col => col.id === value);
          updated.operator = operators[column?.type || 'text'][0].value;
          updated.value = '';
          updated.value2 = '';
        }
        
        return updated;
      }
      return f;
    }));
  };

  const clearAllFilters = () => {
    setDraftFilters([]);
  };

  const hasDraftChanges = JSON.stringify(draftFilters) !== JSON.stringify(filters);

  const handleExportClick = (format) => {
    if (onExport) {
      onExport(format);
    }
    setShowExportDropdown(false);
  };

  return (
    <div className={`${styles.headerContainer} ${styles[theme]}`}>
      <h2 className={styles.headerTitle}>{title}</h2>
      
      <div className={styles.headerActions}>
        <div className={styles.filterContainer} ref={panelRef}>
          <button
            className={`${styles.filterButton} ${showFilterPanel ? styles.active : ''}`}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            style={{
              '--focus-border-color': accentColor,
              '--focus-shadow-color': addAlpha(accentColor, theme === 'dark' ? 0.2 : 0.1),
              '--accent-color': accentColor
            }}
          >
            <Filter size={18} className={styles.filterIcon} />
            Filtros
            <ChevronDown 
              size={16} 
              className={`${styles.chevronIcon} ${showFilterPanel ? styles.rotated : ''}`} 
            />
            {activeFiltersCount > 0 && (
              <span className={styles.filterBadge}>{activeFiltersCount}</span>
            )}
          </button>

          {showFilterPanel && (
            <div className={styles.filterPanel}>
              <div className={styles.filterHeader}>
                <div className={styles.filterCount}>
                  <Filter size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  {draftFilters.length} {draftFilters.length === 1 ? 'Filtro' : 'Filtros'}
                  {hasDraftChanges && (
                    <span className={styles.draftIndicator}>(não aplicado)</span>
                  )}
                </div>
                {draftFilters.length > 0 && (
                  <button className={styles.clearAllButton} onClick={clearAllFilters}>
                    Limpar tudo
                  </button>
                )}
              </div>

              <div className={styles.filterBody}>
                {draftFilters.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Filter size={40} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>Nenhum filtro adicionado</p>
                    <p className={styles.emptySubtext}>
                      Adicione filtros para refinar sua busca
                    </p>
                  </div>
                ) : (
                  <div className={styles.filtersList}>
                    {draftFilters.map(filter => {
                      const column = columns.find(col => col.id === filter.column);
                      const columnType = column?.type || 'text';
                      const isBetween = filter.operator === 'between';

                      return (
                        <div key={filter.id} className={`${styles.filterItem} ${isBetween ? styles.between : ''}`}>
                          <div className={styles.filterRow}>
                            <select
                              className={styles.filterSelect}
                              value={filter.column}
                              onChange={(e) => updateFilter(filter.id, 'column', e.target.value)}
                              style={{
                                '--focus-border-color': accentColor,
                                '--focus-shadow-color': addAlpha(accentColor, theme === 'dark' ? 0.2 : 0.1)
                              }}
                            >
                              {columns.map(col => (
                                <option key={col.id} value={col.id}>
                                  {col.label}
                                </option>
                              ))}
                            </select>

                            <select
                              className={styles.filterSelect}
                              value={filter.operator}
                              onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                              style={{
                                '--focus-border-color': accentColor,
                                '--focus-shadow-color': addAlpha(accentColor, theme === 'dark' ? 0.2 : 0.1)
                              }}
                            >
                              {operators[columnType].map(op => (
                                <option key={op.value} value={op.value}>
                                  {op.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className={styles.filterRow}>
                            <input
                              type={columnType === 'date' ? 'date' : columnType === 'number' ? 'number' : 'text'}
                              className={styles.filterInput}
                              placeholder={isBetween ? 'Valor inicial' : 'Valor'}
                              value={filter.value}
                              onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                              style={{
                                '--focus-border-color': accentColor,
                                '--focus-shadow-color': addAlpha(accentColor, theme === 'dark' ? 0.2 : 0.1)
                              }}
                            />

                            {isBetween && (
                              <input
                                type={columnType === 'date' ? 'date' : columnType === 'number' ? 'number' : 'text'}
                                className={styles.filterInput}
                                placeholder="Valor final"
                                value={filter.value2}
                                onChange={(e) => updateFilter(filter.id, 'value2', e.target.value)}
                                style={{
                                  '--focus-border-color': accentColor,
                                  '--focus-shadow-color': addAlpha(accentColor, theme === 'dark' ? 0.2 : 0.1)
                                }}
                              />
                            )}

                            <button
                              className={styles.removeFilterButton}
                              onClick={() => removeFilter(filter.id)}
                              title="Remover filtro"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button 
                  className={styles.addFilterButton} 
                  onClick={addFilter}
                  disabled={columns.length === 0}
                  style={{
                    '--accent-color': accentColor
                  }}
                >
                  <Plus size={18} />
                  Adicionar Filtro
                </button>

                {/* Footer com botões Apply e Cancel - CORRIGIDO */}
                <div className={styles.filterFooter}>
                  <button
                    className={`${styles.cancelButton} ${!hasDraftChanges ? styles.disabled : ''}`}
                    onClick={handleCancel}
                    disabled={!hasDraftChanges}
                  >
                    <RotateCcw size={16} />
                    Cancelar
                  </button>
                  <button
                    className={styles.applyButton}
                    onClick={handleApply}
                    title={draftFilters.length === 0 ? "Aplicar (limpar todos os filtros)" : "Aplicar filtros"}
                  >
                    <Check size={16} />
                    {draftFilters.length === 0 ? 'Limpar Filtros' : 'Aplicar Filtros'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {isExportacao && (
          <div className={styles.exportContainer} ref={exportRef}>
            <button
              className={`${styles.exportButton} ${showExportDropdown ? styles.active : ''}`}
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              style={{
                '--focus-border-color': accentColor,
                '--focus-shadow-color': addAlpha(accentColor, theme === 'dark' ? 0.2 : 0.1),
                '--accent-color': accentColor
              }}
            >
              <Download size={18} className={styles.exportIcon} />
              Exportar
              <ChevronDown 
                size={16} 
                className={`${styles.chevronIcon} ${showExportDropdown ? styles.rotated : ''}`} 
              />
            </button>

            {showExportDropdown && (
              <div className={styles.exportDropdown}>
                {exportFormats.map((fmt) => (
                  <button
                    key={fmt.value}
                    className={styles.exportOption}
                    onClick={() => handleExportClick(fmt.value)}
                    style={{
                      '--accent-color': accentColor
                    }}
                  >
                    <span className={styles.exportOptionIcon}>{fmt.icon}</span>
                    <span className={styles.exportOptionLabel}>{fmt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {showDisabledToggle && (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showDisabled}
              onChange={onToggleDisabled}
              className={styles.checkbox}
              style={{
                accentColor: accentColor
              }}
            />
            Mostrar desabilitados
          </label>
        )}
      </div>
    </div>
  );
};

export default TableHeaderWithFilter;