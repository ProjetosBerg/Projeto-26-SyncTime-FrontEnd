// ⚙️ React e bibliotecas externas
import { useState, useEffect } from 'react';
import { X, User, Shield, Palette, Lock } from 'lucide-react';

// 💅 Estilos
import styles from './SettingsModal.module.css';

// 🧩 Componentes
import ProfileSection from '../settings/SectionConfig/ProfileSection';
import AccountSection from '../settings/SectionConfig/AccountSection';
import AppearanceSection from '../settings/SectionConfig/AppearanceSection';
import PrivacySection from '../settings/SectionConfig/PrivacySection';

// 🧠 Hooks customizados
import { useTheme } from '../../hooks/useTheme';


const SettingsModal = ({ isOpen, onClose, initialSection = 'profile' }) => {
  const [activeSection, setActiveSection] = useState(initialSection);
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
    }
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  const sections = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'account', label: 'Conta', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'privacy', label: 'Privacidade', icon: Lock }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'account':
        return <AccountSection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'privacy':
        return <PrivacySection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContainer} ${styles[theme]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>Configurações</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.sidebar}>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={`${styles.sidebarItem} ${
                    activeSection === section.id ? styles.active : ''
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon size={20} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.contentArea}>{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;