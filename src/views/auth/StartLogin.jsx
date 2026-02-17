// ⚙️ React e bibliotecas externas
import { useState } from 'react';
import { Link } from 'react-router-dom';

// 💅 Estilos
import styles from './StartLogin.module.css';

// 🧩 Componentes
import Button from '../../components/button/Button';
import DefaultModal from '../../components/modal/DefaultModal';

// 📄 Conteúdo local
import TermsContent from './TermsContent';

// 🖼️ Assets
import Logo from '../../assets/logo.svg';

const StartLogin = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModal = () => setModalOpen(!modalOpen);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.decorativeCircle1}></div>
          <div className={styles.decorativeCircle2}></div>

          <h1 className={styles.title}>Seja Bem-Vindo!</h1>

          <div className={styles.logoWrapper}>
            <img src={Logo} alt="SyncTime Logo" className={styles.logo} />
          </div>

          <p className={styles.description}>
            Organize seu tempo de forma eficiente com o SyncTime.
          </p>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.welcomeText}>
            <h2 className={styles.subtitle}>Comece Agora</h2>
            <p className={styles.welcomeDescription}>
              Faça login ou crie sua conta para
              <br />
              começar a usar o SyncTime
            </p>
          </div>

          <div className={styles.actionButtons}>
            <Link to="/login">
              <Button label="Entrar" variant="animated" outline />
            </Link>
            <Link to="/register">
              <Button label="Criar Conta" outline variant="animated" />
            </Link>
          </div>

          <div className={styles.terms}>
            <p>
              Ao continuar, você concorda com nossos
              <br />
              <button onClick={toggleModal} className={styles.termsLink}>
                Termos de Autorização
              </button>
            </p>
          </div>
        </div>
      </div>

      <DefaultModal
        isOpen={modalOpen}
        toggle={toggleModal}
        title="Termos de Autorização"
        cancelLabel="Fechar"
      >
        <TermsContent />
      </DefaultModal>
    </div>
  );
};

export default StartLogin;
