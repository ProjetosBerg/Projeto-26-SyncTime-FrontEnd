import { useState } from 'react';
import { User, Settings, PaintBucket, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './SectionConfigSystem.module.css';
import { useTheme } from '../../hooks/useTheme';
import { useEmphasisColor } from '../../hooks/useEmphasisColor';
import SettingsModal from '../../components/modal/SettingsModal';

const SectionConfigSystem = () => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('profile');

  const configSections = [
    {
      id: 'geral',
      title: 'Geral',
      icon: Settings,
      items: [
        { label: 'Configuração geral', section: 'profile' },
        { label: 'Tipos de Registros', path: '/record-type' },
        { label: 'Campos Customizados', path: '/custom-fields' },
        { label: 'Privacidade', section: 'privacy' }
      ],
      subtitle: 'Definições básicas do sistema'
    },
    {
      id: 'Aparencia',
      title: 'Aparencia',
      icon: PaintBucket,
      items: [
        { label: 'Temas', section: 'appearance' }
      ],
      subtitle: 'Personalize a aparência do sistema'
    },
    {
      id: 'Relatorios',
      title: 'Relatorios',
      icon: ClipboardList,
      items: [
        { label: 'Categoria', path: '/categoria' }
      ],
      subtitle: 'Configurações de relatórios e análises'
    },
    {
      id: 'conta',
      title: 'Conta',
      icon: User,
      items: [
        { label: 'Configuração da conta', section: 'account' },
        { label: 'Alterar senha', section: 'account' },
      ],
      subtitle: 'Gerencie as informações da sua conta'
    },
  ];

  const handleItemClick = (item) => {
    if (item.section) {
      setSelectedSection(item.section);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className={`${styles.container} ${styles[theme]}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Configurações</h1>
          <p className={styles.description}>Gerencie as configurações do sistema</p>
        </div>

        <div className={styles.grid}>
          {configSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div
                    className={styles.iconWrapper}
                    style={{
                      background: `linear-gradient(135deg, ${emphasisColor || '#ff6fa3'} 0%, ${emphasisColor || '#e91e63'} 100%)`,
                      boxShadow: `0 2px 6px ${emphasisColor ? `${emphasisColor}40` : 'rgba(233, 30, 99, 0.25)'}`
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className={styles.cardTitle}>{section.title}</h3>
                </div>
               
                {section.items.length > 0 && (
                  <ul className={styles.itemList}>
                    {section.items.map((item, index) => (
                      <li
                        key={index}
                        className={styles.item}
                        style={{
                          '--hover-color': emphasisColor || '#e91e63',
                          '--hover-bg-opacity': theme === 'dark' ? '0.1' : '0.05',
                          padding: 0
                        }}
                      >
                        {item.section ? (
                          <button
                            onClick={() => handleItemClick(item)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'inherit',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              display: 'block',
                              width: '100%',
                              padding: '0.5rem 0 0.5rem 1.25rem',
                              height: '100%',
                              textAlign: 'left',
                              fontSize: 'inherit',
                              fontFamily: 'inherit'
                            }}
                          >
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            to={item.path}
                            style={{
                              textDecoration: 'none',
                              color: 'inherit',
                              display: 'block',
                              width: '100%',
                              padding: '0.5rem 0 0.5rem 1.25rem',
                              height: '100%'
                            }}
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
               
                {section.subtitle && (
                  <div className={styles.subtitle}>
                    <span className={styles.subtitleIcon}>ⓘ</span>
                    <span>{section.subtitle}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <SettingsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialSection={selectedSection}
      />
    </>
  );
};

export default SectionConfigSystem;