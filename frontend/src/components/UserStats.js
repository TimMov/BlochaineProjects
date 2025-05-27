import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DiplomasByDegreeAndSpecialtyChart = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/diplomas/stats/years-by-degree-and-specialty`)
      .then(res => setChartData(res.data))
      .catch(err => {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные для графика');
      });
  }, []);

  return (
    <div className="chart-container">
      <h3>Дипломы по годам, степеням и специальностям</h3>
      {error && <p className="error-message">{error}</p>}
      {chartData ? (
        <Line data={chartData} options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Количество дипломов' }
          }
        }} />
      ) : (
        <p>Загрузка графика...</p>
      )}
    </div>
  );
};

export default DiplomasByDegreeAndSpecialtyChart;
