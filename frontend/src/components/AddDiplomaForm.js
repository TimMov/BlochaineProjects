import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddDiplomaForm.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AddDiplomaForm = () => {
  const [formData, setFormData] = useState({
    student_name: '',
    university_id: '',
    graduation_year: new Date().getFullYear().toString(),
    degree_type: 'bachelor',
    diploma_series: '',
    diploma_number: '',
    registration_number: '',
    specialty_id: ''
  });

  const [diplomas, setDiplomas] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const degrees = [
    { value: 'bachelor', label: 'Бакалавр' },
    { value: 'master', label: 'Магистр' },
    { value: 'phd', label: 'Кандидат наук' },
    { value: 'doctor', label: 'Доктор наук' }
  ];

  useEffect(() => {
    fetchUniversities();
    fetchSpecialties();
    fetchDiplomas();
  }, []);

  const fetchUniversities = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/diplomas/universities`);
    setUniversities(res.data);
  };

  const fetchSpecialties = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/diplomas/specialties`);
    setSpecialties(res.data);
  };

  const fetchDiplomas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/diplomas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiplomas(response.data);
    } catch (err) {
      setError('Не удалось загрузить список дипломов');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];
    const { student_name, diploma_series, diploma_number, registration_number, graduation_year } = formData;

    if (!student_name.trim()) errors.push('Укажите ФИО студента');
    if (!formData.university_id) errors.push('Укажите университет');
    if (!formData.specialty_id) errors.push('Укажите специальность');
    if (!diploma_series.trim()) errors.push('Укажите серию диплома');
    if (!diploma_number.trim()) errors.push('Укажите номер диплома');
    if (!registration_number.trim()) errors.push('Укажите регистрационный номер');
    if (!graduation_year || isNaN(graduation_year)) errors.push('Год должен быть числом');
    if (graduation_year.length !== 4) errors.push('Год должен состоять из 4 цифр');
    if (parseInt(graduation_year) > new Date().getFullYear()) errors.push('Год выпуска не может быть в будущем');
    if (diploma_series.length !== 6) errors.push('Серия диплома должна быть 6 символов');
    if (diploma_number.length !== 7) errors.push('Номер диплома должен быть 7 символов');
    if (registration_number.length !== 6) errors.push('Регистрационный номер должен быть 6 символов');

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
        year: parseInt(formData.graduation_year),
        degree_type: formData.degree_type,
        diplomaSeries: formData.diploma_series.trim(),
        diplomaNumber: formData.diploma_number.trim(),
        registrationNumber: formData.registration_number.trim(),
        university_id: parseInt(formData.university_id),
        specialty_id: parseInt(formData.specialty_id)
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/diplomas`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success) {
        setSuccess(true);
        setFormData({
          student_name: '',
          university_id: '',
          graduation_year: new Date().getFullYear().toString(),
          degree_type: 'bachelor',
          diploma_series: '',
          diploma_number: '',
          registration_number: '',
          specialty_id: ''
        });
        await fetchDiplomas();
      }
    } catch (err) {
      let message = err.response?.data?.error || err.message || 'Ошибка при отправке данных';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
  };

  const getSortSymbol = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const sortedDiplomas = [...diplomas].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField]?.toString().toLowerCase();
    const valB = b[sortField]?.toString().toLowerCase();
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredDiplomas = sortedDiplomas.filter(d =>
  (d.student_name && d.student_name.toLowerCase().includes(filter.toLowerCase())) ||
  (d.university_name && d.university_name.toLowerCase().includes(filter.toLowerCase())) ||
  (d.degree_type && d.degree_type.toLowerCase().includes(filter.toLowerCase())) ||
  (d.diploma_number && d.diploma_number.toLowerCase().includes(filter.toLowerCase())) ||
  (d.diploma_series && d.diploma_series.toLowerCase().includes(filter.toLowerCase()))
);


  return (
    <div className="diploma-container">
      <h2 className="form-title">Добавление диплома</h2>

      {error && (
        <div className="error-message">
          {error.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          <button onClick={() => setError('')} className="close-button">&times;</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <p>Диплом успешно добавлен!</p>
          <button onClick={() => setSuccess(false)} className="close-button">&times;</button>
        </div>
      )}

      <div className="form-and-table-container">
        <form onSubmit={handleSubmit} className="diploma-form">
          <div className="form-group">
            <label>ФИО студента*</label>
            <input name="student_name" value={formData.student_name} onChange={handleChange} required maxLength={100} />
          </div>

          <div className="form-group">
            <label>Университет*</label>
            <select name="university_id" value={formData.university_id} onChange={handleChange} required>
              <option value="">Выберите университет</option>
              {universities.map(u => (
                <option key={u.university_id} value={u.university_id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Год выпуска*</label>
            <input name="graduation_year" type="number" value={formData.graduation_year} onChange={handleChange} min="1900" max={new Date().getFullYear()} required />
          </div>

          <div className="form-group">
            <label>Серия диплома*</label>
            <input name="diploma_series" value={formData.diploma_series} onChange={handleChange} maxLength={6} required />
          </div>

          <div className="form-group">
            <label>Номер диплома*</label>
            <input name="diploma_number" value={formData.diploma_number} onChange={handleChange} maxLength={7} required />
          </div>

          <div className="form-group">
            <label>Регистрационный номер*</label>
            <input name="registration_number" value={formData.registration_number} onChange={handleChange} maxLength={6} required />
          </div>

          <div className="form-group">
            <label>Специальность*</label>
            <select name="specialty_id" value={formData.specialty_id} onChange={handleChange} required>
              <option value="">Выберите специальность</option>
              {specialties.map(s => (
                <option key={s.specialty_id} value={s.specialty_id}>{s.code} — {s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Академическая степень*</label>
            <select name="degree_type" value={formData.degree_type} onChange={handleChange} required>
              {degrees.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isLoading}>{isLoading ? 'Отправка...' : 'Добавить диплом'}</button>
        </form>

        <div className="table-section">
          <div className="form-group">
            <label>Поиск по дипломам</label>
            <input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Введите ФИО, вуз или степень" />
          </div>

          <table className="diploma-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('student_name')}>ФИО студента{getSortSymbol('student_name')}</th>
                <th onClick={() => handleSort('university_name')}>Университет{getSortSymbol('university_name')}</th>
                <th onClick={() => handleSort('degree_type')}>Степень{getSortSymbol('degree_type')}</th>
                <th onClick={() => handleSort('diploma_series')}>Серия{getSortSymbol('diploma_series')}</th>
                <th onClick={() => handleSort('diploma_number')}>Номер{getSortSymbol('diploma_number')}</th>
                <th onClick={() => handleSort('registration_number')}>Рег. номер{getSortSymbol('registration_number')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredDiplomas.map((d, i) => (
                <tr key={i}>
                  <td>{d.student_name}</td>
                  <td>{d.university_name}</td>
                  <td>{degrees.find(deg => deg.value === d.degree_type)?.label || d.degree_type}</td>
                  <td>{d.diploma_series}</td>
                  <td>{d.diploma_number}</td>
                  <td>{d.registration_number}</td>
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
