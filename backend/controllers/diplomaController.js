// backend/controllers/diplomaController.js

const { addDiplomaToBlockchain } = require('../blockchain');

const addDiploma = async (req, res) => {
  try {
    const { studentName, universityName, year, diplomaHash } = req.body;

    // Сначала записываем в блокчейн
    const tx = await addDiplomaToBlockchain(studentName, universityName, year, diplomaHash);

    // Временно просто возвращаем успешный ответ
    res.status(201).json({
      message: 'Diploma added successfully!',
      transactionHash: tx.hash,
    });
  } catch (error) {
    console.error('Ошибка при добавлении диплома:', error);
    res.status(500).json({ message: 'Ошибка при добавлении диплома', error: error.message });
  }
};

module.exports = { addDiploma };
