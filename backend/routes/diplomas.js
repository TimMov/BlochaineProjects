const express = require('express');
const router = express.Router();
const pool = require('../db');
const { storeInBlockchain } = require('../blockchain');
const crypto = require('crypto');

router.post('/', async (req, res) => {
  const { studentName, university, year, studentId, creatorId } = req.body;

  try {
    // 1. Генерируем хэш диплома
    const diplomaHash = crypto.createHash('sha256')
      .update(`${studentName}${university}${year}${studentId}`)
      .digest('hex');

    // 2. Сохраняем в PostgreSQL
    const dbRes = await pool.query(
      `INSERT INTO diplomas 
       (student_name, university, year, student_id, diploma_hash, creator_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [studentName, university, year, studentId, diplomaHash, creatorId]
    );

    // 3. Пишем в блокчейн
    const { txHash, blockNumber } = await storeInBlockchain(`0x${diplomaHash}`);

    // 4. Обновляем запись в БД с данными из блокчейна
    await pool.query(
      `UPDATE diplomas SET 
       tx_hash = $1, block_number = $2, status = 'confirmed'
       WHERE id = $3`,
      [txHash, blockNumber, dbRes.rows[0].id]
    );

    res.json({
      success: true,
      diplomaId: dbRes.rows[0].id,
      txHash,
      blockNumber
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to store diploma' });
  }
});