import { X, Check } from 'lucide-react';
import { useState } from 'react';
import styles from './customSummaryModal.module.css';
import { useTheme } from '../../../../../hooks/useTheme';

const CustomSummaryModal = ({
  show,
  onClose,
  onSubmit,
  fields,
  initialSelected = []
}) => {
  const { theme } = useTheme();
  const [selected, setSelected] = useState(initialSelected);

  if (!show) return null;

  const handleToggle = (label) => {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(selected);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={`${styles.modalHeader} ${theme === 'dark' ? styles.dark : ''}`}>
          <div className={`${styles.modalHeaderContent} ${theme === 'dark' ? styles.dark : ''}`}>
            <h3>Selecionar Totais Customizados</h3>
            <p>Escolha os campos que deseja incluir no resumo</p>
          </div>
          <button onClick={onClose} className={`${styles.closeButton} ${theme === 'dark' ? styles.dark : ''}`}>
            <X size={20} />
          </button>
        </div>
        
        <div className={`${styles.fieldsList} ${theme === 'dark' ? styles.dark : ''}`}>
          <div className={styles.fieldsContainer}>
            {fields.map((field) => {
              const isChecked = selected.includes(field.label);
              return (
                <div
                  key={field.label}
                  className={`${styles.fieldItem} ${isChecked ? styles.selected : ''} ${theme === 'dark' ? styles.dark : ''}`}
                  onClick={() => handleToggle(field.label)}
                >
                  <input
                    type="checkbox"
                    id={field.label}
                    checked={isChecked}
                    onChange={() => handleToggle(field.label)}
                    className={styles.checkbox}
                  />
                  <div className={`${styles.checkboxCustom} ${isChecked ? styles.checked : ''} ${theme === 'dark' ? styles.dark : ''}`}>
                    {isChecked && <Check className={styles.checkmark} />}
                  </div>
                  <label htmlFor={field.label} className={`${styles.fieldLabel} ${theme === 'dark' ? styles.dark : ''}`}>
                    {field.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${styles.modalFooter} ${theme === 'dark' ? styles.dark : ''}`}>
          <span className={`${styles.selectedCount} ${theme === 'dark' ? styles.dark : ''}`}>
            {selected.length} {selected.length === 1 ? 'campo selecionado' : 'campos selecionados'}
          </span>
          <div className={styles.buttonsContainer}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.cancelButton} ${theme === 'dark' ? styles.dark : ''}`}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className={`${styles.submitButton} ${theme === 'dark' ? styles.dark : ''}`}
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomSummaryModal;