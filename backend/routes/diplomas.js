const express = require('express');
const router = express.Router();
const pool = require('../db');
const { addDiplomaToBlockchain } = require('../blockchain');
const crypto = require('crypto');

// Добавление диплома
router.post('/', async (req, res, next) => {
  try {
    const {
      studentName,
      university_id,
      year,
      degree_type,
      diplomaSeries,
      diplomaNumber,
      registrationNumber,
      specialty_id
    } = req.body;

    if (!studentName || !university_id || !year || !degree_type || !diplomaSeries || !diplomaNumber || !registrationNumber || !specialty_id) {
      return res.status(400).json({
        error: 'Отсутствуют обязательные поля',
        required: ['studentName', 'university_id', 'year', 'degree_type', 'diplomaSeries', 'diplomaNumber', 'registrationNumber', 'specialty_id']
      });
    }

    if (diplomaSeries.length !== 6) {
      return res.status(400).json({ error: 'Серия дипломов должна содержать ровно 6 символов.' });
    }

    if (diplomaNumber.length !== 7) {
      return res.status(400).json({ error: 'Номер диплома должен содержать ровно 7 символов.' });
    }

    if (registrationNumber.length !== 6) {
      return res.status(400).json({ error: 'Регистрационный номер должен содержать ровно 6 символов.' });
    }

    const diplomaHash = crypto.createHash('sha256')
      .update(`${studentName}${university_id}${year}${diplomaSeries}${diplomaNumber}${registrationNumber}`)
      .digest('hex');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existing = await client.query(
        `SELECT diploma_id FROM diplomas 
         WHERE diploma_series = $1 AND diploma_number = $2 AND registration_number = $3`,
        [diplomaSeries, diplomaNumber, registrationNumber]
      );

      if (existing.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'Такой диплом уже существует.' });
      }

      const dbRes = await client.query(
        `INSERT INTO diplomas 
    (student_name, university_id, year, tx_hash, status, degree_type, diploma_series, diploma_number, registration_number, specialty_id)
    VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9)
    RETURNING diploma_id`,
        [
          studentName,
          university_id,
          year,
          diplomaHash,
          degree_type,
          diplomaSeries,
          diplomaNumber,
          registrationNumber,
          specialty_id
        ]
      );

      const universityResult = await client.query(
        'SELECT name FROM universities WHERE university_id = $1',
        [university_id]
      );
      const specialtyResult = await client.query(
        'SELECT code FROM specialties WHERE specialty_id = $1',
        [specialty_id]
      );

      const universityName = universityResult.rows[0]?.name;
      const specialtyCode = specialtyResult.rows[0]?.code;

      if (!universityName || !specialtyCode) {
        throw new Error('Не удалось найти университет или специальность по ID');
      }

      const blockchainRes = await addDiplomaToBlockchain({
        studentName,
        universityName,
        year,
        diplomaHash,
        diplomaSeries,
        diplomaNumber,
        registrationNumber,
        specialty_code: specialtyCode
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

// Получение списка дипломов
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT d.diploma_id, d.student_name, u.name AS university_name, d.year, d.degree_type,
              d.diploma_series, d.diploma_number, d.registration_number, s.code AS specialty_code
       FROM diplomas d
       JOIN universities u ON d.university_id = u.university_id
       JOIN specialties s ON d.specialty_id = s.specialty_id
       ORDER BY d.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Статистика дипломов по годам и специальностям
router.get('/stats/years-by-specialty', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT d.year, s.code AS specialty_code, COUNT(*) AS diploma_count
       FROM diplomas d
       JOIN specialties s ON d.specialty_id = s.specialty_id
       GROUP BY d.year, s.code
       ORDER BY d.year DESC, s.code`
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
      datasets: specialties.map(code => ({
        label: `Специальность ${code}`,
        data: years.map(year => data[code]?.[year] || 0),
        borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        fill: false
      }))
    };

    res.json(chartData);
  } catch (error) {
    next(error);
  }
});

// Получение университетов
router.get('/universities', async (req, res) => {
  const result = await pool.query('SELECT university_id, name FROM universities ORDER BY name');
  res.json(result.rows);
});

// Получение специальностей
router.get('/specialties', async (req, res) => {
  const result = await pool.query('SELECT specialty_id, code, name FROM specialties ORDER BY code');
  res.json(result.rows);
});

module.exports = router;
