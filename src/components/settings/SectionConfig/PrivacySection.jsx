import { useState } from 'react';
import styles from '../../../components/modal/SettingsModal.module.css';
import DefaultModal from '../../modal/DefaultModal';
import TermsContent from '../../../views/auth/TermsContent';

const PrivacySection = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModal = () => setModalOpen(!modalOpen);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Privacidade</h3>

      <div className={styles.settingItem}>
        <div className={styles.settingInfo}>
          <label className={styles.settingLabel}>Termos de Uso</label>
          <span className={styles.settingDescription}>
            Leia e aceite os termos de uso do SyncTime.
          </span>
        </div>
        <div>
          <button onClick={toggleModal} className={styles.saveButton}>
            Ler Termos
          </button>
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
export default PrivacySection;
