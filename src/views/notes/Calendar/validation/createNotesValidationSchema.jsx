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
});