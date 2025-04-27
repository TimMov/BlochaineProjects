const express = require('express');
const cors = require('cors');
const { initBlockchain } = require('./blockchain');
const diplomasRouter = require('./routes/diplomas');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());

// Инициализация блокчейна при старте
app.locals.blockchain = initBlockchain();

// Роуты
app.use('/api/diplomas', diplomasRouter);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connected to blockchain: ${process.env.BLOCKCHAIN_URL}`);
});