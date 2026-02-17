// ⚙️ React e bibliotecas externas
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';

// 💅 Estilos
import styles from './Login.module.css';

// 🧩 Componentes
import Button from '../../components/button/Button';

// 🖼️ Assets
import Logo from '../../assets/Logo.svg';

// 🌐 Contexto
import { Context } from '../../context/UserContext';

// 🧰 Utilitários
import errorFormMessage from '../../utils/errorFormMessage';


const Login = () => {
  const { login } = useContext(Context);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      login: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
   const formatData = {
    login: data.login,
    password: data.password
   }


   login(formatData)
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.decorativeCircle1}></div>
          <div className={styles.decorativeCircle2}></div>

          <h1 className={styles.title}>Bem-vindo de volta!</h1>

          <div className={styles.logoWrapper}>
            <img src={Logo} alt="SyncTime Logo" className={styles.logo} />
          </div>

          <p className={styles.description}>
            Acesse sua conta e continue organizando seu tempo de forma eficiente.
          </p>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Login</h2>
            <p className={styles.formSubtitle}>Entre com suas credenciais</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="login" className={styles.label}>
                Login
              </label>
              <Controller
                name="login"
                control={control}
                rules={{
                  required: 'Nome de usuário é obrigatório',
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="login"
                    className={`${styles.input} ${errors.login ? styles.errorInput : ''}`}
                    placeholder="Digite seu login"
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

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Senha
              </label>
              <div className={styles.passwordWrapper}>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'A senha deve ter no mínimo 6 caracteres',
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className={`${styles.input} ${errors.password ? styles.errorInput : ''}`}
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
                name="password"
                render={({ message }) => errorFormMessage(message)}
              />
            </div>

            <div className={styles.options}>
              <Link to="/esqueceu-senha" className={styles.forgotLink}>
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              label={loading ? 'Entrando...' : 'Entrar'}
              variant="animated"
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            />
          </form>

          <div className={styles.footer}>
            <p>
              Não tem uma conta?{' '}
              <Link to="/register" className={styles.registerLink}>
                Registre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;