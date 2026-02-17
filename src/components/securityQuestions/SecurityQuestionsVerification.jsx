import styles from './SecurityQuestionsVerification.module.css';

const SecurityQuestionsVerification = ({ questions, answers, onAnswerChange }) => {
  return (
    <div className={styles.container}>
      <label className={styles.mainLabel}>
        Perguntas de Segurança <span className={styles.required}>*</span>
      </label>
      <p className={styles.description}>
        Responda as perguntas que você cadastrou
      </p>

      {questions.map((question, index) => (
        <div key={question.id} className={styles.questionItem}>
          <div className={styles.questionHeader}>
            <span className={styles.questionNumber}>Pergunta {index + 1}</span>
          </div>

          <div className={styles.questionContent}>
            <div className={styles.questionText}>
              {question.question}
            </div>
            
            <input
              type="text"
              value={answers[index] || ''}
              onChange={(e) => onAnswerChange(index, e.target.value)}
              placeholder="Sua resposta"
              className={styles.answerInput}
              required
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecurityQuestionsVerification;