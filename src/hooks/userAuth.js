// ⚙️ React e bibliotecas externas
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

// 🔐 Serviços / API
import api from '../services/api';
import ServiceAUTH from '../services/ServiceAUTH';

// 🧠 Hooks customizados
import useFlashMessage from './userFlashMessage';
import {
  useMemorizeFilters,
  POSSIBLE_FILTERS_ENTITIES
} from './useMemorizeInputsFilters';
import {
  useMemorizeTableColumns,
  TABLE_CONFIG_KEYS
} from './useMemorizeTableColumns';

const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.errors?.[0] ||
  error?.response?.data?.message ||
  fallback;

let refreshRequest = null;

export default function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const { setFlashMessage } = useFlashMessage();
  const {
    getMemorizedFilters: getMemorizedFiltersUsers,
    memorizeFilters: memorizeFiltersUsers,
    clearMemorizedFilters: clearMemorizedFiltersUsers
  } = useMemorizeFilters(POSSIBLE_FILTERS_ENTITIES.USERS);
  const {
    getMemorizedFilters: getMemorizedFiltersSystem,
    memorizeFilters: memorizeFiltersSystem
  } = useMemorizeFilters(POSSIBLE_FILTERS_ENTITIES.SYSTEM_CONFIG);

  const { clearAllMemorizedConfigs: clearAllMemorizedConfigs } =
    useMemorizeTableColumns(TABLE_CONFIG_KEYS.TRANSACTIONS_RECORDS);

  const hasValidated = useRef(false);
  const handlingUnauthorized = useRef(false);

  function clearLocalSession(silent = false, deleteAccount = false) {
    setAuthenticated(false);
    setLoading(false);
    clearMemorizedFiltersUsers();
    clearAllMemorizedConfigs();
    localStorage.removeItem('token');
    api.defaults.headers.Authorization = undefined;

    if (!silent && !deleteAccount) {
      setFlashMessage('Logout realizado com sucesso!', 'success');
    } else if (silent && !deleteAccount) {
      setFlashMessage('Sua sessão expirou. Faça login novamente.', 'warning');
    } else {
      setFlashMessage('Conta excluída com sucesso!', 'success');
    }

    history.push('/login');
  }

  async function validateToken() {
    const token = localStorage.getItem('token');

    if (!token) {
      setAuthenticated(false);
      setLoading(false);
      return false;
    }

    try {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      await api.post('/auth/validate', {
        sessionId: getMemorizedFiltersUsers()?.sessionId
      });

      setAuthenticated(true);
      setLoading(false);
      return true;
    } catch (error) {
      if (!handlingUnauthorized.current) {
        handlingUnauthorized.current = true;
        clearLocalSession(true);
      }
      return false;
    }
  }

  useEffect(() => {
    if (!hasValidated.current) {
      hasValidated.current = true;
      validateToken();
    }
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || '';
        const isPublicAuthRequest = [
          '/user/login',
          '/user/register',
          '/user/find-questions',
          '/user/forgot-password'
        ].some((path) => requestUrl.includes(path));
        const canRefresh =
          error.response?.status === 401 &&
          Boolean(originalRequest) &&
          Boolean(localStorage.getItem('token')) &&
          !originalRequest?._retry &&
          !isPublicAuthRequest &&
          !requestUrl.includes('/auth/refresh') &&
          !requestUrl.includes('/user/logout');

        if (canRefresh) {
          originalRequest._retry = true;

          try {
            if (!refreshRequest) {
              refreshRequest = api
                .post(
                  '/auth/refresh',
                  {},
                  { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
                )
                .finally(() => {
                  refreshRequest = null;
                });
            }

            const refreshResponse = await refreshRequest;
            const newToken = refreshResponse.data?.data?.token;
            if (!newToken) throw new Error('Token de acesso nao retornado');

            localStorage.setItem('token', newToken);
            api.defaults.headers.Authorization = `Bearer ${newToken}`;
            if (typeof originalRequest.headers?.set === 'function') {
              originalRequest.headers.set(
                'Authorization',
                `Bearer ${newToken}`
              );
            } else {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${newToken}`
              };
            }
            handlingUnauthorized.current = false;
            return api(originalRequest);
          } catch {
            // A requisicao de refresh trata a limpeza local ao retornar 401.
          }
        }

        if (
          error.response?.status === 401 &&
          !isPublicAuthRequest &&
          !requestUrl.includes('/user/logout') &&
          !handlingUnauthorized.current
        ) {
          handlingUnauthorized.current = true;
          clearLocalSession(true);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  async function register(user) {
    let msgText = '';
    let msgType = '';

    try {
      await ServiceAUTH.register(user).then((response) => {
        msgText = response.data.message;
        msgType = 'success';
        return response.data;
      });

      history.push('/login');
    } catch (error) {
      msgText = getApiErrorMessage(error, 'Erro ao criar a conta.');
      msgType = 'error';
    }

    setFlashMessage(msgText, msgType);
  }

  async function forgotPassword(user) {
    let msgText = '';
    let msgType = '';

    try {
      await ServiceAUTH.forgotPassword(user).then((response) => {
        msgText = response.data.message;
        msgType = 'success';
        return response.data;
      });

      history.push('/login');
    } catch (error) {
      msgText = getApiErrorMessage(error, 'Erro ao redefinir a senha.');
      msgType = 'error';
    }

    setFlashMessage(msgText, msgType);
  }

  async function login(user) {
    let msgText = '';
    let msgType = '';
    try {
      const data = await ServiceAUTH.login(user).then((response) => {
        msgText = response.data.message;
        msgType = 'success';

        return response.data;
      });

      await authUser(data.data);
    } catch (error) {
      msgText = getApiErrorMessage(error, 'Login ou senha inválidos.');
      msgType = 'error';
    }

    setFlashMessage(msgText, msgType);
  }

  async function authUser(data) {
    handlingUnauthorized.current = false;
    setAuthenticated(true);
    api.defaults.headers.Authorization = `Bearer ${data.token}`;
    memorizeFiltersUsers({
      ...getMemorizedFiltersUsers(),
      login: data?.user?.login,
      email: data?.user?.email,
      id: data?.user?.id,
      sessionId: data?.user?.sessionId
    });
    memorizeFiltersSystem({
      ...getMemorizedFiltersSystem(),
      theme: getMemorizedFiltersSystem()?.theme || 'light',
      emphasisColor:
        getMemorizedFiltersSystem()?.emphasisColor || 'rgb(20, 18, 129)'
    });
    localStorage.setItem('token', data.token);
    history.push('/inicio');
  }

  async function logout(silent = false, deleteAccount = false) {
    await ServiceAUTH.logout({
      sessionId: getMemorizedFiltersUsers()?.sessionId
    }).catch((error) => {
      console.error('Error during logout API call', error);
    });
    setAuthenticated(false);
    clearMemorizedFiltersUsers();
    clearAllMemorizedConfigs();
    localStorage.removeItem('token');
    api.defaults.headers.Authorization = undefined;

    if (!silent && !deleteAccount) {
      const msgText = 'Logout realizado com sucesso!';
      const msgType = 'success';
      setFlashMessage(msgText, msgType);
    } else if (silent && !deleteAccount) {
      const msgText = 'Sua sessão expirou. Faça login novamente.';
      const msgType = 'warning';
      setFlashMessage(msgText, msgType);
    } else {
      const msgText = 'Conta excluída com sucesso!';
      const msgType = 'success';
      setFlashMessage(msgText, msgType);
    }

    history.push('/login');
  }

  return { authenticated, loading, register, login, logout, forgotPassword };
}
