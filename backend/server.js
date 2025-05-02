const express = require('express');
const cors = require('cors');
const diplomaRoutes = require('./routes/diplomaRoutes');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', diplomaRoutes);
app.use('/api/auth', authRoutes); // <-- Добавлено

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/api/diplomas', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, student_name, university_name, graduation_year, degree_type 
      FROM diplomas 
      ORDER BY graduation_year DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении дипломов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});