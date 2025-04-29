const db = require('../db');

async function saveDiplomaToDB({ studentName, universityName, year, diplomaHash }) {
  const query = `
    INSERT INTO diplomas (student_name, university_name, year, diploma_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [studentName, universityName, year, diplomaHash];
  const result = await db.query(query, values);
  return result.rows[0];
}

module.exports = {
  saveDiplomaToDB,
};
