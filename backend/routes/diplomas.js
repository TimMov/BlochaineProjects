const express = require('express');
const router = express.Router();
const pool = require('../db');
const { addDiplomaToBlockchain } = require('../blockchain');
const crypto = require('crypto');

// Маршрут для создания диплома
router.post('/', async (req, res, next) => {
  try {
    const { studentName, universityName, year, degree_type, diplomaSeries, diplomaNumber, registrationNumber, specialty_code } = req.body;

    // Проверка обязательных полей
    if (!studentName || !universityName || !year || !degree_type || !diplomaSeries || !diplomaNumber || !registrationNumber || !specialty_code) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['studentName', 'universityName', 'year', 'degree_type', 'diplomaSeries', 'diplomaNumber', 'registrationNumber', 'specialty_code']
      });
    }

    // Валидация формата диплома
    if (diplomaSeries.length !== 6) {
      return res.status(400).json({
        error: 'Diploma series must be exactly 6 characters long.'
      });
    }

    // Валидация номера диплома
    if (diplomaNumber.length !== 7) {
      return res.status(400).json({
        error: 'Diploma number must be exactly 7 characters long.'
      });
    }

    // Валидация регистрационного номера
    if (registrationNumber.length !== 6) {
      return res.status(400).json({
        error: 'Registration number must be exactly 6 characters long.'
      });
    }

    // Валидация кода специальности
    if (specialty_code.length !== 8) {
      return res.status(400).json({
        error: 'Specialty code must be exactly 8 characters long.'
      });
    }

    // Создание хеша диплома
    const diplomaHash = crypto.createHash('sha256')
      .update(`${studentName}${universityName}${year}${diplomaSeries}${diplomaNumber}${registrationNumber}`)
      .digest('hex');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Проверка на наличие такого диплома
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

      // Сохраняем в PostgreSQL
      console.log(diplomaHash);
      const dbRes = await client.query(
        `INSERT INTO diplomas 
         (student_name, university_name, year, tx_hash, status, degree_type, diploma_series, diploma_number, registration_number, specialty_code)
         VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9)
         RETURNING diploma_id`,
        [studentName, universityName, year, diplomaHash, degree_type, diplomaSeries, diplomaNumber, registrationNumber, specialty_code]
      );

      // Сохраняем в блокчейн
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

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT diploma_id, student_name, university_name, year, degree_type, diploma_series, diploma_number, registration_number
       FROM diplomas
       ORDER BY created_at DESC`
    );
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
    
    // Формируем данные для графика
    const data = result.rows.reduce((acc, row) => {
      if (!acc[row.year]) {
        acc[row.year] = {};
      }
      acc[row.year][row.specialty_code] = row.diploma_count;
      return acc;
    }, {});

    // Преобразуем данные для удобного отображения
    const years = Object.keys(data);
    const specialties = new Set();

    years.forEach(year => {
      Object.keys(data[year]).forEach(specialty => {
        specialties.add(specialty);
      });
    });

    // Формируем массивы для графика
    const chartData = {
      labels: years.reverse(), // Года
      datasets: Array.from(specialties).map(specialty => ({
        label: `Специальность ${specialty}`,
        data: years.map(year => data[year]?.[specialty] || 0),
        borderColor: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Генерация случайного цвета для каждой линии
        fill: false,
      })),
    };

    res.json(chartData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
