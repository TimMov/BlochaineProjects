// backend/server.js

const express = require('express');
const cors = require('cors');
const app = express();
const diplomaRoutes = require('./routes/diplomaRoutes'); // Добавили роуты дипломов

// Middlewares
app.use(cors());
app.use(express.json());

// Роуты
app.use('/api/diplomas', diplomaRoutes);

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
