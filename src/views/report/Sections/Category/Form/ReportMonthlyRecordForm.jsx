import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { ErrorMessage } from '@hookform/error-message';

// 💅 Estilos (Contém os novos estilos que você atualizou)
import styles from './ReportMonthlyRecordForm.module.css';

// 🧩 Componentes
import LoadingSpinner from '../../../../../components/loading/LoadingSpinner';
import ActionHeader from '../../../../../components/header/ActionHeader/ActionHeader';
import SingleSelect from '../../../../../components/select/SingleSelect';

// 🔧 Utils e Hooks
import useFlashMessage from '../../../../../hooks/userFlashMessage';
import { useTheme } from '../../../../../hooks/useTheme';
import { useButtonColors } from '../../../../../hooks/useButtonColors';
import errorFormMessage from '../../../../../utils/errorFormMessage';

// 📡 Services
import ServiceMonthlyRecord from '../services/ServiceMonthlyRecord';
import StatusBadge from '../../../../../components/statusBadge/StatusBadge';
import ServiceCategory from '../../../../sectionConfigSystem/Sections/Report/Category/services/ServiceCategory';


const STATUS_CONFIG = {
  concluido: { 
    label: 'Concluído', 
    color: '#10b981', 
    bgColor: '#ecfdf5', 
    shadowColor: 'rgba(16, 185, 129, 0.25)',
    icon: '✓' 
  },
  pendente: { 
    label: 'Pendente', 
    color: '#f59e0b', 
    bgColor: '#fffbeb', 
    shadowColor: 'rgba(245, 158, 11, 0.25)',
    icon: '⏳' 
  },
  em_andamento: { 
    label: 'Em Andamento', 
    color: '#3b82f6', 
    bgColor: '#eff6ff', 
    shadowColor: 'rgba(59, 130, 246, 0.25)',
    icon: '▶' 
  },
  pausado: { 
    label: 'Pausado', 
    color: '#8b5cf6', 
    bgColor: '#f5f3ff', 
    shadowColor: 'rgba(139, 92, 246, 0.25)',
    icon: '⏸' 
  },
  cancelado: { 
    label: 'Cancelado', 
    color: '#ef4444', 
    bgColor: '#fef2f2', 
    shadowColor: 'rgba(239, 68, 68, 0.25)',
    icon: '✕' 
  }
};

const ReportMonthlyRecordForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const { dados } = location.state || {};
  const history = useHistory();
  const { theme } = useTheme();
  const { 
    primaryButtonColor, 
    secondaryButtonColor 
  } = useButtonColors(); 
  const { setFlashMessage } = useFlashMessage();

  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(!!id);
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
      goal: '',
      status: null,
      initial_balance: '',
      month: null,
      year: null
    }
  });

  // Opções de status
  const statusOptions = ['concluido', 'pendente', 'em_andamento', 'pausado', 'cancelado'];

  // Opções de meses
  const monthOptions = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, i) => {
    const year = currentYear - 5 + i;
    return { value: year, label: year.toString() };
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
    return value
      .replace('R$', '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
  };

  useEffect(() => {
    const fetchMonthlyRecordData = async () => {
      if (!id) return;

      try {
        setIsLoadingData(true);
        const response = await ServiceMonthlyRecord.getByIdMonthlyRecord(id);

        if (response.data.status === 'OK') {
          const recordData = response.data.data;
          if (!recordData) throw new Error('Registro mensal não encontrado');

          reset({
            title: recordData.title || '',
            description: recordData.description || '',
            goal: recordData.goal || '',
            status: recordData.status || null,
            initial_balance: recordData.initial_balance 
              ? formatCurrency((recordData.initial_balance * 100).toString())
              : '',
            month: recordData.month
              ? {
                  value: recordData.month,
                  label: monthOptions.find((m) => m.value === recordData.month)?.label || recordData.month.toString()
                }
              : null,
            year: recordData.year
              ? { value: recordData.year, label: recordData.year.toString() }
              : null
          });
        }
      } catch (error) {
        console.error('Erro ao buscar registro mensal:', error);
        setFlashMessage('Erro ao carregar dados do registro mensal', 'error');
        history.push('/relatorios/categoria/relatorio-mesal');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchMonthlyRecordData();
  }, [id]);

  useEffect(() => {
    const fetchCategory = async () => {
      if(dados?.categoryId) {
        const category = await ServiceCategory.getByIdCategory(dados.categoryId);
        setCategory(category.data.data);
      }
    };
    fetchCategory();
  }, [dados?.categoryId]);

  // Submit
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        title: data.title,
        description: data.description || undefined,
        goal: data.goal,
        status: data.status,
        initial_balance: data.initial_balance
          ? parseFloat(parseCurrency(data.initial_balance))
          : undefined,
        month: data.month?.value || data.month,
        year: data.year?.value || data.year,
        categoryId: dados?.categoryId
      };

      if (id) {
        await ServiceMonthlyRecord.editMonthlyRecord(id, payload);
        setFlashMessage('Registro mensal atualizado com sucesso', 'success');
      } else {
        await ServiceMonthlyRecord.createMonthlyRecord(payload);
        setFlashMessage('Registro mensal criado com sucesso', 'success');
      }

      history.push(`/relatorios/categoria/relatorio-mesal/${dados?.categoryId}`);
    } catch (error) {
      console.error('Erro ao salvar registro mensal:', error);
      const errorMessage = id ? 'Erro ao atualizar registro mensal' : 'Erro ao criar registro mensal';
      setFlashMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Navegação
  const handleCancel = () => {
    if(dados?.categoryId) {
      return history.push(`/relatorios/categoria/relatorio-mesal/${dados.categoryId}`)
    };
    history.push('/inicio');
  };

  const handleBack = () => {
    if(dados?.categoryId) {
      return history.push(`/relatorios/categoria/relatorio-mesal/${dados.categoryId}`)
    };
    history.push('/inicio');
  };

  if (isLoadingData) {
    return <LoadingSpinner message="Carregando os dados do registro mensal." />;
  }

  return (
    <>
      <ActionHeader
        onBack={handleBack}
        backButtonLabel="Voltar"
        isOnlyBack={true}
      />
      {/* Aplica o tema Dark/Light ao container principal */}
      <div className={`${styles.container} ${styles[theme]}`}>
        <h5 className={styles.title}>
          {id ? 'Editar Registro Mensal' : 'Novo Registro Mensal'}
        </h5>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Primeira Linha - Título e Status */}
          <Row className="mb-4">
            <Col md={7}>
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
                        placeholder="Digite o título do registro"
                        // Usa estilos temáticos
                        className={`${styles.input} ${errors.title ? styles.error : ''}`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        errors={errors}
                        name="title"
                        render={({ message }) => errorFormMessage(message, styles.errorMessage)}
                      />
                    </>
                  )}
                />
              </div>
            </Col>

            <Col md={5}>
              <div className={styles.fieldGroup}>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: 'Status é obrigatório' }}
                  render={({ field }) => (
                    <>
                      <label className={styles.label}>Status *</label>
                      
                      {/* Container Moderno dos Badges */}
                      <div className={styles.statusContainer}>
                        {statusOptions.map((status) => (
                          <StatusBadge
                            key={status}
                            status={status}
                            config={STATUS_CONFIG}
                            isSelected={field.value === status}
                            onClick={() => field.onChange(status)}
                            disabled={loading}
                          />
                        ))}
                      </div>

                      <ErrorMessage
                        errors={errors}
                        name="status"
                        render={({ message }) => errorFormMessage(message, styles.errorMessage)}
                      />
                    </>
                  )}
                />
              </div>
            </Col>
          </Row>

          {/* Segunda Linha - Descrição */}
          <Row className="mb-4">
            <Col md={12}>
              <div className={styles.fieldGroup}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <>
                      <label className={styles.label}>Descrição</label>
                      <input
                        {...field}
                        type="text"
                        placeholder="Digite uma descrição"
                        className={styles.input}
                        disabled={loading}
                      />
                    </>
                  )}
                />
              </div>
            </Col>
          </Row>

          {/* Terceira Linha - Meta e Saldo Inicial */}
          <Row className="mb-4">
            <Col md={6}>
              <div className={styles.fieldGroup}>
                <Controller
                  name="goal"
                  control={control}
                  rules={{ required: 'Meta é obrigatória' }}
                  render={({ field }) => (
                    <>
                      <label className={styles.label}>Meta *</label>
                      <input
                        {...field}
                        type="text"
                        placeholder="Digite a meta do registro"
                        className={`${styles.input} ${errors.goal ? styles.error : ''}`}
                        disabled={loading}
                      />
                      <ErrorMessage
                        errors={errors}
                        name="goal"
                        render={({ message }) => errorFormMessage(message, styles.errorMessage)}
                      />
                    </>
                  )}
                />
              </div>
            </Col>
            {category?.type === 'financeiro' && ( <Col md={6}>
              <div className={styles.fieldGroup}>
                <Controller
                  name="initial_balance"
                  control={control}
                  render={({ field }) => (
                    <>
                      <label className={styles.label}>Saldo Inicial</label>
                      <input
                        {...field}
                        type="text"
                        placeholder="R$ 0,00"
                        className={styles.input}
                        disabled={loading}
                        onChange={(e) => {
                          const formatted = formatCurrency(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </>
                  )}
                />
              </div>
            </Col>)}
           
          </Row>

          {/* Quarta Linha - Mês e Ano */}
          <Row className="mb-4">
            <Col md={6}>
              <div className={styles.fieldGroup}>
                <Controller
                  name="month"
                  control={control}
                  rules={{ required: 'Mês é obrigatório' }}
                  render={({ field }) => (
                    <>
                      <label className={styles.label}>Mês *</label>
                      <SingleSelect
                        options={monthOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione..."
                        isDisabled={loading}
                      />
                      <ErrorMessage
                        errors={errors}
                        name="month"
                        render={({ message }) => errorFormMessage(message, styles.errorMessage)}
                      />
                    </>
                  )}
                />
              </div>
            </Col>

            <Col md={6}>
              <div className={styles.fieldGroup}>
                <Controller
                  name="year"
                  control={control}
                  rules={{ required: 'Ano é obrigatório' }}
                  render={({ field }) => (
                    <>
                      <label className={styles.label}>Ano *</label>
                      <SingleSelect
                        options={yearOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione..."
                        isDisabled={loading}
                      />
                      <ErrorMessage
                        errors={errors}
                        name="year"
                        render={({ message }) => errorFormMessage(message, styles.errorMessage)}
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

export default ReportMonthlyRecordForm;