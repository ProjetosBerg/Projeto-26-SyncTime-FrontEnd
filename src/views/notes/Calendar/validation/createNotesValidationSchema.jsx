import * as yup from 'yup';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const timeInMinutes = (value) => {
  const [hours, minutes] = String(value || '')
    .split(':')
    .map(Number);
  return hours * 60 + minutes;
};

export const createNotesValidationSchema = yup.object().shape({
  status: yup
    .string()
    .required('Status é obrigatório')
    .max(50, 'Status deve ter no máximo 50 caracteres'),
  collaborators: yup
    .array()
    .of(yup.string())
    .max(10, 'Máximo de 10 colaboradores')
    .nullable(),
  priority: yup
    .string()
    .required('Prioridade é obrigatória')
    .max(50, 'Prioridade deve ter no máximo 50 caracteres'),
  category_id: yup.string().nullable().optional(),
  activity: yup
    .string()
    .required('Atividade é obrigatória')
    .max(255, 'Atividade deve ter no máximo 255 caracteres'),
  activityType: yup
    .string()
    .required('Tipo de atividade é obrigatório')
    .max(100, 'Tipo de atividade deve ter no máximo 100 caracteres'),
  description: yup
    .string()
    .required('Descrição é obrigatória')
    .min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  startTime: yup
    .string()
    .required('Hora de início é obrigatória')
    .matches(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Formato de hora inválido (HH:MM)'
    ),
  endTime: yup
    .string()
    .required('Hora de fim é obrigatória')
    .matches(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Formato de hora inválido (HH:MM)'
    )
    .test(
      'end-after-start',
      'A hora final deve ser posterior à hora inicial',
      function (value) {
        if (!value || !this.parent.startTime) return true;
        return timeInMinutes(value) > timeInMinutes(this.parent.startTime);
      }
    ),
  comments: yup
    .array()
    .of(
      yup.object().shape({
        author: yup.string().required(),
        text: yup.string().required(),
        created_at: yup.date().required(),
        updated_at: yup.date().required()
      })
    )
    .max(20, 'Máximo de 20 comentários iniciais')
    .nullable(),
  routine_id: yup
    .string()
    .required('ID da rotina é obrigatório')
    .uuid('ID da rotina deve ser um UUID válido'),
  userId: yup.string().required('ID do Usuário é obrigatório'),
  dateOfNote: yup.string().nullable(),
  reminderMinutesBefore: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue == null ? null : value
    )
    .typeError('Selecione uma antecedência válida para o lembrete')
    .integer('A antecedência do lembrete deve ser um número inteiro')
    .min(0, 'A antecedência do lembrete não pode ser negativa')
    .max(10080, 'O lembrete deve ter no máximo sete dias de antecedência')
    .nullable()
    .test(
      'reminder-requires-schedule',
      'Informe a data e o horário inicial para criar o lembrete',
      function (value) {
        return (
          value == null ||
          Boolean(this.parent.dateOfNote && this.parent.startTime)
        );
      }
    ),
  hasRecurrence: yup.boolean().default(false),
  recurrenceFrequency: yup
    .string()
    .test(
      'recurrence-frequency',
      'Selecione a frequência da recorrência',
      function (value) {
        if (!this.parent.hasRecurrence) return true;
        return ['daily', 'weekly', 'monthly'].includes(value);
      }
    ),
  recurrenceInterval: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' ? undefined : value
    )
    .nullable()
    .test(
      'recurrence-interval',
      'O intervalo deve ser um número entre 1 e 30',
      function (value) {
        if (!this.parent.hasRecurrence) return true;
        return Number.isInteger(value) && value >= 1 && value <= 30;
      }
    ),
  recurrenceEndDate: yup
    .string()
    .test(
      'recurrence-end-date',
      'Informe uma data final igual ou posterior à data inicial',
      function (value) {
        if (!this.parent.hasRecurrence) return true;
        if (!value || !DATE_ONLY_PATTERN.test(value)) return false;
        return !this.parent.dateOfNote || value >= this.parent.dateOfNote;
      }
    )
    .test(
      'recurrence-maximum-period',
      'A recorrência não pode ultrapassar dois anos',
      function (value) {
        const startValue = this.parent.dateOfNote;
        if (
          !this.parent.hasRecurrence ||
          !value ||
          !DATE_ONLY_PATTERN.test(value) ||
          !startValue ||
          !DATE_ONLY_PATTERN.test(startValue)
        ) {
          return true;
        }

        const maximumDate = new Date(`${startValue}T00:00:00`);
        maximumDate.setDate(maximumDate.getDate() + 730);
        return new Date(`${value}T00:00:00`) <= maximumDate;
      }
    ),
  recurrenceWeekDays: yup
    .array()
    .of(yup.number().integer().min(0).max(6))
    .test(
      'recurrence-week-days',
      'Selecione pelo menos um dia da semana',
      function (value) {
        if (
          !this.parent.hasRecurrence ||
          this.parent.recurrenceFrequency !== 'weekly'
        ) {
          return true;
        }
        return Array.isArray(value) && value.length > 0;
      }
    )
});
