import { useTheme } from '../../hooks/useTheme';
import styles from './LoadingSpinner.module.css';
const LoadingSpinner = ({ message = 'Carregando...' }) => {
  const { theme } = useTheme();

  return (
    <div className={`${styles.loadingContainer} ${styles[theme]}`}>
      <div className={styles.spinner}>
        <div className={styles.spinnerInner}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <p className={styles.loadingMessage}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;