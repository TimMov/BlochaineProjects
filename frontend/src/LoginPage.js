import { useState } from 'react';
import axios from 'axios';

const LoginPage = ({ onLogin, onShowRegister }) => {
  const [inputs, setInputs] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', inputs);
      
      // Проверяем структуру ответа перед передачей
      if (!response.data?.user) {
        throw new Error('Некорректный ответ сервера');
      }
      
      onLogin(response.data); // Передаём весь объект ответа
    } catch (err) {
      const message = err.response?.data?.message || 
                     err.message || 
                     'Ошибка соединения';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // const handleGoToRegister = () => {
  //   window.location.href = '/register'; // Переход на страницу регистрации
  // };

  return (
    <div className="login-form">
      <h2>Вход в систему</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          value={inputs.username}
          onChange={handleChange}
          placeholder="Логин"
          required
        />
        <input
          name="password"
          type="password"
          value={inputs.password}
          onChange={handleChange}
          placeholder="Пароль"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      <button onClick={onShowRegister}>
        Зарегистрироваться
      </button>
    </div>
  );
};

export default LoginPage;
