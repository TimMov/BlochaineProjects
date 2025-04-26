const pool = require('../database');
const { contract } = require('../blockchain');
const diplomaModel = require('../models/diplomaModel');
const crypto = require('crypto');

exports.addDiploma = async (req, res) => {
  try {
    const { student_name, university_name, year, creator_id } = req.body;

    // 1. Сохраняем диплом в базу данных
    const diploma = await diplomaModel.createDiploma({
      student_name,
      university_name,
      year,
      creator_id,
    });

    // 2. Генерируем хэш диплома
    const dataToHash = `${student_name}-${university_name}-${year}`;
    const diplomaHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    // 3. Отправляем хэш в блокчейн
    const tx = await contract.addDiploma(diplomaHash, student_name, year);
    const receipt = await tx.wait();

    // 4. Обновляем диплом в БД после подтверждения
    await diplomaModel.updateDiplomaBlockchainData(
      diploma.diploma_id,
      receipt.hash,
      receipt.blockNumber
    );

    res.status(201).json({ message: 'Diploma saved and recorded on blockchain.', diploma });
  } catch (error) {
    console.error('Error adding diploma:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
