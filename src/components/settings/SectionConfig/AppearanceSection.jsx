// ⚙️ Bibliotecas externas
import { useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';

// 💅 Estilos
import styles from '../../../components/modal/SettingsModal.module.css';

// 🧠 Hooks customizados
import useFlashMessage from '../../../hooks/userFlashMessage';
import { useMemorizeFilters, POSSIBLE_FILTERS_ENTITIES } from '../../../hooks/useMemorizeInputsFilters';
import { useTheme } from '../../../hooks/useTheme';
import { useEmphasisColor } from '../../../hooks/useEmphasisColor';
import { useButtonColors } from '../../../hooks/useButtonColors'; 
// 🧰 Utilitários
import errorFormMessage from '../../../utils/errorFormMessage';


const AppearanceSection = () => {
  const { setFlashMessage } = useFlashMessage();
  const { theme: currentTheme, setTheme } = useTheme();
  const { emphasisColor: currentEmphasisColor, setEmphasisColor } = useEmphasisColor();
  const { 
    primaryButtonColor: currentPrimaryButtonColor, 
    setPrimaryButtonColor,
    secondaryButtonColor: currentSecondaryButtonColor,
    setSecondaryButtonColor 
  } = useButtonColors(); 

  const { getMemorizedFilters, memorizeFilters } = useMemorizeFilters(
    POSSIBLE_FILTERS_ENTITIES.SYSTEM_CONFIG
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch 
  } = useForm({
    defaultValues: {
      theme: currentTheme || getMemorizedFilters()?.theme || 'dark',
      emphasisColor:
        currentEmphasisColor ||
        getMemorizedFilters()?.emphasisColor ||
        'rgb(20, 18, 129)',
      primaryButtonColor:
        currentPrimaryButtonColor ||
        getMemorizedFilters()?.primaryButtonColor ||
        'rgb(20, 18, 129)',
      secondaryButtonColor:
        currentSecondaryButtonColor ||
        getMemorizedFilters()?.secondaryButtonColor ||
        'rgb(100, 100, 100)'
    }
  });

  const currentFormTheme = watch('theme');
  const currentFormEmphasisColor = watch('emphasisColor');
  const currentFormPrimaryButtonColor = watch('primaryButtonColor');
  const currentFormSecondaryButtonColor = watch('secondaryButtonColor');

  const onSubmit = (data) => {
    try {
      const currentConfig = getMemorizedFilters() || {};

      const updatedConfig = {
        ...currentConfig,
        theme: data.theme || currentConfig.theme || 'dark',
        emphasisColor:
          data.emphasisColor ||
          currentConfig.emphasisColor ||
          'rgb(20, 18, 129)',
        primaryButtonColor:
          data.primaryButtonColor ||
          currentConfig.primaryButtonColor ||
          'rgb(20, 18, 129)',
        secondaryButtonColor:
          data.secondaryButtonColor ||
          currentConfig.secondaryButtonColor ||
          'rgb(100, 100, 100)'
      };

      memorizeFilters(updatedConfig);

      if (data.theme) {
        setTheme(data.theme);
      }

      if (data.emphasisColor) {
        setEmphasisColor(data.emphasisColor);
      }

      if (data.primaryButtonColor) {
        setPrimaryButtonColor(data.primaryButtonColor);
      }

      if (data.secondaryButtonColor) {
        setSecondaryButtonColor(data.secondaryButtonColor);
      }

      setFlashMessage(
        'Configurações de aparência salvas com sucesso!',
        'success'
      );
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      setFlashMessage('Erro ao salvar configurações de aparência', 'error');
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Aparência</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tema</label>
          <Controller
            name="theme"
            control={control}
            rules={{ required: 'Tema é obrigatório' }}
            render={({ field }) => (
              <div className={styles.themeOptions}>
                <button
                  type="button"
                  className={`${styles.themeOption} ${
                    field.value === 'light' ? styles.selected : ''
                  }`}
                  onClick={() => field.onChange('light')}
                >
                  <div
                    className={styles.themePreview}
                    style={{ background: '#f8f8f8' }}
                  ></div>
                  <span>Claro</span>
                </button>
                <button
                  type="button"
                  className={`${styles.themeOption} ${
                    field.value === 'dark' ? styles.selected : ''
                  }`}
                  onClick={() => field.onChange('dark')}
                >
                  <div
                    className={styles.themePreview}
                    style={{ background: '#1a1a1a' }}
                  ></div>
                  <span>Escuro</span>
                </button>
              </div>
            )}
          />
          <ErrorMessage
            errors={errors}
            name="theme"
            render={({ message }) => errorFormMessage(message)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Cor do Tema</label>
          <Controller
            name="emphasisColor"
            control={control}
            rules={{ required: 'Cor do Tema é obrigatória' }}
            render={({ field }) => (
              <div className={styles.colorOptions}>
                {[
                  { name: 'default', color: 'rgb(20, 18, 129)' },
                  { name: 'blue', color: '#3b82f6' },
                  { name: 'green', color: '#10b981' },
                  { name: 'purple', color: '#8b5cf6' },
                  { name: 'red', color: '#ef4444' }
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={`${styles.colorOption} ${
                      field.value === item.color ? styles.selected : ''
                    }`}
                    onClick={() => field.onChange(item.color)}
                    style={{
                      background: item.color
                    }}
                  >
                    {field.value === item.color && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </button>
                ))}
                <div className={styles.customColorWrapper}>
                  <input
                    type="color"
                    className={styles.colorInput}
                    value={
                      field.value?.startsWith('#') ? field.value : '#141281'
                    }
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  <div
                    className={`${styles.colorOption} ${
                      ![
                        'rgb(20, 18, 129)',
                        '#3b82f6',
                        '#10b981',
                        '#8b5cf6',
                        '#ef4444'
                      ].includes(field.value)
                        ? styles.selected
                        : ''
                    }`}
                    style={{
                      background: field.value?.startsWith('#')
                        ? field.value
                        : 'rgb(20, 18, 129)'
                    }}
                  >
                    {![
                      'rgb(20, 18, 129)',
                      '#3b82f6',
                      '#10b981',
                      '#8b5cf6',
                      '#ef4444'
                    ].includes(field.value) && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          />
          <ErrorMessage
            errors={errors}
            name="emphasisColor"
            render={({ message }) => errorFormMessage(message)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Cor do Botão Salvar</label>
          <Controller
            name="primaryButtonColor"
            control={control}
            rules={{ required: 'Cor do Botão Salvar é obrigatória' }}
            render={({ field }) => (
              <div className={styles.colorOptions}>
                {[
                  { name: 'default', color: 'rgb(20, 18, 129)' },
                  { name: 'blue', color: '#3b82f6' },
                  { name: 'green', color: '#10b981' },
                  { name: 'purple', color: '#8b5cf6' },
                  { name: 'red', color: '#ef4444' }
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={`${styles.colorOption} ${
                      field.value === item.color ? styles.selected : ''
                    }`}
                    onClick={() => field.onChange(item.color)}
                    style={{
                      background: item.color
                    }}
                  >
                    {field.value === item.color && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </button>
                ))}
                <div className={styles.customColorWrapper}>
                  <input
                    type="color"
                    className={styles.colorInput}
                    value={
                      field.value?.startsWith('#') ? field.value : '#141281'
                    }
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  <div
                    className={`${styles.colorOption} ${
                      ![
                        'rgb(20, 18, 129)',
                        '#3b82f6',
                        '#10b981',
                        '#8b5cf6',
                        '#ef4444'
                      ].includes(field.value)
                        ? styles.selected
                        : ''
                    }`}
                    style={{
                      background: field.value?.startsWith('#')
                        ? field.value
                        : 'rgb(20, 18, 129)'
                    }}
                  >
                    {![
                      'rgb(20, 18, 129)',
                      '#3b82f6',
                      '#10b981',
                      '#8b5cf6',
                      '#ef4444'
                    ].includes(field.value) && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          />
          <ErrorMessage
            errors={errors}
            name="primaryButtonColor"
            render={({ message }) => errorFormMessage(message)}
          />
        </div>

        {/* Nova seção para cor do botão secundário (Cancelar/Voltar) */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Cor do Botão Cancelar/Voltar</label>
          <Controller
            name="secondaryButtonColor"
            control={control}
            rules={{ required: 'Cor do Botão Cancelar/Voltar é obrigatória' }}
            render={({ field }) => (
              <div className={styles.colorOptions}>
                {[
                  { name: 'default', color: 'rgb(100, 100, 100)' },
                  { name: 'gray', color: '#6b7280' },
                  { name: 'blue', color: '#3b82f6' },
                  { name: 'green', color: '#10b981' },
                  { name: 'red', color: '#ef4444' }
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={`${styles.colorOption} ${
                      field.value === item.color ? styles.selected : ''
                    }`}
                    onClick={() => field.onChange(item.color)}
                    style={{
                      background: item.color
                    }}
                  >
                    {field.value === item.color && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </button>
                ))}
                <div className={styles.customColorWrapper}>
                  <input
                    type="color"
                    className={styles.colorInput}
                    value={
                      field.value?.startsWith('#') ? field.value : '#646464'
                    }
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  <div
                    className={`${styles.colorOption} ${
                      ![
                        'rgb(100, 100, 100)',
                        '#6b7280',
                        '#3b82f6',
                        '#10b981',
                        '#ef4444'
                      ].includes(field.value)
                        ? styles.selected
                        : ''
                    }`}
                    style={{
                      background: field.value?.startsWith('#')
                        ? field.value
                        : 'rgb(100, 100, 100)'
                    }}
                  >
                    {![
                      'rgb(100, 100, 100)',
                      '#6b7280',
                      '#3b82f6',
                      '#10b981',
                      '#ef4444'
                    ].includes(field.value) && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          />
          <ErrorMessage
            errors={errors}
            name="secondaryButtonColor"
            render={({ message }) => errorFormMessage(message)}
          />
        </div>

        {/* Nova seção de preview para visualizar as mudanças em tempo real */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Preview das Configurações</label>
          <div 
            className={`${styles.previewContainer} ${currentFormTheme === 'dark' ? styles.dark : styles.light}`}
            style={{
              background: currentFormTheme === 'dark' ? '#1a1a1a' : '#f8f8f8',
              border: `1px solid ${currentFormEmphasisColor}`,
              padding: '20px',
              borderRadius: '8px',
              marginTop: '10px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            <p 
              style={{ 
                color: currentFormTheme === 'dark' ? '#fff' : '#000',
                marginBottom: '16px',
                fontSize: '14px'
              }}
            >
              Exemplo de texto com cor de ênfase: <span style={{ color: currentFormEmphasisColor }}>Destaque</span>
            </p>
            <div className={styles.buttonGroup}>
              <button
                style={{
                  background: currentFormPrimaryButtonColor,
                  color: '#fff',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease'
                }}
                onClick={(e) => e.preventDefault()}
              >
                Salvar (Primário)
              </button>
              <button
                style={{
                  background: currentFormSecondaryButtonColor,
                  color: '#fff',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease'
                }}
                onClick={(e) => e.preventDefault()}
              >
                Cancelar (Secundário)
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className={styles.saveButton}>
          Salvar alterações
        </button>
      </form>
    </div>
  );
};

export default AppearanceSection;