require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Инициализация приложения
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Тестовый маршрут
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'API работает',
      dbTime: result.rows[0].now
    });
  } catch (err) {
    console.error('Ошибка БД:', err);
    res.status(500).json({ error: 'Ошибка подключения к БД' });
  }
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    pool.end();
    console.log('Сервер остановлен');
    process.exit(0);
  });
});