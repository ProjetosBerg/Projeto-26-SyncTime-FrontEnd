// ⚙️ Bibliotecas externas
import { Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';

// 💅 Estilos
import styles from './SecurityQuestions.module.css';

// 🧩 Componentes
import Input from '../input/Input';
import SingleSelect from '../select/SingleSelect';

// 🧰 Utilitários
import { SECURITY_QUESTIONS } from '../../utils/securityQuestions';



const SecurityQuestions = ({ control, errors, value, onChange }) => {
  const getAvailableQuestions = (currentIndex, questions) => {
    const selectedValues = questions
      .map((q, i) => i !== currentIndex && q.question?.value)
      .filter(Boolean);
    return SECURITY_QUESTIONS.filter((q) => !selectedValues.includes(q.value));
  };

  const handleAddQuestion = () => {
    if (value.length < 3) {
      const newQuestions = [...value, { question: null, answer: '' }];
      onChange(newQuestions);
    }
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = value.filter((_, i) => i !== index);
    onChange(newQuestions);
  };

  return (
    <div className={styles.container}>
      <label className={styles.mainLabel}>
        Perguntas de Segurança <span className={styles.required}>*</span>
      </label>
      <p className={styles.description}>
        Adicione de 1 a 3 perguntas de segurança para recuperação de conta
      </p>

      {Array.isArray(value) &&
        value.map((item, index) => (
          <div key={index} className={styles.questionItem}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNumber}>Pergunta {index + 1}</span>
              {value.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  className={styles.removeButton}
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.questionContent}>
              <div className={styles.selectWrapper}>
                <Controller
                  name={`securityQuestions[${index}].question`}
                  control={control}
                  rules={{ required: 'Selecione uma pergunta' }}
                  render={({ field }) => (
                    <SingleSelect
                      options={getAvailableQuestions(index, value)}
                      value={field.value}
                      onChange={(selected) => field.onChange(selected)}
                      placeholder="Selecione uma pergunta"
                      required
                    />
                  )}
                />
                <ErrorMessage
                  errors={errors}
                  name={`securityQuestions[${index}].question`}
                  render={({ message }) => (
                    <span className={styles.errorMessage}>{message}</span>
                  )}
                />
              </div>

              <div className={styles.inputWrapper}>
                <Controller
                  name={`securityQuestions[${index}].answer`}
                  control={control}
                  rules={{ required: 'Resposta é obrigatória' }}
                  render={({ field }) => (
                    <Input
                      type="text"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Sua resposta"
                      className={`${styles.answerInput} ${
                        errors.securityQuestions?.[index]?.answer ? styles.errorInput : ''
                      }`}
                      required
                    />
                  )}
                />
                <ErrorMessage
                  errors={errors}
                  name={`securityQuestions[${index}].answer`}
                  render={({ message }) => (
                    <span className={styles.errorMessage}>{message}</span>
                  )}
                />
              </div>
            </div>
          </div>
        ))}

      {value.length < 3 && (
        <button
          type="button"
          onClick={handleAddQuestion}
          className={styles.addButton}
        >
          <span className={styles.addIcon}>+</span>
          Adicionar mais uma pergunta
        </button>
      )}
    </div>
  );
};

export default SecurityQuestions;