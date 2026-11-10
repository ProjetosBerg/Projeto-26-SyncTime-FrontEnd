// ⚙️ Bibliotecas externas
import { ArrowLeft, Plus } from 'lucide-react';

// 💅 Estilos
import styles from './ActionHeader.module.css';

// 🧠 Hooks customizados
import { useEmphasisColor } from '../../../hooks/useEmphasisColor';
import { useTheme } from '../../../hooks/useTheme';

const ActionHeader = ({
  onBack,
  onCreate,
  backButtonLabel = 'Voltar',
  createButtonLabel = 'Criar',
  isOnlyBack = false
}) => {
  const { emphasisColor } = useEmphasisColor();
  const { theme } = useTheme();
  const accentColor = emphasisColor || '#3b82f6';

  return (
    <div
      className={`${styles.actionBar} ${styles[theme]} ${isOnlyBack ? styles.onlyBack : ''}`}
      style={{ '--action-accent': accentColor }}
    >
      <button
        type="button"
        className={styles.backButton}
        onClick={onBack}
        aria-label={backButtonLabel}
        title={backButtonLabel}
      >
        <span className={styles.buttonIcon} aria-hidden="true">
          <ArrowLeft size={18} strokeWidth={2.2} />
        </span>
        <span>{backButtonLabel}</span>
      </button>
      {!isOnlyBack ? (
        <button
          type="button"
          className={styles.createButton}
          onClick={onCreate}
        >
          <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
          <span>{createButtonLabel}</span>
        </button>
      ) : null}
    </div>
  );
};

export default ActionHeader;
