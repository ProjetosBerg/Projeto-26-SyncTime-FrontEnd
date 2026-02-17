import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ErrorMessage } from '@hookform/error-message';

// 💅 Estilos
import styles from './TransactionForm.module.css';

// 🧩 Componentes

// 🔧 Utils e Hooks

// 📡 Services
import ServiceCustomFields from '../../../../../sectionConfigSystem/Sections/General/CustomFields/services/ServiceCustomFields';
import ServiceTransactionsRecord from '../../services/ServiceTransactionsRecord';
import LoadingSpinner from '../../../../../../components/loading/LoadingSpinner';
import ActionHeader from '../../../../../../components/header/ActionHeader/ActionHeader';
import CustomFieldsRenderer from '../../../../../../components/customFields/CustomFieldsRenderer';
import useFlashMessage from '../../../../../../hooks/userFlashMessage';
import { useTheme } from '../../../../../../hooks/useTheme';
import { useButtonColors } from '../../../../../../hooks/useButtonColors';
import errorFormMessage from '../../../../../../utils/errorFormMessage';
import ServiceCategory from '../../../../../sectionConfigSystem/Sections/Report/Category/services/ServiceCategory';

const TransactionForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const { dados } = location.state || {};
  const history = useHistory();
  const { theme } = useTheme();
  const { primaryButtonColor, secondaryButtonColor } = useButtonColors();
  const { setFlashMessage } = useFlashMessage();

  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(!!id);
  const [customFields, setCustomFields] = useState([]);
  const [category, setCategory] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      amount: '',
      transactionDate: ''
    }
  });

  const formatCurrency = (value) => {
    if (!value) return '';

    const numericValue = value.replace(/\D/g, '');

    const numberValue = parseFloat(numericValue) / 100;

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numberValue);
  };

  const parseCurrency = (value) => {
    if (!value) return '';

    const numericValue = value
      .replace('R$', '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    return numericValue;
  };

  useEffect(() => {
    const fetchCustomFields = async () => {
      if (!dados?.categoryId || !dados?.recordTypeId) return;

      try {
        const response = await ServiceCustomFields.getByAllByRecordType(
          dados.categoryId,
          dados.recordTypeId
        );

        if (response.data.status === 'OK') {
          setCustomFields(response.data.data || []);
        }
      } catch (error) {
        console.error('Erro ao buscar campos customizados:', error);
      }
    };

    fetchCustomFields();
  }, [dados?.categoryId, dados?.recordTypeId]);

  useEffect(() => {
    const fetchCategory = async () => {
      if (dados?.categoryId) {
        const category = await ServiceCategory.getByIdCategory(
          dados.categoryId
        );
        setCategory(category.data.data);
      }
    };
    fetchCategory();
  }, [dados?.categoryId]);

  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!id) return;

      try {
        setIsLoadingData(true);
        const response =
          await ServiceTransactionsRecord.getByIdTransactionsRecord(id);

        if (response.data.status === 'OK') {
          const transactionData = response.data.data.transaction;
          const customFieldsData = response.data.data.customFields || [];
          if (!transactionData) {
            throw new Error('Transação não encontrada');
          }

          const formData = {
            title: transactionData.title || '',
            description: transactionData.description || '',
            amount: transactionData.amount
              ? formatCurrency((transactionData.amount * 100).toString())
              : '',
            transactionDate: transactionData.transaction_date || ''
          };

          if (customFieldsData && Array.isArray(customFieldsData)) {
            customFieldsData.forEach((cf) => {
              const fieldName = `customField_${cf.custom_field_id}`;

              if (Array.isArray(cf.value)) {
                formData[fieldName] = cf.value.map((v) => ({
                  value: v,
                  label: v
                }));
              } else {
                formData[fieldName] = cf.value;
              }
            });
          }

          reset(formData);
        }
      } catch (error) {
        console.error('Erro ao buscar transação:', error);
        setFlashMessage('Erro ao carregar dados da transação', 'error');
        history.push('/relatorios/categoria/relatorio-mesal');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchTransactionData();
  }, [id]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        title: data.title,
        description: data.description || undefined,
        amount: data.amount
          ? parseFloat(parseCurrency(data.amount))
          : undefined,
        transactionDate: data.transactionDate,
        recordTypeId: dados.recordTypeId,
        monthlyRecordId: dados.monthlyRecordId,
        categoryId: dados.categoryId
      };

      const customFieldsData = [];
      customFields.forEach((field) => {
        const fieldName = `customField_${field.id}`;
        const fieldValue = data[fieldName];

        if (
          fieldValue !== undefined &&
          fieldValue !== null &&
          fieldValue !== ''
        ) {
          let processedValue;

          switch (field.type) {
            case 'text':
            case 'date':
              processedValue = fieldValue.toString();
              break;

            case 'number':
              processedValue = parseInt(fieldValue, 10);
              break;

            case 'monetary':
              processedValue = parseFloat(fieldValue);
              break;

            case 'multiple':
              if (Array.isArray(fieldValue)) {
                processedValue = fieldValue.map((item) =>
                  typeof item === 'object' ? item.value : item
                );
              } else {
                processedValue = [fieldValue];
              }
              break;

            default:
              processedValue = fieldValue;
          }

          customFieldsData.push({
            custom_field_id: field.id,
            value: processedValue
          });
        }
      });

      if (customFieldsData.length > 0) {
        payload.customFields = customFieldsData;
      }

      if (id) {
        await ServiceTransactionsRecord.editTransactionsRecord(id, payload);
        setFlashMessage('Transação atualizada com sucesso', 'success');
      } else {
        await ServiceTransactionsRecord.createTransactionsRecord(payload);
        setFlashMessage('Transação criada com sucesso', 'success');
      }

      history.push('/relatorios/categoria/transações', {
        monthlyRecordId: dados.monthlyRecordId,
        month: dados.month,
        year: dados.year
      });
    } catch (error) {
      console.error(
        'Erro ao salvar transação:',
        error?.response?.data?.errors[0]
      );
      const errorMessage = id
        ? 'Erro ao atualizar transação'
        : 'Erro ao criar transação';
      setFlashMessage(
        error?.response?.data?.errors[0] || errorMessage,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (dados) {
      return history.push(`/relatorios/categoria/transações`, {
        monthlyRecordId: dados.monthlyRecordId,
        month: dados.month,
        year: dados.year,
        idCategory: dados.categoryId
      });
    }
    history.push('/inicio');
  };

  const handleBack = () => {
    if (dados?.monthlyRecordId) {
      return history.push(`/relatorios/categoria/transações`, {
        monthlyRecordId: dados.monthlyRecordId,
        month: dados.month,
        year: dados.year,
        idCategory: dados.categoryId
      });
    }
    history.push('/inicio');
  };

  if (isLoadingData) {
    return <LoadingSpinner message="Carregando os dados da transação." />;
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
          {id ? 'Editar Transação' : 'Nova Transação'}
        </h5>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Campos Básicos */}
          <Row className="mb-3">
            <Col md={12}>
              <h6 className={styles.sectionTitle}>Informações Básicas</h6>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              <div className={styles.fieldGroup}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Título é obrigatório' }}
                  render={({ field }) => (
                    <>
                      <label className={styles.label}>Título *</label>
                      <input
                        {...field}
                        type="text"
                        placeholder="Digite o título da transação"
                        className={`${styles.input} ${
                          errors.title ? styles.error : ''
                        }`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        errors={errors}
                        name="title"
                        render={({ message }) => errorFormMessage(message)}
                      />
                    </>
                  )}
                />
              </div>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              <div className={styles.fieldGroup}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <>
                      <label className={styles.label}>Descrição</label>
                      <textarea
                        {...field}
                        placeholder="Digite uma descrição para a transação"
                        className={styles.input}
                        disabled={loading}
                        rows={3}
                      />
                    </>
                  )}
                />
              </div>
            </Col>
          </Row>

          <Row className="mb-4">
            {category?.type === 'financeiro' && (
              <Col md={6}>
                <div className={styles.fieldGroup}>
                  <Controller
                    name="amount"
                    control={control}
                    rules={{
                      required: 'Valor é obrigatório',
                      validate: (value) => {
                        const numericValue = parseFloat(parseCurrency(value));
                        if (isNaN(numericValue) || numericValue <= 0) {
                          return 'O valor deve ser maior que zero';
                        }
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <>
                        <label className={styles.label}>Valor *</label>
                        <input
                          {...field}
                          type="text"
                          placeholder="R$ 0,00"
                          className={`${styles.input} ${
                            errors.amount ? styles.error : ''
                          }`}
                          disabled={loading}
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                        <ErrorMessage
                          errors={errors}
                          name="amount"
                          render={({ message }) => errorFormMessage(message)}
                        />
                      </>
                    )}
                  />
                </div>
              </Col>
            )}

            <Col md={6}>
              <div className={styles.fieldGroup}>
                <Controller
                  name="transactionDate"
                  control={control}
                  rules={{ required: 'Data é obrigatória' }}
                  render={({ field }) => (
                    <>
                      <label className={styles.label}>
                        Data da Transação *
                      </label>
                      <input
                        {...field}
                        type="date"
                        className={`${styles.input} ${
                          errors.transactionDate ? styles.error : ''
                        }`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        errors={errors}
                        name="transactionDate"
                        render={({ message }) => errorFormMessage(message)}
                      />
                    </>
                  )}
                />
              </div>
            </Col>
          </Row>

          {/* Campos Customizados */}
          <CustomFieldsRenderer
            customFields={customFields}
            control={control}
            errors={errors}
            loading={loading}
          />

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

export default TransactionForm;
