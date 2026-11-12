import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Server lagi nggak bisa dihubungi. Cek koneksi internetmu atau coba lagi sebentar lagi.';
    }
    if (error.response.status >= 500) {
      return 'Servernya lagi bermasalah. Ini bukan salahmu, coba lagi sebentar ya.';
    }
    return error.response.data?.message ?? 'Terjadi kesalahan';
  }
  return 'Terjadi kesalahan';
}

export interface FieldError {
  field: string;
  message: string;
}

export function getFieldErrors(error: unknown): FieldError[] {
  if (axios.isAxiosError(error)) {
    const errors = error.response?.data?.errors;
    if (Array.isArray(errors)) return errors as FieldError[];
  }
  return [];
}