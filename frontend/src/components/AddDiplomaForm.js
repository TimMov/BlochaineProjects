import React, { useState } from 'react';
import axios from 'axios';
import './AddDiplomaForm.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AddDiplomaForm = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    universityName: '',
    year: new Date().getFullYear().toString(),
    degree: 'bachelor'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess(false);

    try {
      // Валидация на клиенте
      const errors = [];
      if (!formData.studentName.trim()) errors.push('Укажите ФИО студента');
      if (!formData.universityName.trim()) errors.push('Укажите университет');
      if (!formData.year || isNaN(formData.year)) errors.push('Год должен быть числом');
      if (formData.year.length !== 4) errors.push('Год должен состоять из 4 цифр');
      
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }

      // Подготовка данных для сервера
      const payload = {
        student_name: formData.studentName.trim(), // Исправлено для соответствия серверу
        university_name: formData.universityName.trim(),
        graduation_year: parseInt(formData.year), // Исправлено для соответствия серверу
        degree_type: formData.degree // Исправлено для соответствия серверу
      };

      console.log('Отправляемые данные:', payload);
      console.log('URL запроса:', `${API_BASE_URL}/api/diplomas`);

      // Отправка запроса
      const response = await axios.post(
        `${API_BASE_URL}/api/diplomas`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 15000
        }
      );

      // Обработка ответа сервера
      if (!response.data.success) {
        throw new Error(response.data.message || 'Ошибка при сохранении данных');
      }

      // Успешное завершение
      setSuccess(true);
      setFormData({
        studentName: '',
        universityName: '',
        year: new Date().getFullYear().toString(),
        degree: 'bachelor'
      });

    } catch (err) {
      let errorMessage = 'Произошла ошибка';
      
      if (err.response?.data?.error) {
        // Ошибка валидации от сервера
        errorMessage = err.response.data.error;
      } else if (err.response) {
        // Другие ошибки сервера
        errorMessage = `Ошибка сервера: ${err.response.status}`;
        if (err.response.data.message) {
          errorMessage += ` (${err.response.data.message})`;
        }
      } else if (err.request) {
        // Ошибки сети
        errorMessage = `Сервер не отвечает. Проверьте:\n1. Запущен ли бэкенд на ${API_BASE_URL}\n2. Настройки CORS\n3. Сетевое подключение`;
      } else {
        // Другие ошибки
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Детали ошибки:', {
        error: err,
        requestData: err.config?.data,
        response: err.response?.data
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="diploma-form-container">
      <h2 className="form-title">Добавление диплома</h2>
      
      {/* Блок ошибок */}
      {error && (
        <div className="error-message">
          {error.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          <button 
            onClick={() => setError('')} 
            className="close-button"
            aria-label="Закрыть ошибку"
          >
            &times;
          </button>
        </div>
      )}
      
      {/* Блок успеха */}
      {success && (
        <div className="success-message">
          <p>Диплом успешно добавлен!</p>
          <button 
            onClick={() => setSuccess(false)} 
            className="close-button"
            aria-label="Закрыть уведомление"
          >
            &times;
          </button>
        </div>
      )}

      {/* Форма */}
      <form onSubmit={handleSubmit} className="diploma-form" noValidate>
        <div className="form-group">
          <label htmlFor="studentName" className="form-label">
            ФИО студента*
          </label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className="form-input"
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="universityName" className="form-label">
            Университет*
          </label>
          <input
            type="text"
            id="universityName"
            name="universityName"
            value={formData.universityName}
            onChange={handleChange}
            className="form-input"
            required
            maxLength={150}
          />
        </div>

        <div className="form-group">
          <label htmlFor="year" className="form-label">
            Год выпуска*
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="form-input"
            required
            min="1900"
            max={new Date().getFullYear()}
            step="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="degree" className="form-label">
            Академическая степень*
          </label>
          <select
            id="degree"
            name="degree"
            value={formData.degree}
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
          className="submit-button"
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Отправка...
            </>
          ) : (
            'Добавить диплом'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddDiplomaForm;