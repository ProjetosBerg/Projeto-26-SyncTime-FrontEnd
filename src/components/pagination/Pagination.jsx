import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import styles from './Pagination.module.css';
import { useTheme } from '../../hooks/useTheme';
import { useEmphasisColor } from '../../hooks/useEmphasisColor';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange 
}) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pageNumbers = [];
  if (totalPages > 0) {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, currentPage + 1);

    if (currentPage === 1 && totalPages > 2) {
      end = 2;
    } else if (currentPage === totalPages && totalPages > 2) {
      start = totalPages - 1;
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className={`${styles.paginationContainer} ${styles[theme]}`}>
      <div className={styles.paginationInfo}>
        Mostrando {startItem}–{endItem} de {totalItems} registros
      </div>
      <div className={styles.paginationButtons}>
        <button
          className={styles.paginationButton}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Primeira página"
          style={{
            '--hover-border-color': emphasisColor || '#0ea5e9',
            '--hover-text-color': emphasisColor || '#0ea5e9'
          }}
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          className={styles.paginationButton}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Página anterior"
          style={{
            '--hover-border-color': emphasisColor || '#0ea5e9',
            '--hover-text-color': emphasisColor || '#0ea5e9'
          }}
        >
          <ChevronLeft size={16} />
        </button>
        {pageNumbers.map(page => (
          <button
            key={page}
            className={`${styles.paginationButton} ${currentPage === page ? styles.activePage : ''}`}
            onClick={() => onPageChange(page)}
            title={`Ir para página ${page}`}
            style={currentPage === page ? {
              backgroundColor: emphasisColor || '#0ea5e9',
              borderColor: emphasisColor || '#0ea5e9',
              color: 'white'
            } : {
              '--hover-border-color': emphasisColor || '#0ea5e9',
              '--hover-text-color': emphasisColor || '#0ea5e9'
            }}
          >
            {page}
          </button>
        ))}
        <button
          className={styles.paginationButton}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Próxima página"
          style={{
            '--hover-border-color': emphasisColor || '#0ea5e9',
            '--hover-text-color': emphasisColor || '#0ea5e9'
          }}
        >
          <ChevronRight size={16} />
        </button>
        <button
          className={styles.paginationButton}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Última página"
          style={{
            '--hover-border-color': emphasisColor || '#0ea5e9',
            '--hover-text-color': emphasisColor || '#0ea5e9'
          }}
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;