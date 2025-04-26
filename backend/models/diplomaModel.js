const pool = require('../database');

exports.createDiploma = async ({ student_name, university_name, year, creator_id }) => {
  const result = await pool.query(
    `INSERT INTO diplomas (student_name, university_name, year, creator_id, status, created_at)
     VALUES ($1, $2, $3, $4, 'pending', NOW())
     RETURNING *`,
    [student_name, university_name, year, creator_id]
  );
  return result.rows[0];
};

exports.updateDiplomaBlockchainData = async (diploma_id, tx_hash, block_number) => {
  await pool.query(
    `UPDATE diplomas
     SET tx_hash = $1, block_number = $2, status = 'confirmed'
     WHERE diploma_id = $3`,
    [tx_hash, block_number, diploma_id]
  );
};
