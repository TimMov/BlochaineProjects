import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddDiplomaForm.css';
import DiplomasList from './DiplomaList';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AddDiplomaForm = () => {
  // Состояния формы
  const [formData, setFormData] = useState({
    student_name: '',
    university_name: '',
    graduation_year: new Date().getFullYear().toString(),
    degree_type: 'bachelor'
  });

  // Состояния списка дипломов
  const [diplomas, setDiplomas] = useState([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Опции для выбора степени
  const degrees = [
    { value: 'bachelor', label: 'Бакалавр' },
    { value: 'master', label: 'Магистр' },
    { value: 'phd', label: 'Кандидат наук' },
    { value: 'doctor', label: 'Доктор наук' }
  ];

  // Загрузка дипломов при монтировании
  useEffect(() => {
    fetchDiplomas();
  }, []);

  // Получение дипломов из БД
  const fetchDiplomas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/diplomas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiplomas(response.data);
    } catch (err) {
      console.error('Ошибка загрузки дипломов:', err);
      setError('Не удалось загрузить список дипломов');
    }
  };

  // Обработчик изменений формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Валидация формы
  const validateForm = () => {
    const errors = [];
    if (!formData.student_name.trim()) errors.push('Укажите ФИО студента');
    if (!formData.university_name.trim()) errors.push('Укажите университет');
    if (!formData.graduation_year || isNaN(formData.graduation_year)) {
      errors.push('Год должен быть числом');
    } else if (formData.graduation_year.length !== 4) {
      errors.push('Год должен состоять из 4 цифр');
    } else if (parseInt(formData.graduation_year) > new Date().getFullYear()) {
      errors.push('Год выпуска не может быть в будущем');
    }
    return errors;
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('\n'));
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        student_name: formData.student_name.trim(),
        university_name: formData.university_name.trim(),
        graduation_year: parseInt(formData.graduation_year),
        degree_type: formData.degree_type
      };

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Требуется авторизация');

      const response = await axios.post(
        `${API_BASE_URL}/api/diplomas`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data?.success) {
        setSuccess(true);
        setFormData({
          student_name: '',
          university_name: '',
          graduation_year: new Date().getFullYear().toString(),
          degree_type: 'bachelor'
        });
        await fetchDiplomas(); // Обновляем список после успешного добавления
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка ошибок API
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

  // Фильтрация дипломов
  const filteredDiplomas = diplomas.filter(d =>
    d.student_name.toLowerCase().includes(filter.toLowerCase()) ||
    d.university_name.toLowerCase().includes(filter.toLowerCase()) ||
    d.degree_type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="diploma-container">
      <h2 className="form-title">Добавление диплома</h2>

      {/* Сообщения об ошибках и успехе */}
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

      <div className="form-and-list-container">
        {/* Форма добавления */}
        <form onSubmit={handleSubmit} className="diploma-form">
          <div className="form-group">
            <label>ФИО студента*</label>
            <input
              type="text"
              name="student_name"
              value={formData.student_name}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Университет*</label>
            <input
              type="text"
              name="university_name"
              value={formData.university_name}
              onChange={handleChange}
              required
              maxLength={150}
            />
          </div>

          <div className="form-group">
            <label>Год выпуска*</label>
            <input
              type="number"
              name="graduation_year"
              value={formData.graduation_year}
              onChange={handleChange}
              required
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="form-group">
            <label>Академическая степень*</label>
            <select
              name="degree_type"
              value={formData.degree_type}
              onChange={handleChange}
              required
            >
              {degrees.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Отправка...' : 'Добавить диплом'}
          </button>
        </form>

        {/* Список дипломов */}
        <div className="list-section">
        <DiplomasList />
      </div>
    </div>
      </div>
  
  );
};

export default AddDiplomaForm;