const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Укажите адрес вашего фронтенда
  credentials: true
}));
app.use(express.json());

// Роуты
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server error!');
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});