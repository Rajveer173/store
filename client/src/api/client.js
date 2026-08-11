import axios from 'axios';

const TOKEN_KEY = 'srp_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((requestConfig) => {
  const token = tokenStorage.get();
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (status === 401 && !isLoginRequest && unauthorizedHandler) {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  },
);

export function extractError(error) {
  const data = error?.response?.data;
  return {
    message: data?.message ?? 'Unable to reach the server, please try again',
    fieldErrors: data?.errors ?? {},
  };
}
