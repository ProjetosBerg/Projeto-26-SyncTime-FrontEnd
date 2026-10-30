import { useTheme } from '../../hooks/useTheme';
import { useEmphasisColor } from '../../hooks/useEmphasisColor';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ message = 'Carregando...', fullscreen = false }) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();

  return (
    <div
      className={`${styles.loadingContainer} ${styles[theme]} ${
        fullscreen ? styles.fullscreen : ''
      }`}
      style={{ '--loading-accent': emphasisColor || '#3b82f6' }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className={`${styles.glow} ${styles.glowOne}`} aria-hidden="true" />
      <span className={`${styles.glow} ${styles.glowTwo}`} aria-hidden="true" />

      <div className={styles.loadingCard}>
        <div className={styles.brand} aria-hidden="true">
          <div className={styles.clockLogo}>
            <span className={styles.hourHand} />
            <span className={styles.minuteHand} />
            <span className={styles.clockCenter} />
          </div>
          <div>
            <strong>SyncTime</strong>
            <span>Produtividade no seu ritmo</span>
          </div>
        </div>

        <div className={styles.spinner} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <p className={styles.loadingMessage}>{message}</p>
        <div className={styles.progressTrack} aria-hidden="true">
          <span />
        </div>
        <p className={styles.loadingHint}>Preparando sua experiência...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
