const express = require('express');
const router = express.Router();
const { addDiploma } = require('../controllers/diplomaController');
const { getTotalDiplomaCount } = require('../models/diplomaModel');

// POST /api/diplomas
router.post('/', addDiploma);

router.get('/stats/total', async (req, res) => {
    try {
        const count = await getTotalDiplomaCount();
        res.json({ success: true, total: count });
    } catch (error) {
        console.error('Ошибка при получении общей статистики:', error);
        res.status(500).json({ success: false, message: 'Ошибка при получении статистики' });
    }
});

router.get('/', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM diplomas ORDER BY id DESC;');
      res.json({ success: true, diplomas: result.rows });
    } catch (err) {
      console.error('Ошибка при получении дипломов:', err);
      res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
  });

module.exports = router;
