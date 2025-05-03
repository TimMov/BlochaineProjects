const express = require('express');
const router = express.Router();
const pool = require('../db');
const { storeInBlockchain } = require('../blockchain');
const crypto = require('crypto');

// Маршрут для создания диплома
router.post('/', async (req, res, next) => {
  try {
    const { studentName, universityName, year } = req.body;
    
    if (!studentName || !universityName || !year) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['studentName', 'universityName', 'year']
      });
    }

    const diplomaHash = crypto.createHash('sha256')
      .update(`${studentName}${universityName}${year}`)
      .digest('hex');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Сохраняем в PostgreSQL
      const dbRes = await client.query(
        `INSERT INTO diplomas 
         (student_name, university_name, year, diploma_hash, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING diploma_id`,
        [studentName, universityName, year, diplomaHash]
      );

      // Сохраняем в блокчейн
      const blockchainRes = await storeInBlockchain(
        studentName,
        universityName,
        year,
        diplomaHash
      );

      // Обновляем статус
      await client.query(
        `UPDATE diplomas SET 
         tx_hash = $1, block_number = $2, status = 'confirmed'
         WHERE diploma_id = $3`,
        [blockchainRes.txHash, blockchainRes.blockNumber, dbRes.rows[0].diploma_id]
      );

      await client.query('COMMIT');
      
      res.json({
        success: true,
        diplomaId: dbRes.rows[0].diploma_id,
        txHash: blockchainRes.txHash
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Маршрут для получения списка дипломов
// router.get('/', async (req, res, next) => {
//   try {
//     const result = await pool.query(
//       `SELECT diploma_id, student_name, university_name, degree_type, tx_hash
//        FROM diplomas
//        ORDER BY created_at DESC`
//     );
//     res.json(result.rows);
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = router;  // Важно: экспортируем router, а не объект