import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Flag, Pencil, Plus, Trash2, X } from 'lucide-react';
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
const emptyForm = () => ({ title: '', description: '', targetCount: 10, startDate: dateValue(), endDate: dateValue(30) });
const labels = { active: 'Em andamento', completed: 'Concluída', expired: 'Encerrada' };
const formatDate = (value) => {
  if (!value) return 'Data não informada';
  const parsed = new Date(value);
  const dateOnly = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)
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

const Goals = () => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const { setFlashMessage } = useFlashMessage();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadGoals = useCallback(async () => {
    try { setLoading(true); const response = await ServiceGoals.list(); setGoals(response.data.data || []); }
    catch (error) { setFlashMessage(error.response?.data?.message || 'Erro ao carregar metas', 'error'); }
    finally { setLoading(false); }
  }, [setFlashMessage]);
  useEffect(() => { loadGoals(); }, [loadGoals]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setShowForm(true); };
  const openEdit = (goal) => {
    setEditingId(goal.id);
    setForm({ title: goal.title, description: goal.description || '', targetCount: goal.targetCount, startDate: goal.startDate, endDate: goal.endDate });
    setShowForm(true);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (form.endDate < form.startDate) return setFlashMessage('A data final deve ser igual ou posterior à inicial', 'error');
    try {
      setSaving(true);
      const payload = { ...form, targetCount: Number(form.targetCount) };
      if (editingId) await ServiceGoals.update(editingId, payload); else await ServiceGoals.create(payload);
      setFlashMessage(editingId ? 'Meta atualizada com sucesso' : 'Meta criada com sucesso', 'success');
      setShowForm(false); await loadGoals();
    } catch (error) { setFlashMessage(error.response?.data?.errors?.[0] || error.response?.data?.message || 'Erro ao salvar meta', 'error'); }
    finally { setSaving(false); }
  };
  const remove = async (goal) => {
    if (!window.confirm(`Excluir a meta “${goal.title}”?`)) return;
    try { await ServiceGoals.delete(goal.id); setFlashMessage('Meta excluída com sucesso', 'success'); await loadGoals(); }
    catch (error) { setFlashMessage(error.response?.data?.message || 'Erro ao excluir meta', 'error'); }
  };

  return <main className={`${styles.page} ${styles[theme]}`}>
    <section className={styles.hero} style={{ background: `linear-gradient(135deg, ${emphasisColor}, #312e81)` }}>
      <div><span>PRODUTIVIDADE</span><h1>Minhas Metas</h1><p>Transforme atividades concluídas em progresso visível.</p></div>
      <button onClick={openCreate}><Plus size={18} /> Nova meta</button>
    </section>
    {loading ? <div className={styles.empty}>Carregando metas...</div> : goals.length === 0 ?
      <div className={styles.empty}><Flag size={42} /><h2>Nenhuma meta criada</h2><p>Crie uma meta e acompanhe automaticamente suas atividades concluídas.</p><button onClick={openCreate}>Criar primeira meta</button></div> :
      <section className={styles.grid}>{goals.map((goal) => <article key={goal.id} className={`${styles.card} ${styles[goal.status]}`}>
        <div className={styles.cardHeader}><div><span className={styles.status}>{labels[goal.status]}</span><h2>{goal.title}</h2></div><div className={styles.actions}><button onClick={() => openEdit(goal)} aria-label="Editar"><Pencil size={17} /></button><button onClick={() => remove(goal)} aria-label="Excluir"><Trash2 size={17} /></button></div></div>
        {goal.description && <p className={styles.description}>{goal.description}</p>}
        <div className={styles.numbers}><strong>{goal.progress} de {goal.targetCount}</strong><span>{goal.percentage}%</span></div>
        <div className={styles.track}><div style={{ width: `${goal.percentage}%`, backgroundColor: goal.status === 'completed' ? '#10b981' : emphasisColor }} /></div>
        <footer><span>{formatDate(goal.startDate)} — {formatDate(goal.endDate)}</span>{goal.status === 'completed' && <CheckCircle2 size={19} />}</footer>
      </article>)}</section>}
    {showForm && <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}><form className={`${styles.modal} ${styles[theme]}`} onSubmit={submit}>
      <header><h2>{editingId ? 'Editar meta' : 'Nova meta'}</h2><button type="button" onClick={() => setShowForm(false)}><X /></button></header>
      <label>Título *<input required minLength="2" maxLength="100" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
      <label>Descrição<textarea maxLength="500" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label>Quantidade de atividades concluídas *<input required type="number" min="1" max="100000" value={form.targetCount} onChange={(e) => setForm({ ...form, targetCount: e.target.value })} /></label>
      <div className={styles.dates}><label>Data inicial *<input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label><label>Data final *<input required type="date" min={form.startDate} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></label></div>
      <div className={styles.modalActions}><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button type="submit" disabled={saving} style={{ backgroundColor: emphasisColor }}>{saving ? 'Salvando...' : 'Salvar meta'}</button></div>
    </form></div>}
  </main>;
};
export default Goals;
