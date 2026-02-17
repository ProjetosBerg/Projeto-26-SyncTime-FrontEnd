import { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Calendar.module.css';
import NoteList from './List/NoteList';
import { useTheme } from './../../../hooks/useTheme';
import { useEmphasisColor } from './../../../hooks/useEmphasisColor';
import CreateRoutine from './Modal/CreateRoutine';
import useFlashMessage from '../../../hooks/userFlashMessage';
import ServiceRoutines from './services/ServiceRoutines';
import CreateModalNote from './Form/CreateModalNote';
import ServiceNotes from './services/ServiceNotes';
import SummaryModal from './Modal/SummaryModal';

const Calendar = () => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const { setFlashMessage } = useFlashMessage();
  const history = useHistory();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [notes, setNotes] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showNoteList, setShowNoteList] = useState(false);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [noteType, setNoteType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [holidays, setHolidays] = useState({});
  const [openNoteListFromNotification, setOpenNoteListFromNotification] =
    useState(false); 
  const [targetRoutineId, setTargetRoutineId] = useState(null); 
  const [targetNoteId, setTargetNoteId] = useState(null); 
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthPickerRef = useRef(null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const yearPickerRef = useRef(null);

  const API_KEY = import.meta.env.VITE_KEY_API_HOLIDAY || '';

  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ];

  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const sortNotes = (notesArray) => {
    const order = {
      Manhã: 0,
      Tarde: 1,
      Noite: 2,
      'Resumo do Dia': 3
    };
    return [...notesArray].sort((a, b) => {
      const aOrder = order[a.title] ?? 99;
      const bOrder = order[b.title] ?? 99;
      return aOrder - bOrder;
    });
  };

  const getFallbackHolidays = (year) => {
    if (year !== 2025) return {};
    return {
      '2025-01-01': 'Confraternização Universal',
      '2025-03-03': 'Carnaval',
      '2025-03-04': 'Carnaval',
      '2025-04-18': 'Paixão de Cristo',
      '2025-04-21': 'Tiradentes',
      '2025-05-01': 'Dia do Trabalho',
      '2025-06-19': 'Corpus Christi',
      '2025-09-07': 'Independência do Brasil',
      '2025-10-12': 'Nossa Sra. Aparecida',
      '2025-11-02': 'Finados',
      '2025-11-15': 'Proclamação da República',
      '2025-11-20': 'Consciência Negra',
      '2025-12-25': 'Natal'
    };
  };

  useEffect(() => {
    const year = currentDate.getFullYear();
    if (holidays[year]) return;

    const fetchHolidays = async () => {
      if (!API_KEY) {
        setHolidays((prev) => ({ ...prev, [year]: getFallbackHolidays(year) }));
        return;
      }

      try {
        const res = await fetch(
          `https://holidays.abstractapi.com/v1/?api_key=${API_KEY}&country=BR&year=${year}`
        );
        if (!res.ok) throw new Error('API error');
        const data = await res.json();

        const yearHolidays = {};
        data.forEach((holiday) => {
          if (holiday.type === 'National Holiday') {
            const [month, day, yr] = holiday.date.split('/');
            const dateKey = `${yr}-${month.padStart(2, '0')}-${day.padStart(
              2,
              '0'
            )}`;
            yearHolidays[dateKey] = holiday.name;
          }
        });

        setHolidays((prev) => ({ ...prev, [year]: yearHolidays }));
      } catch (error) {
        console.error('Erro ao buscar feriados:', error);
        setHolidays((prev) => ({ ...prev, [year]: getFallbackHolidays(year) }));
      }
    };

    fetchHolidays();
  }, [currentDate.getFullYear(), API_KEY]);

  useEffect(() => {
    let searchString = location.state?.search;
    if (!searchString && location.state?.search) {
      searchString = location.state.search;
    }
    const queryParams = new URLSearchParams(searchString);
    const shouldOpen = queryParams.get('openNoteList') === 'true';
    const dateParam = queryParams.get('date');
    const routineIdParam = queryParams.get('routineId');
    const noteIdParam = queryParams.get('noteId');

    if (shouldOpen && dateParam && routineIdParam) {
      try {
        const targetDate = new Date(dateParam + 'T12:00:00');
        setCurrentDate(targetDate);
        setSelectedDate(targetDate);
        setTargetRoutineId(routineIdParam);
        setTargetNoteId(noteIdParam);
        setOpenNoteListFromNotification(true);

        if (location.state?.search) {
          history.replace(location.pathname);
        } else {
          history.replace('/anotacoes');
        }
      } catch (error) {
        console.error('Erro ao processar params de notificação:', error);
        setFlashMessage('Erro ao abrir anotação da notificação', 'error');
        if (location.state?.search) {
          history.replace(location.pathname);
        } else {
          history.replace('/anotacoes');
        }
      }
    }
  }, [location.search, location.state]);

  useEffect(() => {
    if (
      openNoteListFromNotification &&
      notes &&
      Object.keys(notes).length > 0
    ) {
      let targetRoutine = null;
      let targetDateKey = null;

      for (const dateKey in notes) {
        const dateRoutines = notes[dateKey] || [];
        targetRoutine = dateRoutines.find((r) => r.id === targetRoutineId);
        if (targetRoutine) {
          targetDateKey = dateKey;
          break;
        }
      }

      if (targetRoutine && targetDateKey) {
        const targetDateObj = new Date(targetDateKey + 'T12:00:00');
        setSelectedDate(targetDateObj);

        setSelectedRoutine(targetRoutine);
        setShowNoteList(true);

        setTimeout(() => {
          setFlashMessage('Anotação aberta via notificação', 'success');
        }, 0);

        setOpenNoteListFromNotification(false);
      } else {
        setFlashMessage('Rotina não encontrada', 'error');
        setOpenNoteListFromNotification(false);
      }
    }
  }, [notes, openNoteListFromNotification, targetRoutineId]);

  const loadRoutines = useCallback(async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await ServiceRoutines.getByAllRoutines(year, month);
      if (response.data.status === 'OK') {
        const routinesData = response.data.data || [];
        const grouped = {};
        routinesData.forEach((routine) => {
          const routineDate = new Date(routine.created_at)
            .toISOString()
            .split('T')[0];
          const title =
            routine.type === 'periodo'
              ? routine.period
              : routine.type === 'resumo'
              ? 'Resumo do Dia'
              : routine.type;
          const processedRoutine = {
            id: routine.id,
            title,
            content: '',
            time: new Date(routine.created_at).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            notes: routine.notes || []
          };
          if (!grouped[routineDate]) {
            grouped[routineDate] = [];
          }
          grouped[routineDate].push(processedRoutine);
        });
        Object.keys(grouped).forEach((dateKey) => {
          grouped[dateKey] = sortNotes(grouped[dateKey]);
        });
        setNotes(grouped);
      }
    } catch (error) {
      console.error('Erro ao buscar rotinas:', error);
      setFlashMessage('Erro ao carregar rotinas', 'error');
    }
  }, [currentDate]);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
        setShowMonthPicker(false);
      }
      if (yearPickerRef.current && !yearPickerRef.current.contains(event.target)) {
        setShowYearPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGenerateSummary = useCallback(async (routineId, date) => {
    try {
      const data = { routine_id: routineId, date: formatDateKey(date) };
      const response = await ServiceNotes.generateSummary(data);
      if (response.data.status === 'OK') {
        const summaryText = response.data.data || '';
        setSummaryContent(summaryText);
        setShowSummaryModal(true);
        loadRoutines();
        setFlashMessage('Resumo gerado com sucesso', 'success');
      }
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      const errorMsg =
        error.response?.data?.errors?.[0] || 'Erro ao gerar resumo';
      setFlashMessage(errorMsg, 'error');
    }
  }, []);

  const handleViewSummary = useCallback((content) => {
    setSummaryContent(content);
    setShowSummaryModal(true);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const previousYear = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear() - 1, currentDate.getMonth())
    );
  };

  const nextYear = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear() + 1, currentDate.getMonth())
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateKey = (dateInput) => {
    let date;

    if (typeof dateInput === 'string') {
      const [year, month, day] = dateInput.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else if (dateInput instanceof Date) {
      date = new Date(dateInput);
    } else {
      console.error('Invalid date input for formatDateKey:', dateInput);
      return new Date().toISOString().split('T')[0];
    }

    if (isNaN(date.getTime())) {
      console.error('Invalid Date object created:', dateInput);
      return new Date().toISOString().split('T')[0];
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (day) => {
    if (day) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      setSelectedDate(date);
      setNoteType('');
      setSelectedPeriod('');
      setShowModal(true);
    }
  };

  const handleOpenNoteList = (day, routine = null) => {
    if (day) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      setSelectedDate(date);
      setSelectedRoutine(routine);
      setShowNoteList(true);
    }
  };

  const handleOpenRoutineInModal = useCallback(
    (routine) => {
      if (selectedDate && routine) {
        setSelectedRoutine(routine);
        setShowNoteList(true);
        setShowModal(false);
      }
    },
    [selectedDate]
  );

  const handleOpenCreateNote = useCallback(
    (routine = selectedRoutine) => {
      setSelectedRoutine(routine);
      setNoteToEdit(null);
      setShowCreateNoteModal(true);
    },
    [selectedRoutine]
  );

  const handleEditNote = useCallback(async (note) => {
    if (note) {
      const response = await ServiceNotes.getByIdNotes(note.id);
      if (response.data.status === 'OK') {
        const noteData = response.data.data;
        setNoteToEdit(noteData);
      }
    }
    setShowCreateNoteModal(true);
  }, []);

  const deleteNote = async (noteId) => {
    try {
      await ServiceNotes.deleteNotes(noteId);
      setFlashMessage('Anotação deletada com sucesso', 'success');
      loadRoutines();
    } catch (error) {
      console.error('Erro ao deletar rotina:', error);
      const errorMsg =
        error.response?.data?.errors?.[0] || 'Erro ao deletar rotina';
      setFlashMessage(errorMsg, 'error');
    }
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getNotesForDay = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dateKey = formatDateKey(date);
    return sortNotes(notes[dateKey] || []);
  };

  const getHolidayForDay = (day) => {
    if (!day) return null;
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dateKey = formatDateKey(date);
    const year = currentDate.getFullYear();
    const yearHolidays = holidays[year] || {};
    return yearHolidays[dateKey] || null;
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateRoutines = selectedDate
    ? notes[formatDateKey(selectedDate)] || []
    : [];
  const selectedDateNotesForCreate = selectedDateRoutines;
  const selectedDateNotesForList = selectedDate
    ? selectedDateRoutines.flatMap((routine) =>
        routine.notes.map((note) => ({
          id: note.id,
          title: note.activity || 'Atividade sem título',
          content: note.description || '',
          time: note.startTime ? note.startTime.slice(0, 5) : '',
          status: note.status || 'Pendente',
          routineTitle: routine.title,
          priority: note.priority,
          startTime: note.startTime,
          endTime: note.endTime,
          collaborators: note.collaborators,
          comments: note.comments,
          summaryDay: note.summaryDay,
          ...note
        }))
      )
    : [];
  const currentSelectedRoutine =
    selectedDate && selectedRoutine
      ? selectedDateRoutines.find((r) => r.id === selectedRoutine.id) ||
        selectedRoutine
      : selectedRoutine;
  const listNotes = currentSelectedRoutine
    ? currentSelectedRoutine.notes.map((note) => ({
        id: note.id,
        title: note.activity || 'Atividade sem título',
        content: note.description || '',
        time: note.startTime ? note.startTime.slice(0, 5) : '',
        status: note.status || 'Pendente',
        routineTitle: currentSelectedRoutine.title,
        priority: note.priority,
        startTime: note.startTime,
        endTime: note.endTime,
        collaborators: note.collaborators,
        comments: note.comments,
        summaryDay: note.summaryDay,
        ...note
      }))
    : selectedDateNotesForList;
  const formattedSelectedDate = selectedDate ? formatDateKey(selectedDate) : '';
  const refreshNotesForDate = loadRoutines;

  const closeNoteList = () => {
    setShowNoteList(false);
    setSelectedRoutine(null);
    setTargetRoutineId(null);
    setTargetNoteId(null);
  };

  return (
    <div className={`${styles.container} ${styles[theme]}`}>
      <div className={`${styles.calendarWrapper} ${styles[theme]}`}>
        <div
          className={`${styles.header} ${styles[theme]}`}
          style={{
            background: `linear-gradient(135deg, ${
              emphasisColor || '#667eea'
            } 0%, ${emphasisColor || '#764ba2'} 100%)`
          }}
        >
          <div className={styles.headerContent}>
            <button
              onClick={previousMonth}
              className={`${styles.navButton} ${styles[theme]}`}
            >
              <ChevronLeft size={24} />
            </button>

            <div className={styles.headerTitle}>
              <div className={styles.monthYearWrapper}>
                <h1 className={styles.monthYear}>
                  <span
                    className={styles.monthClickable}
                    onClick={() => setShowMonthPicker(!showMonthPicker)}
                  >
                    {months[currentDate.getMonth()]}
                  </span>{' '}
                  <span
                    className={styles.yearClickable}
                    onClick={() => setShowYearPicker(!showYearPicker)}
                  >
                    {currentDate.getFullYear()}
                  </span>
                </h1>
                {showMonthPicker && (
                  <div ref={monthPickerRef} className={`${styles.monthPicker} ${styles[theme]}`}>
                    {months.map((month, index) => (
                      <div
                        key={month}
                        className={`${styles.monthOption} ${index === currentDate.getMonth() ? styles.monthSelected : ''}`}
                        onClick={() => {
                          setCurrentDate(new Date(currentDate.getFullYear(), index, 1));
                          setShowMonthPicker(false);
                        }}
                      >
                        {month}
                      </div>
                    ))}
                  </div>
                )}
                {showYearPicker && (
                  <div ref={yearPickerRef} className={`${styles.yearPicker} ${styles[theme]}`}>
                    {years.map((year) => (
                      <div
                        key={year}
                        className={`${styles.yearOption} ${year === currentDate.getFullYear() ? styles.yearSelected : ''}`}
                        onClick={() => {
                          setCurrentDate(new Date(year, currentDate.getMonth(), 1));
                          setShowYearPicker(false);
                        }}
                      >
                        {year}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.subtitle}>
                <span>📅 Suas anotações diárias</span>
              </div>
              <div className={styles.yearNav}>
                <button
                  onClick={previousYear}
                  className={`${styles.yearNavButton} ${styles[theme]}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className={styles.yearLabel}>
                  {currentDate.getFullYear()}
                </span>
                <button
                  onClick={nextYear}
                  className={`${styles.yearNavButton} ${styles[theme]}`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={nextMonth}
              className={`${styles.navButton} ${styles[theme]}`}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className={styles.todayButtonWrapper}>
            <button
              onClick={goToToday}
              className={`${styles.todayButton} ${styles[theme]}`}
              style={{
                color: '#fff'
              }}
            >
              Hoje
            </button>
          </div>
        </div>

        <div className={`${styles.weekDays} ${styles[theme]}`}>
          {weekDays.map((day) => (
            <div key={day} className={styles.weekDay}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.daysGrid}>
          {days.map((item, index) => {
            const dayRoutines = item.isCurrentMonth
              ? getNotesForDay(item.day)
              : [];
            const totalNotesCount = dayRoutines.reduce(
              (acc, rut) => acc + (rut.notes?.length || 0),
              0
            );
            const hasRoutines = dayRoutines.length > 0;
            const holidayName = item.isCurrentMonth
              ? getHolidayForDay(item.day)
              : null;
            const isHoliday = !!holidayName;
            const isTodayDay = isToday(item.day);

            return (
              <div
                key={index}
                onClick={() => item.isCurrentMonth && handleDateClick(item.day)}
                className={`${styles.dayCell} ${styles[theme]} ${
                  !item.isCurrentMonth ? styles.dayCellInactive : ''
                } ${isTodayDay ? styles.dayCellToday : ''} ${
                  isHoliday ? styles.dayCellHoliday : ''
                } ${isTodayDay && isHoliday ? styles.dayCellTodayHoliday : ''}`}
                style={
                  isTodayDay && !isHoliday
                    ? {
                        background: `linear-gradient(135deg, ${
                          emphasisColor || '#667eea'
                        } 0%, ${emphasisColor || '#764ba2'} 100%)`,
                        borderColor: emphasisColor || '#667eea'
                      }
                    : {}
                }
              >
                <div className={styles.dayNumber}>{item.day}</div>

                {holidayName && item.isCurrentMonth && (
                  <div
                    className={`${styles.holidayName} ${styles[theme]}`}
                    title={holidayName}
                  >
                    {holidayName.length > 15
                      ? `${holidayName.substring(0, 12)}...`
                      : holidayName}
                  </div>
                )}
                {item.isCurrentMonth && hasRoutines && (
                  <>
                    <div className={styles.notesPreview} title="Ver rotinas">
                      {dayRoutines.slice(0, 4).map((routine) => (
                        <div
                          key={routine.id}
                          className={styles.notePreviewItem}
                          style={
                            !isTodayDay && !isHoliday
                              ? {
                                  background: `${emphasisColor || '#667eea'}26`,
                                  color: emphasisColor || '#4f46e5',
                                  borderLeftColor: emphasisColor || '#667eea'
                                }
                              : {}
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenNoteList(item.day, routine);
                          }}
                        >
                          {routine.title}
                        </div>
                      ))}
                      {dayRoutines.length > 4 && (
                        <div
                          className={`${styles.notePreviewMore} ${styles[theme]}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenNoteList(item.day);
                          }}
                          title="Ver todas as rotinas"
                        >
                          +{dayRoutines.length - 4}
                        </div>
                      )}
                    </div>

                    <div
                      className={`${styles.notesIndicator} ${styles[theme]}`}
                      title={
                        totalNotesCount > 0
                          ? `${totalNotesCount} anotação(ões)`
                          : 'Rotinas sem anotações'
                      }
                      onClick={() => handleOpenNoteList(item.day)}
                      style={
                        isTodayDay && !isHoliday
                          ? {
                              borderColor: emphasisColor || '#667eea'
                            }
                          : {}
                      }
                    ></div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <CreateRoutine
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedDate={selectedDate}
        noteType={noteType}
        onNoteTypeChange={setNoteType}
        selectedPeriod={selectedPeriod}
        onSelectedPeriodChange={setSelectedPeriod}
        formattedDate={formattedSelectedDate}
        selectedDateNotes={selectedDateNotesForCreate}
        onRefresh={refreshNotesForDate}
        onOpenNoteList={handleOpenRoutineInModal}
      />

      <NoteList
        isOpen={showNoteList}
        onClose={closeNoteList}
        selectedDate={selectedDate}
        notes={listNotes}
        selectedRoutine={currentSelectedRoutine}
        onDeleteNote={deleteNote}
        onOpenCreateNote={handleOpenCreateNote}
        onEditNote={handleEditNote}
        onGenerateSummary={handleGenerateSummary}
        onViewSummary={handleViewSummary}
        targetNoteId={targetNoteId}
      />

      <CreateModalNote
        isOpen={showCreateNoteModal}
        onClose={() => setShowCreateNoteModal(false)}
        selectedRoutine={currentSelectedRoutine}
        noteToEdit={noteToEdit}
        onRefresh={loadRoutines}
        dateOfNote={selectedDate}
      />

      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        content={summaryContent}
      />
    </div>
  );
};

export default Calendar;