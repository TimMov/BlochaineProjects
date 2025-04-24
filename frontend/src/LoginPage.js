import React, { useState, useEffect } from 'react';
import { login, register } from './api';
import './Auth.css'; // Создадим отдельный файл стилей

const LoginPage = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // Валидация формы при изменении
  useEffect(() => {
    const validateForm = () => {
      const newErrors = {};
      
      if (!formData.username.trim()) {
        newErrors.username = 'Логин обязателен';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Логин слишком короткий';
      }

      if (!formData.password) {
        newErrors.password = 'Пароль обязателен';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Пароль должен быть не менее 6 символов';
      }

      if (isRegister) {
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Пароли не совпадают';
        }
      }

      setErrors(newErrors);
      setFormValid(Object.keys(newErrors).length === 0);
    };

    validateForm();
  }, [formData, isRegister]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValid) return;

    setIsLoading(true);
    setErrors({});

    try {
      let data;
      if (isRegister) {
        // Убираем confirmPassword перед отправкой
        const { confirmPassword, ...registerData } = formData;
        data = await register(registerData);
      } else {
        // Для входа отправляем только нужные поля
        data = await login({
          username: formData.username,
          password: formData.password
        });
      }
      
      onLogin(data.role);
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
    setErrors({});
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isRegister ? 'Регистрация' : 'Вход'}</h2>
        
        {errors.api && <div className="alert error">{errors.api}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Логин</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label>Подтвердите пароль</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label>Роль</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="primary-btn"
            disabled={!formValid || isLoading}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : isRegister ? (
              'Зарегистрироваться'
            ) : (
              'Войти'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button 
            onClick={toggleAuthMode} 
            className="link-btn"
          >
            {isRegister ? (
              'Уже есть аккаунт? Войти'
            ) : (
              'Нет аккаунта? Зарегистрироваться'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;