import { Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';

// Componentes
import MultiSelect from '../select/MultiSelect';

// Utils
import errorFormMessage from '../../utils/errorFormMessage';

// Estilos
import styles from '../../components/modal/TransactionModal.module.css';

// Hooks
import { useTheme } from '../../hooks/useTheme';
import { useEmphasisColor } from '../../hooks/useEmphasisColor';

const CustomFieldsRenderModal = ({ 
  customFields, 
  control, 
  errors, 
  loading 
}) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  
  const renderField = (field) => {
    const fieldName = `customField_${field.id}`;

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className={styles.formGroup}>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: field.required ? `${field.label} é obrigatório` : false
              }}
              render={({ field: formField }) => (
                <>
                  <label htmlFor={fieldName} className={`${styles.formLabel} ${styles[theme]}`}>
                    {field.label} {field.required && '*'}
                  </label>
                  <input
                    {...formField}
                    id={fieldName}
                    type="text"
                    placeholder={`Digite ${field.label.toLowerCase()}`}
                    className={`${styles.formInput} ${styles[theme]} ${
                      errors[fieldName] ? styles.error : ''
                    }`}
                    disabled={loading}
                    style={{
                      '--focus-border-color': emphasisColor || 'rgb(20, 18, 129)',
                      '--focus-shadow-color': emphasisColor ? `${emphasisColor}26` : 'rgba(102, 126, 234, 0.15)'
                    }}
                  />
                  <div className={styles.errorMessage}>
                    <ErrorMessage
                      errors={errors}
                      name={fieldName}
                      render={({ message }) => errorFormMessage(message)}
                    />
                  </div>
                </>
              )}
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className={styles.formGroup}>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: field.required ? `${field.label} é obrigatório` : false
              }}
              render={({ field: formField }) => (
                <>
                  <label htmlFor={fieldName} className={`${styles.formLabel} ${styles[theme]}`}>
                    {field.label} {field.required && '*'}
                  </label>
                  <input
                    {...formField}
                    id={fieldName}
                    type="number"
                    step="any"
                    placeholder="0"
                    className={`${styles.formInput} ${styles[theme]} ${
                      errors[fieldName] ? styles.error : ''
                    }`}
                    disabled={loading}
                    style={{
                      '--focus-border-color': emphasisColor || 'rgb(20, 18, 129)',
                      '--focus-shadow-color': emphasisColor ? `${emphasisColor}26` : 'rgba(102, 126, 234, 0.15)'
                    }}
                  />
                  <div className={styles.errorMessage}>
                    <ErrorMessage
                      errors={errors}
                      name={fieldName}
                      render={({ message }) => errorFormMessage(message)}
                    />
                  </div>
                </>
              )}
            />
          </div>
        );

      case 'monetary':
        return (
          <div key={field.id} className={styles.formGroup}>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: field.required ? `${field.label} é obrigatório` : false,
                min: field.required ? {
                  value: 0.01,
                  message: 'O valor deve ser maior que zero'
                } : undefined
              }}
              render={({ field: formField }) => (
                <>
                  <label htmlFor={fieldName} className={`${styles.formLabel} ${styles[theme]}`}>
                    {field.label} (R$) {field.required && '*'}
                  </label>                
                  <input
                    {...formField}
                    id={fieldName}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={`${styles.formInput} ${styles[theme]} ${
                      errors[fieldName] ? styles.error : ''
                    }`}
                    disabled={loading}
                    style={{
                      '--focus-border-color': emphasisColor || 'rgb(20, 18, 129)',
                      '--focus-shadow-color': emphasisColor ? `${emphasisColor}26` : 'rgba(102, 126, 234, 0.15)'
                    }}
                  />
                  <div className={styles.errorMessage}>
                    <ErrorMessage
                      errors={errors}
                      name={fieldName}
                      render={({ message }) => errorFormMessage(message)}
                    />
                  </div>
                </>
              )}
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className={styles.formGroup}>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: field.required ? `${field.label} é obrigatório` : false
              }}
              render={({ field: formField }) => (
                <>
                  <label htmlFor={fieldName} className={`${styles.formLabel} ${styles[theme]}`}>
                    {field.label} {field.required && '*'}
                  </label>
                  <input
                    {...formField}
                    id={fieldName}
                    type="date"
                    className={`${styles.formInput} ${styles[theme]} ${
                      errors[fieldName] ? styles.error : ''
                    }`}
                    disabled={loading}
                    style={{
                      '--focus-border-color': emphasisColor || 'rgb(20, 18, 129)',
                      '--focus-shadow-color': emphasisColor ? `${emphasisColor}26` : 'rgba(102, 126, 234, 0.15)'
                    }}
                  />
                  <div className={styles.errorMessage}>
                    <ErrorMessage
                      errors={errors}
                      name={fieldName}
                      render={({ message }) => errorFormMessage(message)}
                    />
                  </div>
                </>
              )}
            />
          </div>
        );

      case 'multiple': {
        const options = field.options?.map(opt => ({
          value: opt.value,
          label: opt.value
        })) || [];

        return (
          <div key={field.id} className={styles.formGroup}>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: field.required ? `${field.label} é obrigatório` : false
              }}
              render={({ field: formField }) => (
                <>
                  <label htmlFor={fieldName} className={`${styles.formLabel} ${styles[theme]}`}>
                    {field.label} {field.required && '*'}
                  </label>
                  <MultiSelect
                    options={options}
                    value={formField.value}
                    onChange={formField.onChange}
                    placeholder="Selecione uma ou mais opções..."
                    isDisabled={loading}
                  />
                  <div className={styles.errorMessage}>
                    <ErrorMessage
                      errors={errors}
                      name={fieldName}
                      render={({ message }) => errorFormMessage(message)}
                    />
                  </div>
                </>
              )}
            />
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (!customFields || customFields.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <label className={`${styles.formLabel} ${styles[theme]}`}>Campos Customizados</label>
      </div>

      {customFields.map((field) => renderField(field))}
    </>
  );
};

export default CustomFieldsRenderModal;