import { Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import styles from './CreateRoutine.module.css'; 
import { useTheme } from '../../../../hooks/useTheme';
import { useEmphasisColor } from '../../../../hooks/useEmphasisColor';
import useFlashMessage from '../../../../hooks/userFlashMessage';
import ServiceRoutines from '../services/ServiceRoutines';

const PERIODS = ['Manhã', 'Tarde', 'Noite'];

const CreateRoutine = ({
  isOpen,
  onClose,
  selectedDate,
  noteType,
  onNoteTypeChange,
  selectedPeriods,
  onSelectedPeriodsChange,
  formattedDate,
  selectedDateNotes,
  onRefresh,
  onOpenNoteList
}) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const { setFlashMessage } = useFlashMessage();
  const [loading, setLoading] = useState(false);

  const {
    control,
    setValue,
    trigger,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      noteType: '',
      selectedPeriods: []
    }
  });

  useEffect(() => {
    reset({
      noteType: noteType || '',
      selectedPeriods: selectedPeriods || []
    });
  }, [noteType, selectedPeriods, reset]);

  if (!isOpen) return null;

  const isPeriodType = noteType === 'periodo';
  const hasSummary = !!selectedDateNotes.find(note => note.title === 'Resumo do Dia');
  const existingPeriods = PERIODS.filter(period =>
    selectedDateNotes.some(note => note.title === period)
  );

  const handleAddPeriod = async () => {
    const isValid = await trigger(['noteType', 'selectedPeriods']);
    if (!isValid) return;
    
    try {
      setLoading(true);
      const createdAtDate = selectedDate ? new Date(selectedDate) : new Date();
      createdAtDate.setHours(0, 0, 0, 0);

      const response = await ServiceRoutines.createRoutines({
        type: 'periodo',
        periods: selectedPeriods,
        createdAt: createdAtDate.toISOString()
      });

      if (response.data.status === 'OK') {
        const quantity = selectedPeriods.length;
        setFlashMessage(
          quantity === 1
            ? 'Rotina criada com sucesso'
            : `${quantity} rotinas criadas com sucesso`,
          'success'
        );
        onClose();
        onSelectedPeriodsChange([]);
        onNoteTypeChange('');
        onRefresh();
      }
    } catch (error) {
      console.error('Erro ao criar rotina:', error);
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        'Erro ao criar rotina';
      setFlashMessage(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (hasSummary) return;

    try {
      setLoading(true);
      const data = {
        type: 'resumo',
        createdAt: new Date(formattedDate).toISOString()
      };
      const response = await ServiceRoutines.createRoutines(data);
      if (response.data.status === 'OK') {
        setFlashMessage('Resumo criado com sucesso', 'success');
        onClose();
        onRefresh();
      }
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      const errorMsg = error.response?.data?.errors?.[0] || 'Erro ao gerar resumo';
      setFlashMessage(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta rotina?')) return;
    try {
      await ServiceRoutines.deleteRoutines(noteId);
      setFlashMessage('Rotina deletada com sucesso', 'success');
      onRefresh();
    } catch (error) {
      console.error('Erro ao deletar rotina:', error);
      const errorMsg = error.response?.data?.errors?.[0] || 'Erro ao deletar rotina';
      setFlashMessage(errorMsg, 'error');
    }
  };

  return (
    <div className={`${styles.modalOverlay} ${styles[theme]}`}>
      <div className={`${styles.modal} ${styles[theme]}`}>
        <div 
          className={`${styles.modalHeader} ${styles[theme]}`}
          style={{
            background: `linear-gradient(135deg, ${emphasisColor || '#667eea'} 0%, ${emphasisColor || '#764ba2'} 100%)`
          }}
        >
          <h2 className={`${styles.modalTitle} ${styles[theme]}`}>
            {selectedDate?.toLocaleDateString('pt-BR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          <button onClick={onClose} className={`${styles.closeButton} ${styles[theme]}`}>
            <X size={20} />
          </button>
        </div>

        <div className={`${styles.modalContent} ${styles[theme]}`}>
          <div className={`${styles.newNoteBox} ${styles[theme]}`}>
            <label className={`${styles.typeLabel} ${styles[theme]}`}>Tipo de rotina:</label>
            <Controller
              name="noteType"
              control={control}
              rules={{ required: 'Tipo de rotina é obrigatório' }}
              render={({ field }) => (
                <select
                  {...field}
                  className={`${styles.typeSelect} ${styles[theme]}`}
                  style={{
                    '--focus-color': emphasisColor || '#667eea'
                  }}
                  onChange={(e) => {
                    field.onChange(e);
                    onNoteTypeChange(e.target.value);
                    if (e.target.value !== 'periodo') {
                      onSelectedPeriodsChange([]);
                      setValue('selectedPeriods', []);
                    }
                  }}
                >
                  <option value="">-- Escolha um tipo --</option>
                  <option value="periodo">Rotina por período</option>
                  <option value="resumo">Resumo do dia</option>
                </select>
              )}
            />
            <ErrorMessage
              errors={errors}
              name="noteType"
              render={({ message }) => <p className={`${styles.errorMessage} ${styles[theme]}`}>{message}</p>}
            />

            {isPeriodType && (
              <>
                <label className={`${styles.periodLabel} ${styles[theme]}`}>
                  Selecione um ou mais períodos:
                </label>
                <Controller
                  name="selectedPeriods"
                  control={control}
                  rules={{
                    validate: (values) => {
                      if (!values?.length) {
                        return 'Selecione pelo menos um período';
                      }
                      if (values.some(period => existingPeriods.includes(period))) {
                        return 'Já existe uma rotina para um dos períodos selecionados';
                      }
                      return true;
                    }
                  }}
                  render={({ field }) => (
                    <div className={styles.periodOptions}>
                      {PERIODS.map((period, index) => {
                        const isAlreadyCreated = existingPeriods.includes(period);
                        const isSelected = field.value?.includes(period);

                        return (
                          <label
                            key={period}
                            className={`${styles.periodOption} ${styles[theme]} ${
                              isSelected ? styles.periodOptionSelected : ''
                            } ${isAlreadyCreated ? styles.periodOptionDisabled : ''}`}
                            style={{
                              '--selection-color': emphasisColor || '#667eea'
                            }}
                          >
                            <input
                              ref={index === 0 ? field.ref : undefined}
                              type="checkbox"
                              value={period}
                              checked={!!isSelected}
                              disabled={!isPeriodType || loading || isAlreadyCreated}
                              onBlur={field.onBlur}
                              onChange={() => {
                                const nextPeriods = isSelected
                                  ? field.value.filter(value => value !== period)
                                  : [...(field.value || []), period];
                                field.onChange(nextPeriods);
                                onSelectedPeriodsChange(nextPeriods);
                              }}
                            />
                            <span>{period}</span>
                            {isAlreadyCreated && (
                              <span className={styles.existingPeriodBadge}>Já criado</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
                <ErrorMessage
                  errors={errors}
                  name="selectedPeriods"
                  render={({ message }) => <p className={`${styles.errorMessage} ${styles[theme]}`}>{message}</p>}
                />
                <button 
                  onClick={handleAddPeriod} 
                  disabled={loading || !!errors.selectedPeriods || !selectedPeriods.length}
                  className={`${styles.addButton} ${(!selectedPeriods.length || !!errors.selectedPeriods || loading) ? styles.addButtonDisabled : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${emphasisColor || '#667eea'} 0%, ${emphasisColor || '#764ba2'} 100%)`
                  }}
                >
                  <Plus size={18} />
                  {loading
                    ? 'Adicionando...'
                    : selectedPeriods.length > 1
                      ? `Adicionar ${selectedPeriods.length} períodos`
                      : 'Adicionar período'}
                </button>
              </>
            )}

            {noteType === 'resumo' && (
              <>
                {hasSummary && (
                  <p className={`${styles.periodWarning} ${styles[theme]}`}>Já existe um resumo do dia.</p>
                )}
                <button 
                  onClick={handleGenerateSummary} 
                  disabled={hasSummary || loading}
                  className={`${styles.generateButton} ${hasSummary || loading ? styles.addButtonDisabled : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${emphasisColor || '#667eea'} 0%, ${emphasisColor || '#764ba2'} 100%)`
                  }}
                >
                  {loading ? 'Gerando...' : 'Gerar anotação para resumo do dia'}
                </button>
              </>
            )}
          </div>

          <div>
            {selectedDateNotes.length === 0 ? (
              <div className={`${styles.emptyState} ${styles[theme]}`}>
                <div className={styles.emptyIcon}>📅</div>
                <p className={`${styles.emptyText} ${styles[theme]}`}>Nenhuma rotina para este dia</p>
              </div>
            ) : (
              <div className={`${styles.notesList} ${styles[theme]}`}>
                {selectedDateNotes.map(note => (
                  <div 
                    key={note.id} 
                    className={`${styles.noteCard} ${styles[theme]}`}
                    style={{
                      '--border-color': emphasisColor || '#667eea'
                    }}
                    onClick={() => onOpenNoteList?.(note)}
                  >
                    <div className={`${styles.noteCardHeader} ${styles[theme]}`}>
                      <h3 className={`${styles.noteCardTitle} ${styles[theme]}`}>{note.title}</h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }} 
                        className={`${styles.deleteButton} ${styles[theme]}`} 
                        disabled={loading}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    {note.notes && note.notes.length > 0 && (
                      <div className={`${styles.noteCount} ${styles[theme]}`}>
                        {note.notes.length} anotação(s)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoutine;
