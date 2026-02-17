// ⚙️ React e bibliotecas externas
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';

// 💅 Estilos
import styles from './ForgotPassword.module.css';

// 🧩 Componentes
import Button from '../../components/button/Button';
import SecurityQuestionsVerification from '../../components/securityQuestions/SecurityQuestionsVerification';

// 🖼️ Assets
import Logo from '../../assets/Logo.svg';

// 🔐 Serviços
import ServiceAUTH from '../../services/ServiceAUTH';

// 🌐 Contexto
import { Context } from '../../context/UserContext';

// 🧠 Hooks customizados
import useFlashMessage from '../../hooks/userFlashMessage';

// 🧰 Utilitários
import errorFormMessage from '../../utils/errorFormMessage';
import { SECURITY_QUESTIONS } from '../../utils/securityQuestions';


const ForgotPassword = () => {
  const { forgotPassword } = useContext(Context);
  const [step, setStep] = useState(1);
  const [userQuestions, setUserQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState('');
  const { setFlashMessage } = useFlashMessage();

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setValue
  } = useForm({
    defaultValues: {
      login: '',
      newPassword: '',
      confirmPassword: '',
      securityAnswers: []
    }
  });

  

  const handleFetchQuestions = async (data) => {
    setLoading(true);
    setLogin(data.login);
    try {
      const response = await ServiceAUTH.getFindQuestionByUser(data.login);

      const apiQuestions = response.data.data.securityQuestions;

      const transformedQuestions = apiQuestions.map((q) => {
        const fullQuestion = SECURITY_QUESTIONS.find(
          (sq) => sq.value === q.question
        );
        return {
          id: q.question,
          value: q.question,
          question: fullQuestion?.label || q.question
        };
      });

      setUserQuestions(transformedQuestions);
      setAnswers({});

      const initialAnswers = new Array(transformedQuestions?.length).fill('');
      setValue('securityAnswers', initialAnswers);

      reset({
        newPassword: '',
        confirmPassword: '',
        securityAnswers: initialAnswers
      });

      setStep(2);
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.[0] ||
        'Usuário não encontrado. Verifique o login e tente novamente.';
      setFlashMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const onsubmit = async (data) => {
    const payload = {
      login: login,
      securityQuestions: data.securityAnswers.map((answer, index) => ({
        question: userQuestions[index].id,
        answer: answer
      })),
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmPassword
    };

    forgotPassword(payload);
  };

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.decorativeCircle1}></div>
          <div className={styles.decorativeCircle2}></div>

          <h1 className={styles.title}>Recuperar Senha</h1>

          <div className={styles.logoWrapper}>
            <img src={Logo} alt="SyncTime Logo" className={styles.logo} />
          </div>

          <p className={styles.description}>
            {step === 1
              ? 'Digite seu login para recuperar sua conta.'
              : 'Responda as perguntas de segurança e crie uma nova senha.'}
          </p>

          <div className={styles.dots}>
            <div
              className={`${styles.dot} ${step === 1 ? styles.dotActive : ''}`}
            ></div>
            <div
              className={`${styles.dot} ${step === 2 ? styles.dotActive : ''}`}
            ></div>
          </div>
        </div>

        <div className={styles.rightSection}>
          {step === 1 && (
            <>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Encontrar sua Conta</h2>
                <p className={styles.formSubtitle}>
                  Digite seu nome de usuário
                </p>
              </div>

              <form
                onSubmit={handleSubmit(handleFetchQuestions)}
                className={styles.form}
              >
                <div className={styles.inputGroup}>
                  <label htmlFor="login" className={styles.label}>
                    Nome de Usuário
                  </label>
                  <Controller
                    name="login"
                    control={control}
                    rules={{ required: 'Nome de usuário é obrigatório' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        id="login"
                        className={`${styles.input} ${
                          errors.login ? styles.errorInput : ''
                        }`}
                        placeholder="Digite seu nome de usuário"
                        disabled={loading}
                      />
                    )}
                  />
                  <ErrorMessage
                    errors={errors}
                    name="login"
                    render={({ message }) => errorFormMessage(message)}
                  />
                </div>

                <Button
                  label={loading ? 'Buscando...' : 'Continuar'}
                  variant="animated"
                  type="submit"
                  disabled={loading}
                  className={styles.submitButton}
                />
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Verificação de Segurança</h2>
                <p className={styles.formSubtitle}>
                  Responda as perguntas e crie uma nova senha
                </p>
              </div>

              <form onSubmit={handleSubmit(onsubmit)} className={styles.form}>
                <Controller
                  name="securityAnswers"
                  control={control}
                  rules={{
                    validate: (value) =>
                      value.every((answer) => answer?.trim()) ||
                      'Por favor, responda todas as perguntas de segurança!'
                  }}
                  render={({ field }) => (
                    <SecurityQuestionsVerification
                      questions={userQuestions}
                      answers={answers}
                      onAnswerChange={(index, value) => {
                        handleAnswerChange(index, value);
                        const newAnswers = [...field.value];
                        newAnswers[index] = value;
                        field.onChange(newAnswers);
                      }}
                    />
                  )}
                />
                <ErrorMessage
                  errors={errors}
                  name="securityAnswers"
                  render={({ message }) => errorFormMessage(message)}
                />

                <div className={styles.passwordSection}>
                  <h3 className={styles.sectionTitle}>Nova Senha</h3>

                  <div className={styles.inputGroup}>
                    <label htmlFor="newPassword" className={styles.label}>
                      Nova Senha
                    </label>
                    <div className={styles.passwordWrapper}>
                      <Controller
                        name="newPassword"
                        control={control}
                        rules={{
                          required: 'Nova senha é obrigatória',
                          minLength: {
                            value: 6,
                            message: 'A senha deve ter no mínimo 6 caracteres'
                          }
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            id="newPassword"
                            className={`${styles.input} ${
                              errors.newPassword ? styles.errorInput : ''
                            }`}
                            placeholder="••••••••"
                            disabled={loading}
                          />
                        )}
                      />
                      <span
                        className={styles.eyeIcon}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                      </span>
                    </div>
                    <ErrorMessage
                      errors={errors}
                      name="newPassword"
                      render={({ message }) => errorFormMessage(message)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="confirmPassword" className={styles.label}>
                      Confirmar Nova Senha
                    </label>
                    <div className={styles.passwordWrapper}>
                      <Controller
                        name="confirmPassword"
                        control={control}
                        rules={{
                          required: 'Confirmação de senha é obrigatória',
                          validate: (value) =>
                            value === watch('newPassword') ||
                            'As senhas não coincidem'
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            className={`${styles.input} ${
                              errors.confirmPassword ? styles.errorInput : ''
                            }`}
                            placeholder="••••••••"
                            disabled={loading}
                          />
                        )}
                      />
                      <span
                        className={styles.eyeIcon}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                      </span>
                    </div>
                    <ErrorMessage
                      errors={errors}
                      name="confirmPassword"
                      render={({ message }) => errorFormMessage(message)}
                    />
                  </div>
                </div>

                <div className={styles.buttonGroup}>
                  <Button
                    label="Voltar"
                    variant="animated"
                    outline
                    onClick={() => setStep(1)}
                    disabled={loading}
                    type="button"
                  />
                  <Button
                    label={loading ? 'Salvando...' : 'Redefinir Senha'}
                    variant="animated"
                    type="submit"
                    disabled={loading}
                  />
                </div>
              </form>
            </>
          )}

          <div className={styles.footer}>
            <p>
              Lembrou sua senha?{' '}
              <Link to="/login" className={styles.loginLink}>
                Fazer Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
