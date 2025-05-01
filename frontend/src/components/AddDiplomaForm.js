import React, { useState } from 'react';
import axios from 'axios';
import './AddDiplomaForm.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AddDiplomaForm = () => {
  const [formData, setFormData] = useState({
    student_name: '', // Изменено с studentName для соответствия серверу
    university_name: '', // Изменено с universityName
    graduation_year: new Date().getFullYear().toString(), // Изменено с year
    degree_type: 'bachelor' // Изменено с degree
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const degrees = [
    { value: 'bachelor', label: 'Бакалавр' },
    { value: 'master', label: 'Магистр' },
    { value: 'phd', label: 'Кандидат наук' },
    { value: 'doctor', label: 'Доктор наук' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.student_name.trim()) errors.push('Укажите ФИО студента');
    if (!formData.university_name.trim()) errors.push('Укажите университет');
    if (!formData.graduation_year || isNaN(formData.graduation_year)) {
      errors.push('Год должен быть числом');
    } else if (formData.graduation_year.length !== 4) {
      errors.push('Год должен состоять из 4 цифр');
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Валидация
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('\n'));
      setIsLoading(false);
      return;
    }

    try {
      // Подготовка данных (теперь ключи соответствуют ожиданиям сервера)
      const payload = {
        student_name: formData.student_name.trim(),
        university_name: formData.university_name.trim(),
        graduation_year: parseInt(formData.graduation_year),
        degree_type: formData.degree_type
      };

      // Проверка токена
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      // Отправка запроса
      const response = await axios.post(
        `${API_BASE_URL}/api/diplomas`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 15000
        }
      );

      // Успешный ответ
      if (response.data?.success) {
        setSuccess(true);
        setFormData({
          student_name: '',
          university_name: '',
          graduation_year: new Date().getFullYear().toString(),
          degree_type: 'bachelor'
        });
      } else {
        throw new Error(response.data?.message || 'Ошибка сервера');
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiError = (err) => {
    let errorMessage = 'Ошибка при отправке данных';
    if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else if (err.response?.status === 401) {
      errorMessage = 'Ошибка авторизации. Проверьте токен.';
    } else if (err.message) {
      errorMessage = err.message;
    }
    setError(errorMessage);
  };

  return (
    <div className="diploma-form-container">
      <h2 className="form-title">Добавление диплома</h2>
      
      {error && (
        <div className="error-message">
          {error.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          <button onClick={() => setError('')} className="close-button">
            &times;
          </button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <p>Диплом успешно добавлен!</p>
          <button onClick={() => setSuccess(false)} className="close-button">
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="diploma-form" noValidate>
        <div className="form-group">
          <label htmlFor="student_name" className="form-label">
            ФИО студента*
          </label>
          <input
            type="text"
            id="student_name"
            name="student_name"
            value={formData.student_name}
            onChange={handleChange}
            className="form-input"
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="university_name" className="form-label">
            Университет*
          </label>
          <input
            type="text"
            id="university_name"
            name="university_name"
            value={formData.university_name}
            onChange={handleChange}
            className="form-input"
            required
            maxLength={150}
          />
        </div>

        <div className="form-group">
          <label htmlFor="graduation_year" className="form-label">
            Год выпуска*
          </label>
          <input
            type="number"
            id="graduation_year"
            name="graduation_year"
            value={formData.graduation_year}
            onChange={handleChange}
            className="form-input"
            required
            min="1900"
            max={new Date().getFullYear()}
            step="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="degree_type" className="form-label">
            Академическая степень*
          </label>
          <select
            id="degree_type"
            name="degree_type"
            value={formData.degree_type}
            onChange={handleChange}
            className="form-select"
            required
          >
            {degrees.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`submit-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? 'Отправка...' : 'Добавить диплом'}
        </button>
      </form>
    </div>
  );
};

export default AddDiplomaForm;