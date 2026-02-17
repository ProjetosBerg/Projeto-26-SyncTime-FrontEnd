import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useHistory } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ErrorMessage } from '@hookform/error-message';

// 💅 Estilos
import styles from './RecordTypeForm.module.css';

// 🧩 Componentes
import SingleSelect from '../../../../../../components/select/SingleSelect';
import ActionHeader from '../../../../../../components/header/ActionHeader/ActionHeader';

// 🔧 Utils e Hooks
import errorFormMessage from '../../../../../../utils/errorFormMessage';
import { useTheme } from '../../../../../../hooks/useTheme';
import { useButtonColors } from '../../../../../../hooks/useButtonColors';
import useFlashMessage from '../../../../../../hooks/userFlashMessage';

// 📡 Services
import ServiceRecordType from '../services/ServiceRecordType';
import LoadingSpinner from '../../../../../../components/loading/LoadingSpinner';
import { iconLabels, iconMap } from '../../../../../../utils/iconsConfig';

const RecordTypeForm = () => {
  const { id } = useParams();
  const history = useHistory();
  const { theme } = useTheme();
  const { primaryButtonColor, secondaryButtonColor } = useButtonColors(); 
  const { setFlashMessage } = useFlashMessage();

  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(!!id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      icon: null
    }
  });

  useEffect(() => {
    const fetchRecordTypeData = async () => {
      if (!id) return;

      try {
        setIsLoadingData(true);
        const response = await ServiceRecordType.getByIdRecordType(id);

        if (response.data.status === 'OK') {
          const recordTypeData = response.data.data;
          reset({
            name: recordTypeData.name || '',
            icon: recordTypeData.icone
              ? {
                  value: recordTypeData.icone,
                  label: iconLabels[recordTypeData.icone],
                  icon: recordTypeData.icone
                }
              : null
          });
        }
      } catch (error) {
        console.error('Erro ao buscar tipo de registro:', error);
        setFlashMessage('Erro ao carregar dados do tipo de registro', 'error');
        history.push('/record-type');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchRecordTypeData();
  }, [id]);

  const iconOptions = Object.keys(iconMap).map((iconName) => ({
    value: iconName,
    label: iconLabels[iconName],
    icon: iconName
  }));

  const IconOption = (props) => {
    const { data, innerProps, innerRef } = props;
    const IconComponent = iconMap[data.value];

    return (
      <div
        {...innerProps}
        ref={innerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
          padding: '8px'
        }}
      >
        <IconComponent size={20} style={{ marginRight: '8px' }} />
        <span>{iconLabels[data.value]}</span>
      </div>
    );
  };

  const IconValueContainer = (props) => {
    const { children, getValue } = props;
    const value = getValue();
    const selectedIcon = value[0];

    if (!selectedIcon) {
      return <div>Selecione um ícone.</div>;
    }

    const IconComponent = iconMap[selectedIcon.value];

    return (
      <div
        {...props.innerProps}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <IconComponent size={20} style={{ marginRight: '8px' }} />
        <span>{iconLabels[selectedIcon.value]}</span>
      </div>
    );
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        name: data.name,
        icone: data.icon?.value || data.icon
      };

      if (id) {
        await ServiceRecordType.editRecordType(id, payload);
        setFlashMessage('Tipo de registro atualizado com sucesso', 'success');
        window.dispatchEvent(new CustomEvent('refreshSidebar'));
      } else {
        await ServiceRecordType.createRecordType(payload);
        setFlashMessage('Tipo de registro criado com sucesso', 'success');
        window.dispatchEvent(new CustomEvent('refreshSidebar'));
      }

      history.push('/record-type');
    } catch (error) {
      console.error('Erro ao salvar tipo de registro:', error);
      const errorMessage = id
        ? 'Erro ao atualizar tipo de registro'
        : 'Erro ao criar tipo de registro';
      setFlashMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.push('/record-type');
  };

  const handleBack = () => {
    history.push('/record-type');
  };

  if (isLoadingData) {
    return (
      <LoadingSpinner message="Carregando os dados do tipos de registros..." />
    );
  }

  return (
    <>
      <ActionHeader
        onBack={handleBack}
        backButtonLabel="Voltar"
        isOnlyBack={true}
      />
      <div className={`${styles.container} ${styles[theme]}`}>
        <h5 className={styles.title}>
          {id ? 'Editar Tipo de Registro' : 'Novo Tipo de Registro'}
        </h5>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Primeira Linha */}
          <Row className="mb-4">
            <Col md={6}>
              <div className={styles.fieldGroup}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Nome do tipo de registro é obrigatório' }}
                  render={({ field }) => (
                    <>
                      <label className={styles.label}>Nome do Tipo *</label>
                      <input
                        {...field}
                        type="text"
                        placeholder="Digite o nome do tipo de registro"
                        className={`${styles.input} ${
                          errors.name ? styles.error : ''
                        }`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        errors={errors}
                        name="name"
                        render={({ message }) => errorFormMessage(message)}
                      />
                    </>
                  )}
                />
              </div>
            </Col>

            <Col md={6}>
              <div className={styles.fieldGroup}>
                <Controller
                  name="icon"
                  control={control}
                  rules={{ required: 'Ícone é obrigatório' }}
                  render={({ field }) => (
                    <>
                      <label className={styles.label}>Ícone *</label>
                      <SingleSelect
                        options={iconOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione um ícone..."
                        isDisabled={loading}
                        components={{
                          Option: IconOption,
                          ValueContainer: IconValueContainer
                        }}
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '50px',
                            height: '50px',
                            background:
                              theme === 'dark' ? '#111827' : 'transparent',
                            border:
                              theme === 'dark'
                                ? '1px solid #374151'
                                : '1px solid #e5e7eb'
                          })
                        }}
                      />
                      <ErrorMessage
                        errors={errors}
                        name="icon"
                        render={({ message }) => errorFormMessage(message)}
                      />
                    </>
                  )}
                />
              </div>
            </Col>
          </Row>

          {/* Botões */}
          <div className={styles.buttonContainer}>
            <button
              type="submit"
              className={styles.buttonCreate}
              disabled={loading}
              style={{ backgroundColor: primaryButtonColor }}
            >
              {loading ? 'Salvando...' : id ? 'Atualizar' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.buttonCancel}
              disabled={loading}
              style={{ backgroundColor: secondaryButtonColor }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RecordTypeForm;