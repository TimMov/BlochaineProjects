import React from 'react';

export default function DiplomasList({ diplomas = [] }) {
  if (!Array.isArray(diplomas)) diplomas = [];

  if (diplomas.length === 0) {
    return <div>Нет доступных дипломов.</div>;
  }

  console.log(diplomas);  // Посмотреть, что приходит в diplomas

  return (
    <div className="diplomas-list">
      <h3>Список дипломов</h3>
      <table>
        <thead>
          <tr>
            <th>ФИО</th>
            <th>Университет</th>
            <th>Год</th>
            <th>Степень</th>
          </tr>
        </thead>
        <tbody>
          {diplomas.map((diploma) => (
            <tr key={diploma.diploma_id}>
              <td>{diploma.student_name}</td>
              <td>{diploma.university_name}</td>
              <td>{diploma.graduation_year || diploma.year}</td>
              <td>{diploma.degree_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
