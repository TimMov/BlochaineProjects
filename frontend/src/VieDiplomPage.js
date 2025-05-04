import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DiplomaViewer() {
  const [diplomas, setDiplomas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDiplomas() {
      try {
        const res = await axios.get('/api/diplomas');
        if (res.data.success) {
          setDiplomas(res.data.diplomas);
        } else {
          setError('Не удалось загрузить дипломы');
        }
      } catch (err) {
        console.error("Ошибка при загрузке дипломов:", err);
        setError('Ошибка при загрузке дипломов');
      }
    }

    loadDiplomas();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Список дипломов</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {diplomas.length === 0 ? (
        <p>Нет дипломов для отображения.</p>
      ) : (
        <ul>
          {diplomas.map((diploma, index) => (
            <li key={index} style={{ marginBottom: "15px" }}>
              <strong>ФИО:</strong> {diploma.student_name}<br />
              <strong>Университет:</strong> {diploma.university_name}<br />
              <strong>Год:</strong> {diploma.year}<br />
              <strong>Серия и номер:</strong> {diploma.diploma_series} {diploma.diploma_number}<br />
              <strong>Регистрационный №:</strong> {diploma.registration_number}<br />
              <strong>Специальность:</strong> {diploma.specialty_code}<br />
              <strong>Тип степени:</strong> {diploma.degree_type}<br />
              <strong>Hash транзакции:</strong> {diploma.tx_hash}<br />
              <strong>Блок:</strong> {diploma.block_number}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
