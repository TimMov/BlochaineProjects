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
    const { studentName, universityName, year, diplomaHash } = req.body;

    // 3. Валидация входных данных
    if (!studentName || !universityName || !year || !diplomaHash) {
      
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' + studentName + universityName + year + diplomaHash });
    }

    // 4. Проверка формата diplomaHash (пример для IPFS)
    if (!diplomaHash.startsWith('Qm') || diplomaHash.length !== 46) {
      return res.status(400).json({ error: 'Некорректный формат хэша диплома' });
    }

    console.log('Попытка добавления диплома:', { studentName, universityName, year, diplomaHash });

    // 5. Добавление в блокчейн с обработкой газа
    const tx = await contract.addDiploma(studentName, universityName, year, diplomaHash, {
      gasLimit: 500000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });

    console.log('Транзакция отправлена, хэш:', tx.hash);

    // 6. Ожидание подтверждения
    const receipt = await tx.wait();
    console.log('Транзакция подтверждена в блоке:', receipt.blockNumber);

    // 7. Сохранение в базу данных
    const savedDiploma = await saveDiplomaToDB({
      studentName,
      universityName,
      year,
      diplomaHash,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

    // 8. Успешный ответ
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

    // 9. Специфичные ошибки Ethers.js
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
