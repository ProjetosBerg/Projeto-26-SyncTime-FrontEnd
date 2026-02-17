import { Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import styles from './CreateRoutine.module.css'; 
import { useTheme } from '../../../../hooks/useTheme';
import { useEmphasisColor } from '../../../../hooks/useEmphasisColor';
import useFlashMessage from '../../../../hooks/userFlashMessage';
import ServiceRoutines from '../services/ServiceRoutines';

const CreateRoutine = ({
  isOpen,
  onClose,
  selectedDate,
  noteType,
  onNoteTypeChange,
  selectedPeriod,
  onSelectedPeriodChange,
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
      selectedPeriod: ''
    }
  });

  useEffect(() => {
    reset({
      noteType: noteType || '',
      selectedPeriod: selectedPeriod || ''
    });
  }, [noteType, selectedPeriod, reset]);

  if (!isOpen) return null;

  const isPeriodType = noteType === 'periodo';
  const hasSummary = !!selectedDateNotes.find(note => note.title === 'Resumo do Dia');

  const handleAddPeriod = async () => {
    const isValid = await trigger(['noteType', 'selectedPeriod']);
    if (!isValid) return;
    
    try {
      setLoading(true);
      console.log('selectedDate', selectedDate)
      const createdAtDate = selectedDate ? new Date(selectedDate) : new Date();
      createdAtDate.setHours(0, 0, 0, 0)
      const data = {
        type: 'periodo',
        period: selectedPeriod,
        createdAt: createdAtDate.toISOString()

      };
      const response = await ServiceRoutines.createRoutines(data);
      if (response.data.status === 'OK') {
        setFlashMessage('Rotina criada com sucesso', 'success');
        onClose();
        onSelectedPeriodChange('');
        onNoteTypeChange('');
        onRefresh();
      }
    } catch (error) {
      console.error('Erro ao criar rotina:', error);
      const errorMsg = error.response?.data?.errors?.[0] || 'Erro ao criar rotina';
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
                      onSelectedPeriodChange('');
                      setValue('selectedPeriod', '');
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
                <label className={`${styles.periodLabel} ${styles[theme]}`}>Selecione o período:</label>
                <Controller
                  name="selectedPeriod"
                  control={control}
                  rules={{
                    required: 'Período é obrigatório',
                    validate: (value) => {
                      if (!value) return 'Período é obrigatório';
                      if (selectedDateNotes.find(note => note.title === value)) {
                        return 'Já existe uma rotina para este período';
                      }
                      return true;
                    }
                  }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`${styles.periodSelect} ${styles[theme]}`}
                      disabled={!isPeriodType || loading}
                      style={{
                        '--focus-color': emphasisColor || '#667eea'
                      }}
                      onChange={(e) => {
                        field.onChange(e);
                        onSelectedPeriodChange(e.target.value);
                      }}
                    >
                      <option value="">-- Escolha um período --</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                    </select>
                  )}
                />
                <ErrorMessage
                  errors={errors}
                  name="selectedPeriod"
                  render={({ message }) => <p className={`${styles.errorMessage} ${styles[theme]}`}>{message}</p>}
                />
                <button 
                  onClick={handleAddPeriod} 
                  disabled={loading || !!errors.selectedPeriod || !selectedPeriod}
                  className={`${styles.addButton} ${(!selectedPeriod || !!errors.selectedPeriod || loading) ? styles.addButtonDisabled : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${emphasisColor || '#667eea'} 0%, ${emphasisColor || '#764ba2'} 100%)`
                  }}
                >
                  <Plus size={18} />
                  {loading ? 'Adicionando...' : 'Adicionar Período'}
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