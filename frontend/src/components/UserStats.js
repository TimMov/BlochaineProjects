import { useState, useEffect } from 'react';
import axios from 'axios';

export default function GlobalStats() {
  const [total, setTotal] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get('/api/diplomas/stats/total');
        if (res.data.success) {
          setTotal(res.data.total);
        } else {
          setError('Не удалось загрузить статистику');
        }
      } catch (err) {
        console.error(err);
        setError('Ошибка при загрузке статистики');
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="global-stats">
      {error && <p className="error">{error}</p>}
      {total !== null ? (
        <p><strong>Всего дипломов в системе:</strong> {total}</p>
      ) : (
        <p>Загрузка статистики...</p>
      )}
    </div>
  );
}
