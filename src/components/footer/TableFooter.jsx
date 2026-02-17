// 💅 Estilos
import { useEmphasisColor } from '../../hooks/useEmphasisColor';
import { useTheme } from '../../hooks/useTheme';
import styles from './TableFooter.module.css';

const TableFooter = ({ numRecords, totalAmount }) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();

  const formatCurrency = (value) => {
    if (value === null) return '0,00';
    return (
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value || 0) || '0,00'
    );
  };

  return (
    <div 
      className={`${styles.footerContainer} ${styles[theme]}`}
      style={{
        '--emphasis-color': emphasisColor || '#0ea5e9',
        '--emphasis-color-shadow': `${emphasisColor || '#0ea5e9'}30`
      }}
    >
      <div className={styles.footerContent}>
        <div className={styles.footerItem}>
          <div className={styles.footerIcon}>📊</div>
          <div className={styles.footerTextContainer}>
            <span className={styles.footerLabel}>Total de registros</span>
            <span className={styles.footerValue}>
              {numRecords?.toLocaleString('pt-BR') || 0}
            </span>
          </div>
        </div>

        <div className={styles.footerDivider} />

        <div className={styles.footerItem}>
          <div className={styles.footerIcon}>💰</div>
          <div className={styles.footerTextContainer}>
            <span className={styles.footerLabel}>Valor total</span>
            <span className={`${styles.footerValue} ${styles.emphasis}`}>
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableFooter;