import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  CheckCircle2,
  CircleAlert,
  Flag,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useEmphasisColor } from '../../hooks/useEmphasisColor';
import useFlashMessage from '../../hooks/userFlashMessage';
import ServiceGoals from './services/ServiceGoals';
import styles from './Goals.module.css';

const dateValue = (days = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const emptyForm = () => ({
  title: '',
  description: '',
  targetCount: 10,
  startDate: dateValue(),
  endDate: dateValue(30)
});

const labels = {
  active: 'Em andamento',
  completed: 'Concluída',
  expired: 'Encerrada'
};

const formatDate = (value) => {
  if (!value) return 'Data não informada';
  const parsed = new Date(value);
  const dateOnly =
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)
      ? value.slice(0, 10)
      : Number.isNaN(parsed.getTime())
        ? ''
        : parsed.toISOString().slice(0, 10);

  if (!dateOnly) return 'Data inválida';
  const date = new Date(`${dateOnly}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? 'Data inválida'
    : date.toLocaleDateString('pt-BR');
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.errors?.[0] ||
  error.response?.data?.message ||
  fallback;

const Goals = () => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const { setFlashMessage } = useFlashMessage();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { handleSubmit, register, reset, watch } = useForm({
    defaultValues: emptyForm()
  });
  const startDate = watch('startDate');

  const {
    data: goals = [],
    error: goalsRequestError,
    isPending: loading,
    refetch
  } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await ServiceGoals.list();
      return response.data?.data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? ServiceGoals.update(id, payload) : ServiceGoals.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ServiceGoals.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] })
  });

  const loadError = goalsRequestError
    ? getErrorMessage(goalsRequestError, 'Erro ao carregar metas')
    : '';
  const saving = saveMutation.isPending;
  const deletingId = deleteMutation.isPending ? deleteMutation.variables : null;

  useEffect(() => {
    if (!showForm) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) setShowForm(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saving, showForm]);

  const openCreate = () => {
    setEditingId(null);
    reset(emptyForm());
    setShowForm(true);
  };

  const openEdit = (goal) => {
    setEditingId(goal.id);
    reset({
      title: goal.title || '',
      description: goal.description || '',
      targetCount: goal.targetCount || 1,
      startDate: String(goal.startDate || '').slice(0, 10),
      endDate: String(goal.endDate || '').slice(0, 10)
    });
    setShowForm(true);
  };

  const submit = async (formData) => {
    if (formData.endDate < formData.startDate) {
      setFlashMessage(
        'A data final deve ser igual ou posterior à inicial',
        'error'
      );
      return;
    }

    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        targetCount: Number(formData.targetCount)
      };

      await saveMutation.mutateAsync({ id: editingId, payload });

      setFlashMessage(
        editingId ? 'Meta atualizada com sucesso' : 'Meta criada com sucesso',
        'success'
      );
      setShowForm(false);
    } catch (error) {
      setFlashMessage(getErrorMessage(error, 'Erro ao salvar meta'), 'error');
    }
  };

  const remove = async (goal) => {
    if (!window.confirm(`Excluir a meta “${goal.title}”?`)) return;

    try {
      await deleteMutation.mutateAsync(goal.id);
      setFlashMessage('Meta excluída com sucesso', 'success');
    } catch (error) {
      setFlashMessage(getErrorMessage(error, 'Erro ao excluir meta'), 'error');
    }
  };

  return (
    <main className={`${styles.page} ${styles[theme]}`}>
      <section
        className={styles.hero}
        style={{
          background: `linear-gradient(135deg, ${emphasisColor}, #312e81)`
        }}
      >
        <div>
          <span>PRODUTIVIDADE</span>
          <h1>Minhas Metas</h1>
          <p>Transforme atividades concluídas em progresso visível.</p>
        </div>
        <button type="button" onClick={openCreate}>
          <Plus size={18} /> Nova meta
        </button>
      </section>

      {loading ? (
        <section className={styles.state} aria-live="polite" aria-busy="true">
          <LoaderCircle className={styles.spinner} size={38} />
          <h2>Carregando metas</h2>
          <p>Aguarde enquanto buscamos seu progresso.</p>
        </section>
      ) : loadError ? (
        <section className={styles.state} role="alert">
          <CircleAlert size={42} />
          <h2>Não foi possível carregar suas metas</h2>
          <p>{loadError}</p>
          <button type="button" onClick={() => refetch()}>
            <RefreshCw size={17} /> Tentar novamente
          </button>
        </section>
      ) : goals.length === 0 ? (
        <section className={styles.state}>
          <Flag size={42} />
          <h2>Nenhuma meta criada</h2>
          <p>
            Crie uma meta e acompanhe automaticamente suas atividades
            concluídas.
          </p>
          <button type="button" onClick={openCreate}>
            Criar primeira meta
          </button>
        </section>
      ) : (
        <section className={styles.grid} aria-label="Lista de metas">
          {goals.map((goal) => {
            const percentage = Math.min(
              100,
              Math.max(0, Number(goal.percentage) || 0)
            );

            return (
              <article
                key={goal.id}
                className={`${styles.card} ${styles[goal.status] || ''}`}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.status}>
                      {labels[goal.status] || labels.active}
                    </span>
                    <h2>{goal.title}</h2>
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={() => openEdit(goal)}
                      aria-label={`Editar meta ${goal.title}`}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(goal)}
                      disabled={deletingId === goal.id}
                      aria-label={`Excluir meta ${goal.title}`}
                    >
                      {deletingId === goal.id ? (
                        <LoaderCircle className={styles.spinner} size={17} />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>
                {goal.description && (
                  <p className={styles.description}>{goal.description}</p>
                )}
                <div className={styles.numbers}>
                  <strong>
                    {goal.progress} de {goal.targetCount}
                  </strong>
                  <span>{percentage}%</span>
                </div>
                <div
                  className={styles.track}
                  role="progressbar"
                  aria-label={`Progresso da meta ${goal.title}`}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={percentage}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      backgroundColor:
                        goal.status === 'completed' ? '#10b981' : emphasisColor
                    }}
                  />
                </div>
                <footer>
                  <span>
                    {formatDate(goal.startDate)} — {formatDate(goal.endDate)}
                  </span>
                  {goal.status === 'completed' && <CheckCircle2 size={19} />}
                </footer>
              </article>
            );
          })}
        </section>
      )}

      {showForm && (
        <div
          className={styles.overlay}
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            !saving &&
            setShowForm(false)
          }
        >
          <form
            className={`${styles.modal} ${styles[theme]}`}
            onSubmit={handleSubmit(submit)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-form-title"
          >
            <header>
              <h2 id="goal-form-title">
                {editingId ? 'Editar meta' : 'Nova meta'}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Fechar formulário"
              >
                <X />
              </button>
            </header>
            <label>
              Título *
              <input
                required
                autoFocus
                minLength="2"
                maxLength="100"
                {...register('title', { required: true })}
              />
            </label>
            <label>
              Descrição
              <textarea maxLength="500" {...register('description')} />
            </label>
            <label>
              Quantidade de atividades concluídas *
              <input
                required
                type="number"
                min="1"
                max="100000"
                {...register('targetCount', {
                  required: true,
                  valueAsNumber: true
                })}
              />
            </label>
            <div className={styles.dates}>
              <label>
                Data inicial *
                <input
                  required
                  type="date"
                  {...register('startDate', { required: true })}
                />
              </label>
              <label>
                Data final *
                <input
                  required
                  type="date"
                  min={startDate}
                  {...register('endDate', { required: true })}
                />
              </label>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{ backgroundColor: emphasisColor }}
              >
                {saving ? 'Salvando...' : 'Salvar meta'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default Goals;
