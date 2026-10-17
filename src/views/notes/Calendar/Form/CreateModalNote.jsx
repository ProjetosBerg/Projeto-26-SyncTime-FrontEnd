import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import CreatableSelect from 'react-select/creatable';
import styles from './CreateModalNote.module.css';
import { useTheme } from './../../../../hooks/useTheme';
import { useEmphasisColor } from './../../../../hooks/useEmphasisColor';
import { useButtonColors } from './../../../../hooks/useButtonColors'; 
import useFlashMessage from '../../../../hooks/userFlashMessage';
import ServiceCategory from '../../../sectionConfigSystem/Sections/Report/Category/services/ServiceCategory';
import ServiceNotes from '../services/ServiceNotes';
import { createNotesValidationSchema } from '../validation/createNotesValidationSchema';
import StatusBadge from '../../../../components/statusBadge/StatusBadge';

const STATUS_CONFIG = {
  'Não Realizado': { 
    label: 'Não Realizado', 
    color: '#ef4444', 
    bgColor: '#fef2f2', 
    shadowColor: 'rgba(239, 68, 68, 0.25)',
    icon: '✕' 
  },
  'Em Andamento': { 
    label: 'Andamento', 
    color: '#3b82f6', 
    bgColor: '#eff6ff', 
    shadowColor: 'rgba(59, 130, 246, 0.25)',
    icon: '▶' 
  },
  'Concluído': { 
    label: 'Concluído', 
    color: '#10b981', 
    bgColor: '#ecfdf5', 
    shadowColor: 'rgba(16, 185, 129, 0.25)',
    icon: '✓' 
  }
};

const WEEK_DAYS = [
  { value: 0, label: 'D', name: 'Domingo' },
  { value: 1, label: 'S', name: 'Segunda-feira' },
  { value: 2, label: 'T', name: 'Terça-feira' },
  { value: 3, label: 'Q', name: 'Quarta-feira' },
  { value: 4, label: 'Q', name: 'Quinta-feira' },
  { value: 5, label: 'S', name: 'Sexta-feira' },
  { value: 6, label: 'S', name: 'Sábado' }
];

const formatDateForInput = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekDay = (date) => {
  const formattedDate = formatDateForInput(date);
  return formattedDate
    ? new Date(`${formattedDate}T00:00:00`).getDay()
    : new Date().getDay();
};

const getMaxRecurrenceDate = (date) => {
  const formattedDate = formatDateForInput(date);
  if (!formattedDate) return '';

  const maximum = new Date(`${formattedDate}T00:00:00`);
  maximum.setDate(maximum.getDate() + 730);
  return formatDateForInput(maximum);
};

const getDefaultRecurrenceEndDate = (date) => {
  const formattedDate = formatDateForInput(date);
  if (!formattedDate) return '';

  const endDate = new Date(`${formattedDate}T00:00:00`);
  endDate.setDate(endDate.getDate() + 30);
  return formatDateForInput(endDate);
};


