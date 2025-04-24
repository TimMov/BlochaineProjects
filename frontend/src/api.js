import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Добавляем перехватчик для ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Обрабатываем стандартные HTTP ошибки
      const message = error.response.data?.error || 
                     error.response.data?.message || 
                     'Произошла ошибка';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Ошибки соединения
      return Promise.reject(new Error('Нет ответа от сервера'));
    } else {
      // Другие ошибки
      return Promise.reject(error);
    }
  }
);

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;