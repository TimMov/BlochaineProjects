const express = require('express');
const router = express.Router();
const pool = require('../db');
const { storeInBlockchain } = require('../blockchain');
const crypto = require('crypto');

router.post('/', async (req, res) => {
  // 1. Валидация входных данных
  const { studentName, universityName, year, creatorId } = req.body;
  
  if (!studentName || !universityName || !year || !creatorId) {
    return res.status(400).json({ 
      error: 'All fields are required',
      requiredFields: ['studentName', 'universityName', 'year', 'creatorId']
    });
  }

  try {
    // 2. Генерация хэша диплома
    const diplomaHash = crypto.createHash('sha256')
      .update(`${studentName}${universityName}${year}${creatorId}`)
      .digest('hex');

    // 3. Начало транзакции в PostgreSQL
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 4. Сохранение в PostgreSQL
      const insertRes = await client.query(
        `INSERT INTO diplomas 
         (student_name, university_name, year, status, creator_id, created_at)
         VALUES ($1, $2, $3, 'pending', $4, NOW())
         RETURNING diploma_id`,
        [studentName, universityName, year, creatorId]
      );

      const diplomaId = insertRes.rows[0].diploma_id;
      console.log(`Diploma record created with ID: ${diplomaId}`);

      // 5. Запись в блокчейн
      let txHash, blockNumber;
      try {
        console.log(`Attempting to store in blockchain with hash: 0x${diplomaHash}`);
        const blockchainRes = await storeInBlockchain(`0x${diplomaHash}`);
        
        if (!blockchainRes || !blockchainRes.txHash) {
          throw new Error('Blockchain response is invalid');
        }

        txHash = blockchainRes.txHash;
        blockNumber = blockchainRes.blockNumber;
        console.log(`Blockchain storage successful. TX Hash: ${txHash}, Block: ${blockNumber}`);
      } catch (blockchainError) {
        console.error('Blockchain transaction failed:', {
          error: blockchainError.message,
          stack: blockchainError.stack,
          diplomaId,
          diplomaHash: `0x${diplomaHash}`
        });
        
        // Обновляем статус в БД на 'failed'
        await client.query(
          `UPDATE diplomas SET status = 'failed' WHERE diploma_id = $1`,
          [diplomaId]
        );
        
        await client.query('ROLLBACK');
        return res.status(502).json({ 
          error: 'Blockchain operation failed',
          details: blockchainError.message,
          diplomaId,
          internalCode: 'BLOCKCHAIN_REVERTED'
        });
      }

      // 6. Обновление записи в БД
      await client.query(
        `UPDATE diplomas SET 
         tx_hash = $1, block_number = $2, status = 'confirmed'
         WHERE diploma_id = $3`,
        [txHash, blockNumber, diplomaId]
      );

      await client.query('COMMIT');
      console.log(`Transaction committed for diploma ID: ${diplomaId}`);

      // 7. Успешный ответ
      res.json({
        success: true,
        diplomaId,
        txHash,
        blockNumber,
        diplomaHash: `0x${diplomaHash}`,
        timestamp: new Date().toISOString()
      });

    } catch (dbError) {
      console.error('Database transaction error:', {
        error: dbError.message,
        stack: dbError.stack,
        query: dbError.query,
        parameters: dbError.parameters
      });
      
      await client.query('ROLLBACK');
      return res.status(500).json({ 
        error: 'Database operation failed',
        details: dbError.message,
        internalCode: 'DATABASE_ERROR'
      });
    } finally {
      client.release();
    }

  } catch (err) {
    console.error('System error:', {
      error: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    
    res.status(500).json({ 
      error: 'Failed to store diploma',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      internalCode: 'SYSTEM_ERROR'
    });
  }
});

module.exports = router;