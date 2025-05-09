import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Плагин для подписей на графике

// Регистрация компонентов Chart.js и плагина для подписей
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // Регистрация плагина
);

const DiplomaStatistics = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/diplomas/stats/years-by-specialty`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        console.log(response.data);

        // Получаем все уникальные года
        const years = [...new Set(data.datasets.flatMap(dataset => dataset.data.map((_, index) => data.labels[index])))];

        // Получаем специальности
        const labels = data.datasets.map(dataset => dataset.label);

        // Преобразуем данные в формат для гистограммы
        const datasets = data.datasets.map((dataset, index) => ({
          label: dataset.label,
          data: years.map(year => {
            const yearIndex = data.labels.indexOf(year);
            return dataset.data[yearIndex] || 0;
          }),
          backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          borderWidth: 1,
          fill: true, // Устанавливаем заполнение для столбиков
        }));

        setChartData({
          labels: years, // В labels теперь находятся года
          datasets,
        });
        setIsLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке статистики');
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="statistics-container">
      <h2>График дипломов по направлениям и годам</h2>
      <div className="chart-container">
        {chartData && (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Количество дипломов по годам и направлениям',
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      return `${context.dataset.label}: ${context.raw}`;
                    },
                  },
                },
                datalabels: {
                  display: true,
                  align: 'center',
                  anchor: 'end',
                  color: 'black',
                  font: {
                    weight: 'bold',
                    size: 12,
                  },
                  formatter: function (value) {
                    return value;
                  },
                },
              },
              legend: {
                display: true,
                position: 'top',
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Годы',
                  },
                  stacked: false,
                },
                y: {
                  title: {
                    display: true,
                    text: 'Количество дипломов',
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DiplomaStatistics;
