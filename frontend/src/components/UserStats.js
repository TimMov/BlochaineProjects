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

const degreeLabels = [
  { value: 'bachelor', label: 'Бакалавр' },
  { value: 'master', label: 'Магистр' },
  { value: 'phd', label: 'Кандидат наук' },
  { value: 'doctor', label: 'Доктор наук' }
];

const DiplomasByDegreeAndSpecialtyChart = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
  axios.get(`${API_BASE_URL}/api/diplomas/stats/years-by-degree-and-specialty`)
    .then(res => {
      const data = res.data;

      data.datasets = data.datasets.map(dataset => {
        const [rawDegree, code] = dataset.label.split(' / ');
        const degree = degreeLabels.find(d => d.value.toLowerCase() === rawDegree.toLowerCase());
        return {
          ...dataset,
          label: degree ? `${degree.label} / ${code}` : dataset.label
        };
      });

      setChartData(data);
    })
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
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Количество дипломов' }
            }
          }}
        />
      ) : (
        <p>Загрузка графика...</p>
      )}
    </div>
  );
};

export default DiplomasByDegreeAndSpecialtyChart;
