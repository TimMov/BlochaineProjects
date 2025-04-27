const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const diplomasRoutes = require('./routes/diplomas');

app.use('/api/auth', authRoutes);
app.use('/api/diplomas', diplomasRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const { addDiploma } = require('./blockchain');

// Тестовый вызов (удалите после проверки)
async function test() {
  try {
    const result = await addDiploma(
      "Иванов Иван",
      "МГУ",
      2023
    );
    console.log('Транзакция успешна:', result);
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

test();