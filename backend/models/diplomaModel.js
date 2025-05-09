const db = require('../db');

async function saveDiplomaToDB({ studentName, universityName, year, degree_Type, diploma_series, diploma_number, registration_number, specialty_code, txHash, blockNumber }) {
  const query = `
    INSERT INTO diplomas (student_name, university_name, year, degree_Type, diploma_series, diploma_number, registration_number, specialty_code, tx_Hash, block_Number)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const values = [studentName, universityName, year, degree_Type, diploma_series, diploma_number, registration_number, specialty_code, txHash, blockNumber];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function getTotalDiplomaCount() {
  const result = await db.query('SELECT COUNT(*) FROM diplomas;');
  return result.rows[0].count; // Это будет строка, поэтому лучше сразу parseInt
}

async function getAllDiplomas() {
  const result = await db.query('SELECT * FROM diplomas ORDER BY id DESC;');
  return result.rows;
}

module.exports = {
  saveDiplomaToDB,
  getTotalDiplomaCount,
  getAllDiplomas
};