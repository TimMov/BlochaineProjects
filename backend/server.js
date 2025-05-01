const express = require('express');
const cors = require('cors');
const diplomaRoutes = require('./routes/diplomaRoutes');
const doplomaLogin = require('./routes/auth.js')
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// ✅ Очень важно: Обработка JSON-тела запросов
app.use(express.json());

// ✅ Дополнительно: Логирование запросов (удобно при отладке)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

// Маршруты

app.use('/api', doplomaLogin)

app.use('/api', diplomaRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
