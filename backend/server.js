const express = require('express');
const cors = require('cors');
const diplomasRouter = require('./routes/diplomas');
const { provider, wallet } = require('./blockchain');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Роуты
app.use('/api/diplomas', diplomasRouter);  // Теперь передается правильный middleware

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Проверка подключений при старте
async function startupChecks() {
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log(`Connected to blockchain (Block: ${blockNumber})`);
    console.log(`Wallet address: ${wallet.address}`);
  } catch (error) {
    console.error('Startup checks failed:', error);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await startupChecks();
});