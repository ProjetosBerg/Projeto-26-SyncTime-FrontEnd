import styles from './Container.module.css';
import { useTheme } from '../../hooks/useTheme'; 
const Container = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={`${styles.container} ${styles[theme]}`}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default Container;