const CreateModalNote = ({
  isOpen,
  onClose,
  selectedRoutine,
  noteToEdit,
  onRefresh,
  dateOfNote
}) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const { primaryButtonColor, secondaryButtonColor } = useButtonColors(); 
  const { setFlashMessage } = useFlashMessage();
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [updatingComment, setUpdatingComment] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userData.id || '';

  const commentsRef = useRef(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(createNotesValidationSchema),
    defaultValues: {
      status: 'Em Andamento',
      collaborators: [],
      priority: '',
      category_id: '',
      activity: '',
      activityType: '',
      description: '',
      startTime: '',
      endTime: '',
      routine_id: selectedRoutine?.id || '',
      userId,
      dateOfNote: formatDateForInput(dateOfNote),
      hasRecurrence: false,
      recurrenceFrequency: 'daily',
      recurrenceInterval: 1,
      recurrenceEndDate: getDefaultRecurrenceEndDate(dateOfNote),
      recurrenceWeekDays: [getWeekDay(dateOfNote)]
    }
  });

  const hasRecurrence = watch('hasRecurrence');
  const recurrenceFrequency = watch('recurrenceFrequency');

  const fetchCategories = async () => {
    if (categories.length > 0) return; 
    try {
      setLoadingCategories(true);
      const response = await ServiceCategory.getByAllSideBarCategory(true);
      if (response.data.status === 'OK') {
        setCategories(response.data.data || []);
      } else {
        setFlashMessage('Erro ao carregar categorias', 'error');
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      setFlashMessage('Erro ao carregar categorias', 'error');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSpecificCategory = async (categoryId) => {
    try {
      setLoadingCategories(true);
      const response = await ServiceCategory.getByIdCategory(categoryId);
      if (response.data.status === 'OK') {
        const categoryData = response.data.data;
        if (!categories.find(cat => cat.id === categoryData.id)) {
          setCategories(prev => [...prev, categoryData]);
        }
        return true;
      } else {
        setFlashMessage('Erro ao carregar categoria específica', 'error');
        return false;
      }
    } catch (error) {
      console.error('Erro ao buscar categoria específica:', error);
      setFlashMessage('Erro ao carregar categoria específica', 'error');
      return false;
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setShowComments(!mobile);
      
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
     fetchCategories();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'auto';
      setFormInitialized(false);
      return;
    }

    document.body.style.overflow = 'hidden';

    const loadCategories = async () => {
      const categoryId = noteToEdit?.category_id;
      let success = false;

      if (noteToEdit && categoryId) {
        success = await fetchSpecificCategory(categoryId);
        if (!success) {
          await fetchCategories();
        }
      } else {
        await fetchCategories();
      }
    };

    loadCategories();

  }, [isOpen, noteToEdit?.category_id]);



  useEffect(() => {
    if (!isOpen || !formInitialized) return;

    if (noteToEdit) {
      setComments(noteToEdit.comments || []);
      reset({
        status: noteToEdit.status || 'Em Andamento',
        collaborators: noteToEdit.collaborators || [],
        priority: noteToEdit.priority || '',
        category_id: noteToEdit.category_id || '',
        activity: noteToEdit.activity || '',
        activityType: noteToEdit.activityType || '',
        description: noteToEdit.description || '',
        startTime: noteToEdit.startTime ? noteToEdit.startTime.slice(0, 5) : '',
        endTime: noteToEdit.endTime ? noteToEdit.endTime.slice(0, 5) : '',
        routine_id: noteToEdit.routine_id || selectedRoutine?.id || '',
        userId: noteToEdit.userId || userId,
        dateOfNote: formatDateForInput(dateOfNote),
        hasRecurrence: false,
        recurrenceFrequency: 'daily',
        recurrenceInterval: 1,
        recurrenceEndDate: getDefaultRecurrenceEndDate(dateOfNote),
        recurrenceWeekDays: [getWeekDay(dateOfNote)]
      });
    } else {
      reset({
        status: 'Em Andamento',
        collaborators: [],
        priority: '',
        category_id: '',
        activity: '',
        activityType: '',
        description: '',
        startTime: '',
        endTime: '',
        routine_id: selectedRoutine?.id || '',
        userId,
        dateOfNote: formatDateForInput(dateOfNote),
        hasRecurrence: false,
        recurrenceFrequency: 'daily',
        recurrenceInterval: 1,
        recurrenceEndDate: getDefaultRecurrenceEndDate(dateOfNote),
        recurrenceWeekDays: [getWeekDay(dateOfNote)]
      });
      setComments([]);
      setNewComment('');
    }
  }, [isOpen, noteToEdit, selectedRoutine?.id, userId, reset, formInitialized, dateOfNote]);

  useEffect(() => {
    if (isOpen && categories.length > 0 && !formInitialized) {
      setFormInitialized(true);
    }
  }, [isOpen, categories.length, formInitialized]);

  const closeModal = () => {
    if (onClose) onClose();
    setShowComments(false);
    setLoading(false);
    setFormInitialized(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const updateCommentsOnServer = async (updatedComments) => {
    if (!noteToEdit) return;

    try {
      setUpdatingComment(true);
      await ServiceNotes.editNotes(noteToEdit.id, { comments: updatedComments });
      setFlashMessage('Comentário adicionado com sucesso', 'success');
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Erro ao atualizar comentários:', error);
      const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Erro ao adicionar comentário';
      setFlashMessage(errorMsg, 'error');
      setComments(noteToEdit.comments || []);
    } finally {
      setUpdatingComment(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    const now = new Date().toISOString();
    const comment = {
      author: userData.name,
      text: newComment.trim(),
      created_at: now,
      updated_at: now
    };
    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    setNewComment('');
    setTimeout(() => {
      if (commentsRef?.current) {
        commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
      }
    }, 0);

    if (noteToEdit) {
      await updateCommentsOnServer(updatedComments);
    }
  };

  const handleCommentKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault();
      addComment();
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (!data.routine_id) {
        throw new Error('ID da rotina é obrigatório');
      }

      const recurrence = !noteToEdit && data.hasRecurrence
        ? {
            frequency: data.recurrenceFrequency,
            interval: Number(data.recurrenceInterval),
            endDate: data.recurrenceEndDate,
            ...(data.recurrenceFrequency === 'weekly' && {
              weekDays: [...data.recurrenceWeekDays].sort((a, b) => a - b)
            })
          }
        : undefined;

      const payload = {
        status: data.status,
        collaborators: data.collaborators || [],
        priority: data.priority,
        category_id: data.category_id || null,
        activity: data.activity,
        activityType: data.activityType,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        comments: comments.length > 0 ? comments : null,
        routine_id: data.routine_id,
        userId: data.userId,
        dateOfNote: dateOfNote,
        ...(recurrence && { recurrence })
      };

      if (noteToEdit) {
         await ServiceNotes.editNotes(noteToEdit.id, payload);
        setFlashMessage('Anotação atualizada com sucesso', 'success');
      } else {
        const response = await ServiceNotes.createNotes(payload);
        const occurrenceCount = response.data?.data?.occurrenceCount;
        setFlashMessage(
          occurrenceCount > 1
            ? `Série criada com ${occurrenceCount} ocorrências`
            : 'Anotação criada com sucesso',
          'success'
        );
      }

      if (onRefresh) onRefresh();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
      const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || error.message || 'Erro ao salvar anotação';
      setFlashMessage(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCustomStyles = (error, theme, emphasisColor) => ({
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === 'light' ? 'white' : '#334155',
      borderRadius: '12px',
      borderColor: error 
        ? '#ef4444' 
        : state.isFocused 
          ? emphasisColor 
          : theme === 'light' 
            ? '#e1e5e9' 
            : '#475569',
      boxShadow: state.isFocused 
        ? `0 0 0 3px ${theme === 'light' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.2)'}` 
        : error 
          ? '0 0 0 1px #ef4444' 
          : 'none',
      minHeight: '50px',
      maxHeight: '80px',
      '&:hover': {
        borderColor: error ? '#ef4444' : emphasisColor,
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: theme === 'light' ? '#e1e5e9' : '#475569',
      borderRadius: '4px',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: theme === 'light' ? '#374151' : '#f1f5f9',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: theme === 'light' ? '#6b7280' : '#94a3b8',
      '&:hover': {
        backgroundColor: theme === 'light' ? '#d1d5db' : '#475569',
        color: theme === 'light' ? '#374151' : '#f1f5f9',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === 'light' ? '#6b7280' : '#94a3b8',
    }),
    input: (provided) => ({
      ...provided,
      color: theme === 'light' ? '#374151' : '#f1f5f9',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused 
        ? theme === 'light' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.2)' 
        : 'transparent',
      color: theme === 'light' ? '#374151' : '#f1f5f9',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === 'light' ? 'white' : '#1e293b',
      border: `1px solid ${theme === 'light' ? '#e1e5e9' : '#334155'}`,
      borderRadius: '8px',
    }),
  });

  if (!isOpen) return null;

  const showFooter = !isMobile || (isMobile && !showComments);
  const isEditMode = !!noteToEdit;
  const recurrenceStartDate = formatDateForInput(dateOfNote);
  const recurrenceMaxDate = getMaxRecurrenceDate(dateOfNote);
  const recurrenceUnit = {
    daily: 'dia(s)',
    weekly: 'semana(s)',
    monthly: 'mês(es)'
  }[recurrenceFrequency] || 'período(s)';
  const modalTitle = isEditMode ? 'Editar Anotação' : 'Nova Anotação';

  const priorityOptions = [
    { value: 'Baixa', label: 'Baixa' },
    { value: 'Média', label: 'Média' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Urgente', label: 'Urgente' }
  ];

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  const activityTypeOptions = [
    { value: 'Virtual', label: 'Virtual' },
    { value: 'Presencial', label: 'Presencial' },
    { value: 'Híbrida', label: 'Híbrida' },
    { value: 'Remota', label: 'Remota' },
    { value: 'Outros', label: 'Outros' }
  ];

  return (
    <div
      className={`${styles.modalOverlay} ${styles[theme]} ${styles.active}`}
      onClick={handleOverlayClick}
    >
      <div className={`${styles.modalContainer} ${styles[theme]}`}>
        <div
          className={`${styles.modalHeader} ${styles[theme]}`}
          style={{
            background: `linear-gradient(135deg, ${emphasisColor || '#667eea'} 0%, ${emphasisColor || '#764ba2'} 100%)`
          }}
        >
          <h2 className={`${styles.modalTitle} ${styles[theme]}`}>{modalTitle}</h2>
          {isMobile && (
            <button
              className={`${styles.toggleBtn} ${styles[theme]} ${showComments ? styles.active : ''}`}
              onClick={toggleComments}
              aria-expanded={showComments}
              aria-label={showComments ? 'Voltar ao formulário' : 'Mostrar comentários'}
              style={{
                borderColor: emphasisColor || '#667eea',
                background: `rgba(${emphasisColor || '#667eea'}, 0.2)`
              }}
            >
              {showComments ? '← Voltar ao Form' : '💬 Comentários'}
            </button>
          )}
          <button className={`${styles.closeBtn} ${styles[theme]}`} onClick={closeModal}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={`${styles.modalBody} ${styles[theme]}`}>
            <div className={`${styles.mainContent} ${styles[theme]} ${showComments && isMobile ? styles.hiddenOnMobile : ''}`}>
              <div className={`${styles.formSection} ${styles[theme]}`}>
                <h3 className={`${styles.sectionTitle} ${styles[theme]}`} style={{ '--section-bar-color': emphasisColor || '#667eea' }}>
                  Informações Gerais
                </h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={`${styles.formLabel} ${styles[theme]}`}>
                      Status *
                    </label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <>
                          <div className={styles.statusContainer}>
                            {Object.keys(STATUS_CONFIG).map((status) => (
                              <StatusBadge
                                key={status}
                                status={status}
                                isSelected={field.value === status}
                                onClick={() => field.onChange(status)}
                                disabled={loading}
                                config={STATUS_CONFIG}
                              />
                            ))}
                          </div>
                          <ErrorMessage
                            errors={errors}
                            name="status"
                            render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                          />
                        </>
                      )}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={`${styles.formLabel} ${styles[theme]}`} htmlFor="collaborators">
                      Colaboradores Envolvidos
                    </label>
                    <Controller
                      name="collaborators"
                      control={control}
                      render={({ field, fieldState }) => {
                        const { error } = fieldState;
                        const selectedValue = field.value ? field.value.map(val => ({ value: val, label: val })) : [];
                        return (
                          <div className={error ? `${styles.formGroup} ${styles.error}` : styles.formGroup}>
                            <CreatableSelect
                              isMulti
                              options={[]}
                              value={selectedValue}
                              onChange={(newValue) => field.onChange(newValue ? newValue.map(opt => opt.value) : [])}
                              placeholder="Digite colaboradores..."
                              styles={getCustomStyles(error, theme, emphasisColor)}
                              isClearable
                              isSearchable
                            />
                            <ErrorMessage
                              errors={errors}
                              name="collaborators"
                              render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                            />
                          </div>
                        );
                      }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={`${styles.formLabel} ${styles[theme]}`} htmlFor="priority">
                      Prioridade *
                    </label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          id="priority"
                          className={`${styles.formSelect} ${styles[theme]} ${errors.priority ? styles.error : ''}`}
                          style={{ '--focus-color': emphasisColor || '#667eea' }}
                        >
                          <option value="">Selecione...</option>
                          {priorityOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="priority"
                      render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={`${styles.formLabel} ${styles[theme]}`} htmlFor="category_id">
                      Categoria Relacionada
                    </label>
                    <Controller
                      name="category_id"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          id="category_id"
                          className={`${styles.formSelect} ${styles[theme]} ${errors.category_id ? styles.error : ''}`}
                          style={{ '--focus-color': emphasisColor || '#667eea' }}
                          disabled={loadingCategories}
                        >
                          <option value="">Selecione...</option>
                          {categoryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="category_id"
                      render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                    />
                    {loadingCategories && <div className={styles.loadingText}>Carregando categorias...</div>}
                  </div>
                </div>
              </div>

              <div className={`${styles.formSection} ${styles[theme]}`}>
                <h3 className={`${styles.sectionTitle} ${styles[theme]}`} style={{ '--section-bar-color': emphasisColor || '#667eea' }}>
                  Detalhes da Atividade
                </h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={`${styles.formLabel} ${styles[theme]}`} htmlFor="activity">
                      Atividade *
                    </label>
                    <Controller
                      name="activity"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          id="activity"
                          className={`${styles.formInput} ${styles[theme]} ${errors.activity ? styles.error : ''}`}
                          placeholder="Ex: Reunião de equipe"
                          style={{ '--focus-color': emphasisColor || '#667eea' }}
                        />
                      )}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="activity"
                      render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={`${styles.formLabel} ${styles[theme]}`} htmlFor="activityType">
                      Tipo de Atividade *
                    </label>
                    <Controller
                      name="activityType"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          id="activityType"
                          className={`${styles.formSelect} ${styles[theme]} ${errors.activityType ? styles.error : ''}`}
                          style={{ '--focus-color': emphasisColor || '#667eea' }}
                        >
                          <option value="">Selecione...</option>
                          {activityTypeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="activityType"
                      render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={`${styles.formLabel} ${styles[theme]}`} htmlFor="description">
                      Descrição do que foi feito *
                    </label>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          id="description"
                          className={`${styles.formTextarea} ${styles[theme]} ${errors.description ? styles.error : ''}`}
                          placeholder="Descreva em detalhes o que foi realizado..."
                          style={{ '--focus-color': emphasisColor || '#667eea' }}
                        />
                      )}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="description"
                      render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={`${styles.formLabel} ${styles[theme]}`}>Período do Horário *</label>
                    <div className={styles.timeRangeGroup}>
                      <div className={styles.formGroup}>
                        <label className={`${styles.formLabel} ${styles[theme]}`} htmlFor="startTime">
                          Início
                        </label>
                        <Controller
                          name="startTime"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="time"
                              id="startTime"
                              className={`${styles.formInput} ${styles[theme]} ${errors.startTime ? styles.error : ''}`}
                              style={{ '--focus-color': emphasisColor || '#667eea' }}
                            />
                          )}
                        />
                        <ErrorMessage
                          errors={errors}
                          name="startTime"
                          render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={`${styles.formLabel} ${styles[theme]}`} htmlFor="endTime">
                          Fim
                        </label>
                        <Controller
                          name="endTime"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="time"
                              id="endTime"
                              className={`${styles.formInput} ${styles[theme]} ${errors.endTime ? styles.error : ''}`}
                              style={{ '--focus-color': emphasisColor || '#667eea' }}
                            />
                          )}
                        />
                        <ErrorMessage
                          errors={errors}
                          name="endTime"
                          render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!isEditMode && (
                <div className={`${styles.formSection} ${styles[theme]}`}>
                  <h3
                    className={`${styles.sectionTitle} ${styles[theme]}`}
                    style={{ '--section-bar-color': emphasisColor || '#667eea' }}
                  >
                    Recorrência
                  </h3>

                  <Controller
                    name="hasRecurrence"
                    control={control}
                    render={({ field }) => (
                      <label
                        className={`${styles.recurrenceToggle} ${styles[theme]}`}
                        style={{ '--focus-color': emphasisColor || '#667eea' }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(field.value)}
                          onChange={(event) => field.onChange(event.target.checked)}
                        />
                        <span
                          className={styles.toggleTrack}
                          style={{ '--toggle-color': emphasisColor || '#667eea' }}
                        >
                          <span />
                        </span>
                        <span className={styles.toggleText}>
                          <strong>Repetir esta atividade</strong>
                          <small>Crie automaticamente as próximas ocorrências.</small>
                        </span>
                      </label>
                    )}
                  />

                  {hasRecurrence && (
                    <div className={`${styles.recurrencePanel} ${styles[theme]}`}>
                      <div className={styles.recurrenceGrid}>
                        <div className={styles.formGroup}>
                          <label className={`${styles.formLabel} ${styles[theme]}`} htmlFor="recurrenceFrequency">
                            Frequência *
                          </label>
                          <Controller
                            name="recurrenceFrequency"
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                id="recurrenceFrequency"
                                className={`${styles.formSelect} ${styles[theme]} ${errors.recurrenceFrequency ? styles.error : ''}`}
                                style={{ '--focus-color': emphasisColor || '#667eea' }}
                              >
                                <option value="daily">Diariamente</option>
                                <option value="weekly">Semanalmente</option>
                                <option value="monthly">Mensalmente</option>
                              </select>
                            )}
                          />
                          <ErrorMessage
                            errors={errors}
                            name="recurrenceFrequency"
                            render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={`${styles.formLabel} ${styles[theme]}`} htmlFor="recurrenceInterval">
                            Repetir a cada *
                          </label>
                          <div className={styles.intervalField}>
                            <Controller
                              name="recurrenceInterval"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  id="recurrenceInterval"
                                  min="1"
                                  max="30"
                                  className={`${styles.formInput} ${styles[theme]} ${errors.recurrenceInterval ? styles.error : ''}`}
                                  style={{ '--focus-color': emphasisColor || '#667eea' }}
                                />
                              )}
                            />
                            <span>{recurrenceUnit}</span>
                          </div>
                          <ErrorMessage
                            errors={errors}
                            name="recurrenceInterval"
                            render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                          />
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                          <label className={`${styles.formLabel} ${styles[theme]}`} htmlFor="recurrenceEndDate">
                            Repetir até *
                          </label>
                          <Controller
                            name="recurrenceEndDate"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="date"
                                id="recurrenceEndDate"
                                min={recurrenceStartDate}
                                max={recurrenceMaxDate}
                                className={`${styles.formInput} ${styles[theme]} ${errors.recurrenceEndDate ? styles.error : ''}`}
                                style={{ '--focus-color': emphasisColor || '#667eea' }}
                              />
                            )}
                          />
                          <ErrorMessage
                            errors={errors}
                            name="recurrenceEndDate"
                            render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                          />
                          <small className={styles.fieldHint}>Limite máximo de dois anos.</small>
                        </div>
                      </div>

                      {recurrenceFrequency === 'weekly' && (
                        <div className={styles.weekDaysGroup}>
                          <span className={`${styles.formLabel} ${styles[theme]}`}>Dias da semana *</span>
                          <Controller
                            name="recurrenceWeekDays"
                            control={control}
                            render={({ field }) => (
                              <div className={styles.weekDays} role="group" aria-label="Dias da semana">
                                {WEEK_DAYS.map((day) => {
                                  const selected = (field.value || []).includes(day.value);
                                  return (
                                    <button
                                      key={day.value}
                                      type="button"
                                      title={day.name}
                                      aria-label={day.name}
                                      aria-pressed={selected}
                                      className={selected ? styles.weekDaySelected : ''}
                                      style={selected ? { backgroundColor: emphasisColor || '#667eea' } : {}}
                                      onClick={() => {
                                        const current = field.value || [];
                                        field.onChange(
                                          selected
                                            ? current.filter((value) => value !== day.value)
                                            : [...current, day.value].sort((a, b) => a - b)
                                        );
                                      }}
                                    >
                                      {day.label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          />
                          <ErrorMessage
                            errors={errors}
                            name="recurrenceWeekDays"
                            render={({ message }) => <div className={styles.errorMessage}>{message}</div>}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={`${styles.sidebar} ${styles[theme]} ${showComments && isMobile ? styles.expanded : ''}`}>
              {showComments && isMobile && (
                <button
                  className={`${styles.backBtn} ${styles[theme]}`}
                  onClick={toggleComments}
                  aria-label="Voltar ao formulário"
                  style={{ color: emphasisColor || '#667eea' }}
                >
                  ← Voltar
                </button>
              )}
              <h3 className={`${styles.sectionTitle} ${styles[theme]}`} style={{ '--section-bar-color': emphasisColor || '#667eea' }}>
                Comentários
              </h3>
              <div className={`${styles.commentsList} ${styles[theme]}`} ref={commentsRef}>
                {comments.map((comment, index) => (
                  <div
                    key={index}
                    className={`${styles.commentItem} ${styles[theme]}`}
                    style={{ borderLeftColor: emphasisColor || '#667eea' }}
                  >
                    <div className={`${styles.commentAuthor} ${styles[theme]}`} style={{ color: emphasisColor || '#667eea' }}>
                      {comment.author}
                    </div>
                    <div className={`${styles.commentText} ${styles[theme]}`}>{comment.text}</div>
                    <div className={`${styles.commentDate} ${styles[theme]}`}>
                      {new Date(comment.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
              <div className={`${styles.addCommentGroup} ${styles[theme]}`}>
                <input
                  type="text"
                  className={`${styles.addCommentInput} ${styles[theme]}`}
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleCommentKeyPress}
                  style={{ '--focus-color': emphasisColor || '#667eea' }}
                  disabled={updatingComment}
                />
                <button
                  className={`${styles.addCommentBtn} ${styles[theme]}`}
                  type="button"
                  onClick={addComment}
                  disabled={updatingComment}
                  style={{
                    background: `linear-gradient(135deg, ${emphasisColor || '#667eea'} 0%, ${emphasisColor || '#764ba2'} 100%)`
                  }}
                >
                  {updatingComment ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
          {showFooter && (
            <div className={`${styles.modalFooter} ${styles[theme]}`}>
              <button
                type="button"
                className={`${styles.btnSecondary} ${styles[theme]}`}
                onClick={closeModal}
                disabled={loading}
                style={{ backgroundColor: secondaryButtonColor }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`${styles.btnPrimary} ${styles[theme]}`}
                disabled={loading}
                style={{ backgroundColor: primaryButtonColor }}
              >
                {loading
                  ? 'Salvando...'
                  : isEditMode
                    ? 'Atualizar'
                    : hasRecurrence
                      ? 'Criar recorrência'
                      : 'Salvar Anotação'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateModalNote;
