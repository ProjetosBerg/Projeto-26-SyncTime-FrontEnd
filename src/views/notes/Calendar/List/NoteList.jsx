import { useState } from 'react';
import { useTheme } from '../../../../hooks/useTheme';
import { useEmphasisColor } from '../../../../hooks/useEmphasisColor';
import { Plus } from 'lucide-react';
import styles from './NoteList.module.css';

const NoteList = ({
  isOpen,
  onClose,
  selectedDate,
  notes,
  selectedRoutine,
  onDeleteNote,
  onOpenCreateNote,
  onEditNote,
  onGenerateSummary,
  onViewSummary,
  targetNoteId, 
}) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const isSummaryRoutine =
    selectedRoutine && selectedRoutine.title === 'Resumo do Dia';
  const [activeTab, setActiveTab] = useState(
    isSummaryRoutine ? 'resumo' : 'todas'
  );

  if (!isOpen) return null;

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = isSummaryRoutine
    ? [{ id: 'resumo', label: 'Resumo' }]
    : [
        { id: 'todas', label: 'Todas' },
        { id: 'emAndamento', label: 'Em Andamento' },
        { id: 'concluido', label: 'Concluído' },
        { id: 'naoRealizado', label: 'Não Realizado' }
      ];

  const tabToStatus = {
    emAndamento: 'Em Andamento',
    concluido: 'Concluído',
    naoRealizado: 'Não Realizado'
  };

  const getFilteredNotes = () => {
    if (isSummaryRoutine) {
      return notes;
    }

    if (activeTab === 'todas') {
      return notes;
    }
    if (activeTab === 'resumo') {
      return notes.filter((note) => note.routineTitle === 'Resumo do Dia');
    }
    const targetStatus = tabToStatus[activeTab];
    if (targetStatus) {
      return notes.filter((note) => note.status === targetStatus);
    }
    return [];
  };

  const filteredNotes = getFilteredNotes();

  const isTargetNote = (noteId) => targetNoteId && noteId === targetNoteId;

  const handleGenerate = async () => {
    if (selectedRoutine && onGenerateSummary) {
      await onGenerateSummary(selectedRoutine.id, selectedDate);
    }
  };

  const hasSummary = isSummaryRoutine && filteredNotes.length > 0 && filteredNotes[0]?.summaryDay;

  const getNoteContent = (note) => {
    if (note.routineTitle === 'Resumo do Dia') {
      return note.summaryDay || note.content || 'Nenhum resumo gerado ainda.';
    }
    return note.content;
  };

  return (
    <div
      className={`${styles.noteListOverlay} ${styles[theme]}`}
      onClick={onClose}
    >
      <div
        className={`${styles.noteListContent} ${styles[theme]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${styles.noteListHeader} ${styles[theme]}`}
          style={{
            background: `linear-gradient(135deg, ${
              emphasisColor || '#667eea'
            } 0%, ${emphasisColor || '#764ba2'} 100%)`
          }}
        >
          <h2 className={`${styles.noteListTitle} ${styles[theme]}`}>
            {isSummaryRoutine ? (
              <>Resumo do dia para {formatDate(selectedDate)}</>
            ) : (
              <>
                Anotações{' '}
                {selectedRoutine &&
                  (['Manhã', 'Tarde', 'Noite'].includes(selectedRoutine.title)
                    ? `da ${selectedRoutine.title.toLowerCase()}`
                    : `do ${selectedRoutine.title.toLowerCase()}`)}{' '}
                para {formatDate(selectedDate)}
              </>
            )}
          </h2>

          <button
            className={`${styles.noteListClose} ${styles[theme]}`}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className={`${styles.tabsContainer} ${styles[theme]}`}>
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabButton} ${
                  activeTab === tab.id ? `${styles.active} active` : ''
                } ${styles[theme]}`}
                onClick={() => setActiveTab(tab.id)}
                style={
                  activeTab === tab.id
                    ? {
                        '--active-border-color': emphasisColor || '#667eea'
                      }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`${styles.notesList} ${styles[theme]}`}>
          {filteredNotes.length === 0 ? (
            <p className={`${styles.noNotes} ${styles[theme]}`}>
              {isSummaryRoutine
                ? 'Nenhum resumo gerado ainda.'
                : 'Nenhuma anotação encontrada para este status.'}
            </p>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`${styles.noteItem} ${styles[theme]} ${isTargetNote(note.id) ? styles.targetNote : ''}`} 
                style={{
                  borderLeftColor: emphasisColor || '#667eea',
                  ...(isTargetNote(note.id) && { 
                    borderLeftWidth: '4px',
                    backgroundColor: `${emphasisColor || '#667eea'}10`
                  })
                }}
              >
                <div className={`${styles.noteHeader} ${styles[theme]}`}>
                  <h3 className={`${styles.noteTitle} ${styles[theme]}`}>
                    {note.title}
                    {note.status && (
                      <span
                        className={`${styles.noteStatus} ${
                          styles[note.status.toLowerCase().replace(/ /g, '')]
                        } ${styles[theme]}`}
                      >
                        {note.status}
                      </span>
                    )}
                  </h3>
                  {!isSummaryRoutine && (
                    <span className={`${styles.noteTime} ${styles[theme]}`}>
                      {note.startTime?.slice(0, 5)} - {note.endTime?.slice(0, 5)}{' '}
                      {note.routineTitle ? `(${note.routineTitle})` : ''}
                    </span>
                  )}
                </div>
                {!isSummaryRoutine && (
                  <p className={`${styles.noteContent} ${styles[theme]}`}>
                    {getNoteContent(note)}
                  </p>
                )}
                {!isSummaryRoutine && (
                  <div className={`${styles.noteActions} ${styles[theme]}`}>
                    <button
                      className={`${styles.editButton} ${styles[theme]}`}
                      onClick={() => onEditNote?.(note)}
                      style={{
                        backgroundColor: emphasisColor || '#667eea'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className={`${styles.deleteButton} ${styles[theme]}`}
                      onClick={() => onDeleteNote(note.id)}
                    >
                      Deletar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className={`${styles.noteListFooter} ${styles[theme]}`}>
          {!isSummaryRoutine ? (
            <button
              className={`${styles.addButton} ${styles[theme]}`}
              onClick={() => onOpenCreateNote?.(selectedRoutine)}
              style={{
                backgroundColor: emphasisColor || '#667eea'
              }}
            >
              + Nova Anotação
            </button>
          ) : !hasSummary ? (
            <button
              className={`${styles.addButton} ${styles[theme]}`}
              onClick={handleGenerate}
              style={{
                backgroundColor: emphasisColor || '#667eea'
              }}
            >
              <Plus size={18} />
              Gerar resumo do dia
            </button>
          ) : (
            <>
              <button
                className={`${styles.addButton} ${styles[theme]}`}
                onClick={() => onViewSummary(filteredNotes[0].summaryDay)}
                style={{
                  backgroundColor: emphasisColor || '#667eea'
                }}
              >
                Ver Resumo
              </button>
              <button
                className={`${styles.addButton} ${styles[theme]}`}
                onClick={handleGenerate}
                style={{
                  backgroundColor: emphasisColor || '#667eea'
                }}
              >
                Gerar novo resumo
              </button>
            </>
          )}
          <button
            className={`${styles.closeButton} ${styles[theme]}`}
            onClick={onClose}
            style={{
              backgroundColor: emphasisColor || '#667eea'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteList;