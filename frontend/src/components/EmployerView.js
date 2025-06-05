import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployerView.css';

function EmployerView() {
    const [diplomas, setDiplomas] = useState([]);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

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
        <div className="employer-container">
            <div className="form-group">
                <label>Поиск по дипломам</label>
                <input
                    type="text"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Введите ФИО, вуз, степень, серию или номер диплома"
                />
            </div>

            <h2>Просмотр дипломов</h2>
            {error && <p className="error-message">{error}</p>}

            <table className="diploma-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort('student_name')}>ФИО студента{getSortSymbol('student_name')}</th>
                        <th onClick={() => handleSort('university_name')}>Университет{getSortSymbol('university_name')}</th>
                        <th onClick={() => handleSort('degree_type')}>Степень{getSortSymbol('degree_type')}</th>
                        <th onClick={() => handleSort('diploma_series')}>Серия диплома{getSortSymbol('diploma_series')}</th>
                        <th onClick={() => handleSort('diploma_number')}>Номер диплома{getSortSymbol('diploma_number')}</th>
                        <th onClick={() => handleSort('specialty_code')}>Специальность{getSortSymbol('specialty_code')}</th>
                        <th onClick={() => handleSort('year')}>Год выдачи{getSortSymbol('year')}</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDiplomas.map((diploma, index) => (
                        <tr key={index}>
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
