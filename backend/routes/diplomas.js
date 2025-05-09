const express = require('express');
const router = express.Router();
const pool = require('../db');
const { addDiplomaToBlockchain } = require('../blockchain');
const crypto = require('crypto');

router.post('/', async (req, res, next) => {
  try {
    const { studentName, universityName, year, degree_type, diplomaSeries, diplomaNumber, registrationNumber, specialty_code } = req.body;

    if (!studentName || !universityName || !year || !degree_type || !diplomaSeries || !diplomaNumber || !registrationNumber || !specialty_code) {
      return res.status(400).json({
        error: 'Отсутствуют обязательные поля',
        required: ['studentName', 'universityName', 'year', 'degree_type', 'diplomaSeries', 'diplomaNumber', 'registrationNumber', 'specialty_code']
      });
    }

    if (diplomaSeries.length !== 6) {
      return res.status(400).json({
        error: 'Серия дипломов должна содержать ровно 6 символов.'
      });
    }

    if (diplomaNumber.length !== 7) {
      return res.status(400).json({
        error: 'Длина номера диплома должна составлять ровно 7 символов.'
      });
    }

    if (registrationNumber.length !== 6) {
      return res.status(400).json({
        error: 'Регистрационный номер должен содержать ровно 6 символов.'
      });
    }

    if (specialty_code.length !== 8) {
      return res.status(400).json({
        error: 'Код специальности должен содержать ровно 8 символов.'
      });
    }

    const diplomaHash = crypto.createHash('sha256')
      .update(`${studentName}${universityName}${year}${diplomaSeries}${diplomaNumber}${registrationNumber}`)
      .digest('hex');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existing = await client.query(
        `SELECT diploma_id FROM diplomas 
          WHERE diploma_series = $1 and diploma_number = $2 and registration_number = $3`,
        [diplomaSeries, diplomaNumber, registrationNumber]
      );

      if (existing.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'Диплом с той же серией, номером и регистрационным знаком уже существует.'
        });
      }

      console.log(diplomaHash);
      const dbRes = await client.query(
        `INSERT INTO diplomas 
         (student_name, university_name, year, tx_hash, status, degree_type, diploma_series, diploma_number, registration_number, specialty_code)
         VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9)
         RETURNING diploma_id`,
        [studentName, universityName, year, diplomaHash, degree_type, diplomaSeries, diplomaNumber, registrationNumber, specialty_code]
      );

      const blockchainRes = await addDiplomaToBlockchain({
        studentName,
        universityName,
        year,
        diplomaHash,
        diplomaSeries,
        diplomaNumber,
        registrationNumber,
        specialty_code
      });

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

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT diploma_id, student_name, university_name, year, degree_type, diploma_series, diploma_number, registration_number, year, specialty_code
       FROM diplomas
       ORDER BY created_at DESC`
    );
    console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get('/stats/years-by-specialty', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT year, specialty_code, COUNT(*) AS diploma_count
       FROM diplomas
       GROUP BY year, specialty_code
       ORDER BY year DESC, specialty_code`
    );
    
    const data = result.rows.reduce((acc, row) => {
      if (!acc[row.specialty_code]) {
        acc[row.specialty_code] = {};
      }
      acc[row.specialty_code][row.year] = row.diploma_count;
      return acc;
    }, {});

    const specialties = Object.keys(data);
    const years = Array.from(new Set(Object.values(data).flatMap(item => Object.keys(item)))).sort();

    const chartData = {
      labels: years, 
      datasets: specialties.map(specialty => ({
        label: `Специальность ${specialty}`,
        data: years.map(year => data[specialty]?.[year] || 0),
        borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        fill: false,
        backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      })),
    };

    res.json(chartData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
