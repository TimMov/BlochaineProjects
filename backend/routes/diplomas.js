const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');

router.post('/', async (req, res) => {
  const { studentName, universityName, year } = req.body;
  
  // Валидация
  if (!studentName || !universityName || !year) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: { studentName, universityName, year }
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Генерация хэша
    const diplomaHash = crypto.createHash('sha256')
      .update(`${studentName}${universityName}${year}`)
      .digest('hex');

    // 2. Сохранение в PostgreSQL
    const dbRes = await client.query(
      `INSERT INTO diplomas 
       (student_name, university_name, year, diploma_hash, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id`,
      [studentName, universityName, year, diplomaHash]
    );

    // 3. Запись в блокчейн
    const receipt = await req.app.locals.blockchain.contract.addDiploma(
      studentName,
      universityName,
      year,
      diplomaHash
    );

    // 4. Обновление статуса
    await client.query(
      `UPDATE diplomas SET 
       tx_hash = $1, block_number = $2, status = 'confirmed'
       WHERE id = $3`,
      [receipt.hash, receipt.blockNumber, dbRes.rows[0].id]
    );

    await client.query('COMMIT');
    
    res.json({
      success: true,
      txHash: receipt.hash,
      diplomaId: dbRes.rows[0].id
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction failed:', error);
    res.status(500).json({ 
      error: 'Transaction failed',
      details: error.message 
    });
  } finally {
    client.release();
  }
});