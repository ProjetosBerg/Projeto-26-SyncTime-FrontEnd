import styles from './ConfirmModal.module.css';
import { useTheme } from '../../hooks/useTheme';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
  loading = false
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={`${styles.modal} ${styles[theme]}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>{title}</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
          
          <div className={styles.actions}>
            <button
              onClick={onClose}
              disabled={loading}
              className={styles.cancelButton}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`${styles.submitButton} ${danger ? styles.dangerButton : ''}`}
            >
              {loading ? 'Processando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;