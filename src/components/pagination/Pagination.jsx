import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import styles from './Pagination.module.css';
import { useTheme } from '../../hooks/useTheme';
import { useEmphasisColor } from '../../hooks/useEmphasisColor';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange,
  disabled = false
}) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const changePage = (page) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    onPageChange(page);
  };

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
    <nav
      className={`${styles.paginationContainer} ${styles[theme]}`}
      aria-label="Paginação"
      aria-busy={disabled}
    >
      <div className={styles.paginationInfo}>
        Mostrando {startItem}–{endItem} de {totalItems} registros
      </div>
      <div className={styles.paginationButtons}>
        <button
          className={styles.paginationButton}
          type="button"
          onClick={() => changePage(1)}
          disabled={disabled || currentPage <= 1}
          title="Primeira página"
          aria-label="Ir para a primeira página"
          style={{
            '--hover-border-color': emphasisColor || '#0ea5e9',
            '--hover-text-color': emphasisColor || '#0ea5e9'
          }}
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          className={styles.paginationButton}
          type="button"
          onClick={() => changePage(currentPage - 1)}
          disabled={disabled || currentPage <= 1}
          title="Página anterior"
          aria-label="Ir para a página anterior"
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
            type="button"
            onClick={() => changePage(page)}
            disabled={disabled}
            title={`Ir para página ${page}`}
            aria-label={`Ir para a página ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
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
          type="button"
          onClick={() => changePage(currentPage + 1)}
          disabled={disabled || totalPages === 0 || currentPage >= totalPages}
          title="Próxima página"
          aria-label="Ir para a próxima página"
          style={{
            '--hover-border-color': emphasisColor || '#0ea5e9',
            '--hover-text-color': emphasisColor || '#0ea5e9'
          }}
        >
          <ChevronRight size={16} />
        </button>
        <button
          className={styles.paginationButton}
          type="button"
          onClick={() => changePage(totalPages)}
          disabled={disabled || totalPages === 0 || currentPage >= totalPages}
          title="Última página"
          aria-label="Ir para a última página"
          style={{
            '--hover-border-color': emphasisColor || '#0ea5e9',
            '--hover-text-color': emphasisColor || '#0ea5e9'
          }}
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
