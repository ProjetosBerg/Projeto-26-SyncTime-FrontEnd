import * as yup from 'yup';

export const createNotesValidationSchema = yup.object().shape({
  status: yup
    .string()
    .required("Status é obrigatório")
    .max(50, "Status deve ter no máximo 50 caracteres"),
  collaborators: yup
    .array()
    .of(yup.string())
    .max(10, "Máximo de 10 colaboradores")
    .nullable(),
  priority: yup
    .string()
    .required("Prioridade é obrigatória")
    .max(50, "Prioridade deve ter no máximo 50 caracteres"),
  category_id: yup
    .string()
    .nullable()
    .optional(),
  activity: yup
    .string()
    .required("Atividade é obrigatória")
    .max(255, "Atividade deve ter no máximo 255 caracteres"),
  activityType: yup
    .string()
    .required("Tipo de atividade é obrigatório")
    .max(100, "Tipo de atividade deve ter no máximo 100 caracteres"),
  description: yup
    .string()
    .required("Descrição é obrigatória")
    .min(10, "Descrição deve ter no mínimo 10 caracteres"),
  startTime: yup
    .string()
    .required("Hora de início é obrigatória")
    .matches(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Formato de hora inválido (HH:MM)"
    ),
  endTime: yup
    .string()
    .required("Hora de fim é obrigatória")
    .matches(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Formato de hora inválido (HH:MM)"
    ),
  comments: yup
    .array()
    .of(
      yup.object().shape({
        author: yup.string().required(),
        text: yup.string().required(),
        created_at: yup.date().required(),
        updated_at: yup.date().required(),
      })
    )
    .max(20, "Máximo de 20 comentários iniciais")
    .nullable(),
  routine_id: yup
    .string()
    .required("ID da rotina é obrigatório")
    .uuid("ID da rotina deve ser um UUID válido"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
  dateOfNote: yup.string().nullable(),
  hasRecurrence: yup.boolean().default(false),
  recurrenceFrequency: yup.string().test(
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
  recurrenceEndDate: yup.string().test(
    'recurrence-end-date',
    'Informe uma data final igual ou posterior à data inicial',
    function (value) {
      if (!this.parent.hasRecurrence) return true;
      if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      return !this.parent.dateOfNote || value >= this.parent.dateOfNote;
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
