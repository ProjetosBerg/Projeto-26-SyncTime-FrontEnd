// ⚙️ React e bibliotecas externas
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';

// 🧠 Hooks customizados
import { useTheme } from '../../hooks/useTheme';
import { useButtonColors } from '../../hooks/useButtonColors'; 
import useFlashMessage from '../../hooks/userFlashMessage';
import { useMemorizeFilters, POSSIBLE_FILTERS_ENTITIES } from '../../hooks/useMemorizeInputsFilters';

// 💅 Estilos
import styles from './NewPassword.module.css';

// 🔐 Serviços / API
import api from '../../services/api';

// 🧰 Utilitários
import errorFormMessage from '../../utils/errorFormMessage';

const NewPassword = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { primaryButtonColor, secondaryButtonColor } = useButtonColors(); 
  const { setFlashMessage } = useFlashMessage();
  const [isLoading, setIsLoading] = useState(false);
  const {getMemorizedFilters} = useMemorizeFilters(POSSIBLE_FILTERS_ENTITIES.USERS)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formatData = {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmPassword,
        id: getMemorizedFilters()?.id,
        login: getMemorizedFilters()?.login
      }
      await api.patch('/user/reset-password', formatData);
      setFlashMessage('Senha alterada com sucesso!', 'success');
      reset();
      onClose();
    } catch (error) {
      setFlashMessage(error.message || 'Erro ao alterar senha', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={`${styles.modal} ${styles[theme]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>Alterar Senha</h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputGroup}>
            <label htmlFor="oldPassword">Senha Atual</label>
            <div className={styles.passwordWrapper}>
              <Controller
                name="oldPassword"
                control={control}
                rules={{ required: 'Senha atual é obrigatória' }}
                render={({ field }) => (
                  <input
                    type='password'
                    id="oldPassword"
                    {...field}
                    className={errors.oldPassword ? styles.inputError : ''}
                    disabled={isLoading}
                  />
                )}
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="oldPassword"
              render={({ message }) => errorFormMessage(message)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="newPassword">Nova Senha</label>
            <div className={styles.passwordWrapper}>
              <Controller
                name="newPassword"
                control={control}
                rules={{ required: 'Nova senha é obrigatória', minLength: { value: 6, message: 'A senha deve ter pelo menos 6 caracteres' } }}
                render={({ field }) => (
                  <input
                    type='password'
                    id="newPassword"
                    {...field}
                    className={errors.newPassword ? styles.inputError : ''}
                    disabled={isLoading}
                  />
                )}
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="newPassword"
              render={({ message }) => errorFormMessage(message)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
            <div className={styles.passwordWrapper}>
              <Controller
                name="confirmPassword"
                control={control}
                rules={{ required: 'Confirmação de senha é obrigatória', minLength: { value: 6, message: 'A senha deve ter pelo menos 6 caracteres' } }}
                render={({ field }) => (
                  <input
                    type='password'
                    id="confirmPassword"
                    {...field}
                    className={errors.confirmPassword ? styles.inputError : ''}
                    disabled={isLoading}
                  />
                )}
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="confirmPassword"
              render={({ message }) => errorFormMessage(message)}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isLoading}
              style={{ backgroundColor: secondaryButtonColor }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
              style={{ backgroundColor: primaryButtonColor }}
            >
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPassword;