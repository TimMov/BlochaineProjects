import { useState } from 'react';
import axios from 'axios';

const RegisterPage = () => {
  const [inputs, setInputs] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', inputs);
      
      if (response.data.success) {
        window.location.href = '/login';  // Перенаправление на страницу логина
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError(err.message || 'Ошибка соединения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  return (
    <div className="register-form">
      <h2>Регистрация</h2>
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
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
