const express = require('express');
const cors = require('cors');
const diplomaRoutes = require('./routes/diplomaRoutes');
const authRoutes = require('./routes/auth');
const diplomaApiRoutes = require('./routes/diplomas');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/diplomas', diplomaApiRoutes);
app.use('/api/diplomas', diplomaRoutes);
app.use('/api/auth', authRoutes); // <-- Добавлено

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
