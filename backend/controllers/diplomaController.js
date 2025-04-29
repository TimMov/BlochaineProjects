const { saveDiplomaToDB } = require('../models/diplomaModel');
const { ethers } = require('ethers');
const contractJson = require('../blockchain/artifacts/contracts/ItContract.sol/DiplomaContract.json');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractJson.abi, wallet);

async function addDiploma(req, res) {
  try {
    const { studentName, universityName, year, diplomaHash } = req.body;

    // 1. Добавление в блокчейн
    const tx = await contract.addDiploma(studentName, universityName, year, diplomaHash);
    await tx.wait();

    // 2. Сохранение в БД
    const savedDiploma = await saveDiplomaToDB({ studentName, universityName, year, diplomaHash });

    res.status(201).json({ message: 'Diploma added successfully', diploma: savedDiploma });
  } catch (error) {
    console.error('Ошибка при добавлении диплома:', error);
    res.status(500).json({ error: 'Не удалось добавить диплом' });
  }
}

module.exports = {
  addDiploma,
};
