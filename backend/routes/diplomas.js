const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db');

// Получение всех дипломов (доступно всем авторизованным)
router.get('/', auth, async (req, res) => {
  try {
    const diplomas = await pool.query('SELECT * FROM diplomas');
    res.json(diplomas.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Добавление диплома (только для admin)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const { student_name, university_name, year, tx_hash, block_number } = req.body;
    const newDiploma = await pool.query(
      'INSERT INTO diplomas (student_name, university_name, year, tx_hash, block_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [student_name, university_name, year, tx_hash, block_number]
    );
    res.json(newDiploma.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;