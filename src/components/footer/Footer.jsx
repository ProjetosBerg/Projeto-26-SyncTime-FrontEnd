import styles from './Footer.module.css';
import { useTheme } from '../../hooks/useTheme'; 

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className={`${styles.footer} ${styles[theme]}`}>
      <div className={styles.container}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} <strong>SynTime</strong>. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;