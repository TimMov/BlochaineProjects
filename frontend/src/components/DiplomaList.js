import { useEffect, useState } from 'react';
import axios from 'axios';

export default function DiplomasList() {
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiplomas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/diplomas');
        setDiplomas(response.data);
      } catch (error) {
        console.error('Ошибка загрузки дипломов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiplomas();
  }, []);

  if (loading) return <div>Загрузка...</div>;

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
            <tr key={diploma.id}>
              <td>{diploma.student_name}</td>
              <td>{diploma.university_name}</td>
              <td>{diploma.year}</td>
              <td>{diploma.degree_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}