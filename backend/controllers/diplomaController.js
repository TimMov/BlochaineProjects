const { saveDiplomaToDB } = require('../models/diplomaModel');
const { ethers } = require('ethers');
const contractJson = require('D:/Goland/BlochaineProjects/blockchain/artifacts/contracts/ItContract.sol/DiplomaContract.json');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractJson.abi, wallet);

async function addDiploma(req, res) {
  try {
    const {
      student_name: studentName,
      university_name: universityName,
      graduation_year: year,
      degree_type: degreeType
    } = req.body;

    // Проверка наличия всех полей
    if (
      typeof studentName !== 'string' || studentName.trim() === '' ||
      typeof universityName !== 'string' || universityName.trim() === '' ||
      typeof degreeType !== 'string' || degreeType.trim() === '' ||
      typeof year === 'undefined' || year === null || year === ''
    ) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    const validDegrees = ['bachelor', 'master', 'phd', 'doctor'];
    if (!validDegrees.includes(degreeType)) {
      return res.status(400).json({ error: 'Недопустимое значение степени' });
    }

    console.log('Попытка добавления диплома:', { studentName, universityName, year, degreeType });

    // Вызов контракта (предполагаем, что контракт теперь принимает degreeType вместо diplomaHash)
    const tx = await contract.addDiploma(studentName, universityName, year, degreeType, {
      gasLimit: 500000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });

    console.log('Транзакция отправлена, хэш:', tx.hash);

    const receipt = await tx.wait();
    console.log('Транзакция подтверждена в блоке:', receipt.blockNumber);

    // Сохраняем в БД
    const savedDiploma = await saveDiplomaToDB({
      studentName,
      universityName,
      year,
      degreeType,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

    return res.status(201).json({
      success: true,
      message: 'Диплом успешно добавлен',
      diploma: savedDiploma,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('Полная информация об ошибке:', {
      message: error.message,
      reason: error.reason,
      stack: error.stack
    });

    if (error.code === 'INVALID_ARGUMENT') {
      return res.status(400).json({ error: 'Некорректные параметры транзакции' });
    }
    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({ error: 'Ошибка подключения к блокчейну' });
    }

    return res.status(500).json({
      error: 'Ошибка при добавлении диплома',
      details: error.reason || error.message
    });
  }
}

module.exports = { addDiploma };
