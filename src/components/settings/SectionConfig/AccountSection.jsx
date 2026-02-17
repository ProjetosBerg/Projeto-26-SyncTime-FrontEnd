// ⚙️ React e bibliotecas externas
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';

// 💅 Estilos
import styles from '../../../components/modal/SettingsModal.module.css';

// 🧩 Componentes
import NewPassword from '../../newPassword/NewPassword';
import ConfirmModal from '../../modal/ConfirmModal';

// 🧠 Hooks customizados
import useFlashMessage from '../../../hooks/userFlashMessage';
import { useMemorizeFilters, POSSIBLE_FILTERS_ENTITIES } from '../../../hooks/useMemorizeInputsFilters';
import useAuth from '../../../hooks/userAuth';

// 🔐 Serviços / API
import ServiceUsers from '../../../services/ServiceUsers';

// 🧰 Utilitários
import errorFormMessage from '../../../utils/errorFormMessage';

const AccountSection = () => {
  const { setFlashMessage } = useFlashMessage();
  const [showAlterPassword, setShowAlterPassword] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout } = useAuth();
   const { getMemorizedFilters, memorizeFilters } = useMemorizeFilters(
    POSSIBLE_FILTERS_ENTITIES.USERS
  );
  const { control, handleSubmit, formState: { errors },reset } = useForm({
    defaultValues: {
      email: ''
    }
  });
useEffect(() => {
    async function fetchUser() {
      const response = await ServiceUsers.getByUser(getMemorizedFilters()?.id);
      memorizeFilters({
        ...getMemorizedFilters(),
         email: response.data.data.user.email
      });
      reset({
        email: response.data.data.user.email || ''
      });
    }
    fetchUser();
  }, []);
 

  const onSubmitEmail = async(data) => {
    try {
      await ServiceUsers.editUser(getMemorizedFilters()?.id, { email: data.email });
      memorizeFilters({
        ...getMemorizedFilters(),
        email: data.email
      });
      setFlashMessage('Email atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('error AccountSection',error)
      setFlashMessage('Erro ao atualizar email', 'error');
    }
  };

    const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await ServiceUsers.deleteUser(getMemorizedFilters()?.id);
      setShowDeleteModal(false);
      await logout(false,true);
    } catch (error) {
      console.error('error deleting account', error);
      setFlashMessage('Erro ao excluir conta', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };
// TODO: EDITAR PERGUNTA DE SEGURANÇA

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Conta</h3>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Login</label>
        <input 
          type="login" 
          className={styles.input}
          defaultValue={getMemorizedFilters()?.login || ''}
          disabled
        />
        <span className={styles.helpText}>O login não pode ser alterado</span>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Email</label>
        <form onSubmit={handleSubmit(onSubmitEmail)}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Email é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido'
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                className={`${styles.input} ${errors.email ? styles.error : ''}`}
              />
            )}
          />
           <ErrorMessage
            errors={errors}
            name="email"
            render={({ message }) => errorFormMessage(message)}
          />
          <button type="submit" className={styles.dangerButton} style={{marginTop: '10px'}}>Salvar Email</button>
        </form>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Alterar senha</label>
        <button className={styles.dangerButton} onClick={() => setShowAlterPassword(true)}>Alterar senha</button> 
      </div>

      <div className={styles.divider}></div>

      <div className={styles.dangerZone}>
        <h4 className={styles.dangerTitle}>Zona de perigo</h4>
        <p className={styles.dangerText}>
          Esta ação é irreversível e removerá permanentemente sua conta.
        </p>
        <button className={styles.dangerButton} onClick={() => setShowDeleteModal(true)}>Excluir conta</button>
      </div>
      <NewPassword
        isOpen={showAlterPassword}
        onClose={() => setShowAlterPassword(false)}
      />
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Confirmar exclusão de conta"
        message="Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão permanentemente removidos."
        confirmText="Sim, excluir conta"
        cancelText="Cancelar"
        danger={true}
        loading={isDeleting}
      />
    </div>
  );
};

export default AccountSection;