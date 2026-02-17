// ⚙️ Bibliotecas externas
import { Search } from 'lucide-react';

// 💅 Estilos
import styles from './TableHeader.module.css';

// 🧠 Hooks customizados
import { useTheme } from '../../../hooks/useTheme';
import { useEmphasisColor } from '../../../hooks/useEmphasisColor';


const TableHeader = ({ 
  title, 
  searchPlaceholder, 
  onSearch, 
  showDisabledToggle = false,
  showDisabled = false,
  onToggleDisabled 
}) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();

  // Função para adicionar transparência à cor
  const addAlpha = (color, alpha) => {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  };

  return (
    <div className={`${styles.headerContainer} ${styles[theme]}`}>
      <h2 className={styles.headerTitle}>{title}</h2>
      <div className={styles.headerActions}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className={styles.searchInput}
            onChange={(e) => onSearch(e.target.value)}
            style={{
              '--focus-border-color': emphasisColor || '#0ea5e9',
              '--focus-shadow-color': addAlpha(emphasisColor || '#0ea5e9', theme === 'dark' ? 0.2 : 0.1)
            }}
          />
        </div>
        {showDisabledToggle && (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showDisabled}
              onChange={onToggleDisabled}
              className={styles.checkbox}
              style={{
                accentColor: emphasisColor || '#0ea5e9'
              }}
            />
            Mostrar desabilitados
          </label>
        )}
      </div>
    </div>
  );
};

export default TableHeader;