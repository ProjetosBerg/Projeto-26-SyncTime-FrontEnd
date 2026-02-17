// ⚙️ React e bibliotecas externas
import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { Button } from 'reactstrap';
import { User } from 'lucide-react';

// 💅 Estilos
import styles from '../../../components/modal/SettingsModal.module.css';

// 🧠 Hooks customizados
import useFlashMessage from '../../../hooks/userFlashMessage';
import { useMemorizeFilters, POSSIBLE_FILTERS_ENTITIES } from '../../../hooks/useMemorizeInputsFilters';

// 🔐 Serviços / API
import ServiceUsers from '../../../services/ServiceUsers';

// 🧰 Utilitários
import errorFormMessage from '../../../utils/errorFormMessage';


const ProfileSection = () => {
  const { setFlashMessage } = useFlashMessage();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      name: '',
      bio: '',
      avatar: null
    }
  });
  const { getMemorizedFilters, memorizeFilters } = useMemorizeFilters(
    POSSIBLE_FILTERS_ENTITIES.USERS
  );

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const watchedAvatar = watch('avatar');

  useEffect(() => {
    async function fetchUser() {
      const response = await ServiceUsers.getByUser(getMemorizedFilters()?.id);
      memorizeFilters({
        ...getMemorizedFilters(),
        name: response.data.data.user.name
      });
      setCurrentAvatarUrl(response.data.data.user.imageUrl || null);
      reset({
        name: response.data.data.user.name || '',
        bio: response.data.data.user.bio || '',
        avatar: null
      });
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (watchedAvatar && watchedAvatar[0]) {
      const file = watchedAvatar[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [watchedAvatar]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const fetchUser = async () => {
    const response = await ServiceUsers.getByUser(getMemorizedFilters()?.id);
    memorizeFilters({
      ...getMemorizedFilters(),
      name: response.data.data.user.name
    });
    setCurrentAvatarUrl(response.data.data.user.imageUrl || null);
    reset({
      name: response.data.data.user.name || '',
      bio: response.data.data.user.bio || '',
      avatar: null
    });
  };

  const onSubmit = async (data) => {
    try {
      const currentUser = getMemorizedFilters();

      let payload;
      if (data.avatar && data.avatar[0]) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('bio', data.bio || '');
        formData.append('avatar', data.avatar[0]);
        payload = formData;
      } else {
        payload = {
          name: data.name,
          bio: data.bio || ''
        };
      }

      await ServiceUsers.editUser(currentUser.id, payload);

      memorizeFilters({
        ...currentUser,
        name: data.name
      });

      await fetchUser();

      window.dispatchEvent(new CustomEvent('profileUpdated'));

      setFlashMessage('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      setFlashMessage('Erro ao atualizar perfil', 'error');
    }
  };

  const avatarSrc = previewUrl || currentAvatarUrl;
  const hasAvatar = !!avatarSrc;
  const buttonText = hasAvatar ? 'Alterar foto' : 'Adicionar foto';

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Perfil</h3>

      <div className={styles.formGroup}>
        <Controller
          name="avatar"
          control={control}
          rules={{
            validate: {
              isImage: (files) => {
                if (!files || !files[0]) return true;
                const file = files[0];
                return file.type.startsWith('image/') || 'Apenas imagens são permitidas';
              },
              maxSize: (files) => {
                if (!files || !files[0]) return true;
                const file = files[0];
                return file.size <= 5 * 1024 * 1024 || 'A imagem deve ter no máximo 5MB';
              }
            }
          }}
          render={({ field }) => (
            <>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  field.onChange(files);
                }}
                className={styles.fileInput}
                style={{ display: 'none' }}
              />
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>
                  {avatarSrc ? (
                    <img 
                      src={avatarSrc} 
                      alt="Avatar" 
                      className={styles.avatarImg}
                    />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <button 
                  type="button"
                  className={styles.changeAvatarBtn}
                  onClick={handleButtonClick}
                >
                  {buttonText}
                </button>
              </div>
            </>
          )}
        />
        <ErrorMessage
          errors={errors}
          name="avatar"
          render={({ message }) => errorFormMessage(message)}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nome</label>
          <Controller
            name="name"
            control={control}
            rules={{
              required: 'Nome é obrigatório',
              minLength: {
                value: 2,
                message: 'Nome deve ter pelo menos 2 caracteres'
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={styles.input}
                placeholder="Seu nome"
              />
            )}
          />
          <ErrorMessage
            errors={errors}
            name="name"
            render={({ message }) => errorFormMessage(message)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Bio</label>
          <Controller
            name="bio"
            control={control}
            rules={{
              maxLength: {
                value: 200,
                message: 'Bio não pode exceder 200 caracteres'
              }
            }}
            render={({ field }) => (
              <textarea
                {...field}
                className={styles.textarea}
                placeholder="Conte um pouco sobre você"
                rows={4}
              />
            )}
          />
          <ErrorMessage
            errors={errors}
            name="bio"
            render={({ message }) => errorFormMessage(message)}
          />
        </div>

        <Button type="submit" className={styles.saveButton}>
          Salvar alterações
        </Button>
      </form>
    </div>
  );
};

export default ProfileSection;