import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployerView.css'; // Подключаем CSS

function EmployerView() {
    const [diplomas, setDiplomas] = useState([]);
    const [error, setError] = useState('');

    const [filter, setFilter] = useState('');

    const degrees = [
        { value: 'bachelor', label: 'Бакалавр' },
        { value: 'master', label: 'Магистр' },
        { value: 'phd', label: 'Кандидат наук' },
        { value: 'doctor', label: 'Доктор наук' }
    ];

    useEffect(() => {
        const fetchDiplomas = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/diplomas', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDiplomas(response.data);
            } catch (err) {
                setError('Ошибка при загрузке дипломов');
                console.error(err);
            }
        };

        fetchDiplomas();
    }, []);

    const filteredDiplomas = diplomas.filter(d =>
        (d.student_name && d.student_name.toLowerCase().includes(filter.toLowerCase())) ||
        (d.university_name && d.university_name.toLowerCase().includes(filter.toLowerCase())) ||
        (d.degree_type && d.degree_type.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="employer-container">

            <div className="form-group">
                <label>Поиск по дипломам</label>
                <input
                    type="text"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Введите ФИО, вуз или степень"
                />
            </div>

            <h2>Просмотр дипломов</h2>
            {error && <p className="error-message">{error}</p>}

            <table className="diploma-table">
                <thead>
                    <tr>
                        <th>ФИО студента</th>
                        <th>Университет</th>
                        <th>Степень</th>
                        <th>Серия диплома</th>
                        <th>Номер диплома</th>
                        <th>Специальность</th>
                        <th>Дата выдачи</th>
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
                            <td>{diploma.specialty_code}</td>
                            <td>{diploma.year}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default EmployerView;
