// ⚙️ React e bibliotecas externas
import { useState, useEffect } from 'react';
// 💅 Estilos
import styles from './Loading.module.css';

const LoadingPage = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onLoadingComplete(), 800);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className={styles.loadingContainer}>
      {/* Logo/Brand */}
      <div className={styles.brandWrapper}>
        <h1 className={styles.brandTitle}>SyncTime</h1>
        <p className={styles.brandSubtitle}>Organizando seu tempo...</p>
      </div>

      {/* Progress Bar Container */}
      <div className={styles.progressContainer}>
        {/* Background Bar */}
        <div className={styles.progressBarBg}>
          {/* Progress Bar */}
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Percentage Text */}
        <div className={styles.progressText}>{progress}%</div>
      </div>

      {/* Decorative Elements */}
      <div className={styles.decorativeDots}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
};

export default LoadingPage;
