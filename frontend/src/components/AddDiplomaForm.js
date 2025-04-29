// frontend/src/components/AddDiplomaForm.js

import React, { useState } from 'react';
import axios from 'axios';

const AddDiplomaForm = () => {
    const [studentName, setStudentName] = useState('');
    const [university, setUniversity] = useState('');
    const [degree, setDegree] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/diplomas', {
                studentName,
                university,
                degree,
                graduationYear
            });

            console.log('Ответ сервера:', response.data);
            setMessage('Диплом успешно добавлен!');
            
            // Очистить форму
            setStudentName('');
            setUniversity('');
            setDegree('');
            setGraduationYear('');
        } catch (error) {
            console.error('Ошибка при добавлении диплома:', error);
            setMessage('Ошибка при добавлении диплома.');
        }
    };

    return (
        <div className="add-diploma-form">
            <h2>Добавить диплом</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Имя студента:</label>
                    <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Университет:</label>
                    <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Степень:</label>
                    <input
                        type="text"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Год окончания:</label>
                    <input
                        type="number"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Добавить диплом</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
};

export default AddDiplomaForm;
