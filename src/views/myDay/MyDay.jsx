import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Clock3,
  ListTodo,
  Loader2,
  PlayCircle,
  RefreshCw,
  Tag
} from 'lucide-react';
import { useEmphasisColor } from '../../hooks/useEmphasisColor';
import useFlashMessage from '../../hooks/userFlashMessage';
import { useTheme } from '../../hooks/useTheme';
import ServiceMyDay from './services/ServiceMyDay';
import styles from './MyDay.module.css';

const emptySummary = {
  total: 0,
  completed: 0,
  inProgress: 0,
  pending: 0,
  completionPercentage: 0
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatLongDate = (value) => {
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(parseLocalDate(value));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatTime = (value) => value?.slice(0, 5) || '--:--';

const normalizeStatus = (status) =>
  String(status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const getStatusPresentation = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized.includes('concluid')) {
    return { label: status || 'Concluído', className: 'completed', Icon: CheckCircle2 };
  }

  if (normalized.includes('andamento')) {
    return { label: status || 'Em andamento', className: 'inProgress', Icon: PlayCircle };
  }

  return { label: status || 'Pendente', className: 'pending', Icon: CircleDashed };
};

const MyDay = () => {
  const history = useHistory();
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const { setFlashMessage } = useFlashMessage();
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()));
  const [myDay, setMyDay] = useState({ items: [], summary: emptySummary });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isToday = selectedDate === formatLocalDate(new Date());

  const loadMyDay = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ServiceMyDay.getByDate(selectedDate);
      const data = response.data?.data;

      setMyDay({
        items: Array.isArray(data?.items) ? data.items : [],
        summary: { ...emptySummary, ...data?.summary }
      });
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || 'Não foi possível carregar os compromissos deste dia.';
      setError(message);
      setMyDay({ items: [], summary: emptySummary });
      setFlashMessage(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, setFlashMessage]);

  useEffect(() => {
    loadMyDay();
  }, [loadMyDay]);

  const changeDay = (amount) => {
    const date = parseLocalDate(selectedDate);
    date.setDate(date.getDate() + amount);
    setSelectedDate(formatLocalDate(date));
  };

  const summaryCards = useMemo(
    () => [
      { label: 'Total', value: myDay.summary.total, Icon: ListTodo, className: 'total' },
      { label: 'Concluídos', value: myDay.summary.completed, Icon: CheckCircle2, className: 'completed' },
      { label: 'Em andamento', value: myDay.summary.inProgress, Icon: PlayCircle, className: 'inProgress' },
      { label: 'Pendentes', value: myDay.summary.pending, Icon: CircleDashed, className: 'pending' }
    ],
    [myDay.summary]
  );

  return (
    <section
      className={`${styles.page} ${styles[theme]}`}
      style={{ '--emphasis-color': emphasisColor || '#4f46e5' }}
    >
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Planejamento diário</span>
          <h1>Meu Dia</h1>
          <p>{formatLongDate(selectedDate)}</p>
        </div>

        <button className={styles.calendarButton} onClick={() => history.push('/anotacoes')}>
          <CalendarDays size={18} />
          Abrir calendário
        </button>
      </header>

      <div className={styles.dateNavigation}>
        <button onClick={() => changeDay(-1)} aria-label="Dia anterior">
          <ChevronLeft />
        </button>
        <label>
          <span>Data da agenda</span>
          <input
            type="date"
            required
            value={selectedDate}
            onChange={(event) => event.target.value && setSelectedDate(event.target.value)}
          />
        </label>
        <button onClick={() => changeDay(1)} aria-label="Próximo dia">
          <ChevronRight />
        </button>
        {!isToday && (
          <button className={styles.todayButton} onClick={() => setSelectedDate(formatLocalDate(new Date()))}>
            Hoje
          </button>
        )}
      </div>

      <div className={styles.summaryGrid}>
        {summaryCards.map(({ label, value, Icon, className }) => (
          <article key={label} className={`${styles.summaryCard} ${styles[className]}`}>
            <Icon aria-hidden="true" />
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </div>

      <section className={styles.progressCard} aria-label="Progresso do dia">
        <div className={styles.progressHeader}>
          <div>
            <span>Progresso do dia</span>
            <small>{myDay.summary.completed} de {myDay.summary.total} concluídos</small>
          </div>
          <strong>{myDay.summary.completionPercentage}%</strong>
        </div>
        <div className={styles.progressTrack}>
          <span style={{ width: `${myDay.summary.completionPercentage}%` }} />
        </div>
      </section>

      <section className={styles.agendaCard}>
        <div className={styles.agendaHeader}>
          <div>
            <h2>Agenda</h2>
            <p>Seus compromissos em ordem de horário</p>
          </div>
          <button onClick={loadMyDay} disabled={loading} aria-label="Atualizar agenda">
            <RefreshCw className={loading ? styles.spinning : ''} />
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className={styles.feedback} role="status">
            <Loader2 className={styles.spinning} />
            <strong>Carregando seu dia...</strong>
          </div>
        ) : error ? (
          <div className={`${styles.feedback} ${styles.error}`} role="alert">
            <AlertCircle />
            <strong>Não foi possível carregar a agenda</strong>
            <span>{error}</span>
            <button onClick={loadMyDay}>Tentar novamente</button>
          </div>
        ) : myDay.items.length === 0 ? (
          <div className={styles.feedback}>
            <CalendarDays />
            <strong>Nenhum compromisso neste dia</strong>
            <span>Use o calendário para organizar uma nova atividade.</span>
            <button onClick={() => history.push('/anotacoes')}>Abrir calendário</button>
          </div>
        ) : (
          <ol className={styles.timeline}>
            {myDay.items.map((item) => {
              const status = getStatusPresentation(item.status);
              const StatusIcon = status.Icon;

              return (
                <li key={item.id} className={styles.timelineItem}>
                  <div className={styles.timeBlock}>
                    <Clock3 />
                    <strong>{formatTime(item.startTime)}</strong>
                    <span>{formatTime(item.endTime)}</span>
                  </div>

                  <article className={styles.activityCard}>
                    <div className={styles.activityHeader}>
                      <div>
                        <span className={styles.routine}>{item.routine?.type || 'Atividade'}</span>
                        <h3>{item.activity || 'Atividade sem título'}</h3>
                      </div>
                      <span className={`${styles.status} ${styles[status.className]}`}>
                        <StatusIcon />
                        {status.label}
                      </span>
                    </div>

                    {item.description && <p className={styles.description}>{item.description}</p>}

                    <div className={styles.metadata}>
                      {item.category?.name && <span><Tag />{item.category.name}</span>}
                      {item.priority && <span>Prioridade: {item.priority}</span>}
                      {item.routine?.period && <span>{item.routine.period}</span>}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </section>
  );
};

export default MyDay;
