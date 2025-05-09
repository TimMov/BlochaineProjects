import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddDiplomaForm.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AddDiplomaForm = () => {
  const [formData, setFormData] = useState({
    student_name: '',
    university_name: '',
    graduation_year: new Date().getFullYear().toString(),
    degree_type: 'bachelor',
    diploma_series: '',
    diploma_number: '',
    registration_number: '',
    specialty_code: ''
  });

  const [diplomas, setDiplomas] = useState([]);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const degrees = [
    { value: 'bachelor', label: 'Бакалавр' },
    { value: 'master', label: 'Магистр' },
    { value: 'phd', label: 'Кандидат наук' },
    { value: 'doctor', label: 'Доктор наук' }
  ];

  useEffect(() => {
    fetchDiplomas();
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];
    const { student_name, university_name, diploma_series, diploma_number, registration_number, specialty_code, graduation_year } = formData;

    if (!student_name.trim()) errors.push('Укажите ФИО студента');
    if (!university_name.trim()) errors.push('Укажите университет');
    if (!diploma_series.trim()) errors.push('Укажите серию диплома');
    if (!diploma_number.trim()) errors.push('Укажите номер диплома');
    if (!registration_number.trim()) errors.push('Укажите регистрационный номер');
    if (!specialty_code.trim()) errors.push('Укажите код специальности');
    if (!graduation_year || isNaN(graduation_year)) errors.push('Год должен быть числом');
    if (graduation_year.length !== 4) errors.push('Год должен состоять из 4 цифр');
    if (parseInt(graduation_year) > new Date().getFullYear()) errors.push('Год выпуска не может быть в будущем');

    if (diploma_series.length !== 6) errors.push('Серия диплома должна быть 6 символов');
    if (diploma_number.length !== 7) errors.push('Номер диплома должен быть 7 символов');
    if (registration_number.length !== 6) errors.push('Регистрационный номер должен быть 6 символов');
    if (specialty_code.length !== 8) errors.push('Код специальности должен быть 8 символов');

    return errors;
  };

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
        studentName: formData.student_name.trim(),
        universityName: formData.university_name.trim(),
        year: parseInt(formData.graduation_year),
        degree_type: formData.degree_type,
        diplomaSeries: formData.diploma_series.trim(),
        diplomaNumber: formData.diploma_number.trim(),
        registrationNumber: formData.registration_number.trim(),
        specialty_code: formData.specialty_code.trim()
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
          degree_type: 'bachelor',
          diploma_series: '',
          diploma_number: '',
          registration_number: '',
          specialty_code: ''
        });
        await fetchDiplomas();
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

  const filteredDiplomas = diplomas.filter(d =>
    (d.student_name && d.student_name.toLowerCase().includes(filter.toLowerCase())) ||
    (d.university_name && d.university_name.toLowerCase().includes(filter.toLowerCase())) ||
    (d.degree_type && d.degree_type.toLowerCase().includes(filter.toLowerCase()))
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

      <div className="form-and-table-container">
        {/* Форма добавления диплома */}
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
            <label>Серия диплома*</label>
            <input
              type="text"
              name="diploma_series"
              value={formData.diploma_series}
              onChange={handleChange}
              required
              maxLength={6}
            />
          </div>

          <div className="form-group">
            <label>Номер диплома*</label>
            <input
              type="text"
              name="diploma_number"
              value={formData.diploma_number}
              onChange={handleChange}
              required
              maxLength={7}
            />
          </div>

          <div className="form-group">
            <label>Регистрационный номер*</label>
            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              required
              maxLength={6}
            />
          </div>

          <div className="form-group">
            <label>Код специальности*</label>
            <input
              type="text"
              name="specialty_code"
              value={formData.specialty_code}
              onChange={handleChange}
              required
              maxLength={8}
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

        {/* Таблица дипломов */}
        <div className="table-section">
          <div className="form-group">
            <label>Поиск по дипломам</label>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Введите ФИО, вуз или степень"
            />
          </div>

          <table className="diploma-table">
            <thead>
              <tr>
                <th>ФИО студента</th>
                <th>Университет</th>
                <th>Степень</th>
                <th>Серия диплома</th>
                <th>Номер диплома</th>
                <th>Рег. номер</th>
              </tr>
            </thead>
            <tbody>
              {filteredDiplomas.map((diploma) => (
                <tr key={diploma.id}>
                  <td>{diploma.student_name}</td>
                  <td>{diploma.university_name}</td>
                  <td>{degrees.find(d => d.value === diploma.degree_type)?.label || diploma.degree_type}</td>
                  <td>{diploma.diploma_series}</td>
                  <td>{diploma.diploma_number}</td>
                  <td>{diploma.registration_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddDiplomaForm;
