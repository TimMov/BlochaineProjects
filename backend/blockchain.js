const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config();

// Исправленный путь к ABI
const contractABI = require(path.join(__dirname, 'contracts', 'abi', 'DiplomaContract.json'));

// Инициализация провайдера
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL);

// Инициализация кошелька
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Инициализация контракта
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  wallet
);

// Методы для работы с контрактом
const storeInBlockchain = async (studentName, universityName, year, diplomaHash) => {
  const tx = await contract.addDiploma(studentName, universityName, year, diplomaHash);
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber
  };
};

const getDiplomasFromBlockchain = async () => {
  const count = await contract.getDiplomasCount();
  const diplomas = [];
  
  for (let i = 0; i < Number(count); i++) {
    const diploma = await contract.diplomas(i);
    diplomas.push({
      id: i,
      studentName: diploma[0],
      universityName: diploma[1],
      year: Number(diploma[2]),
      diplomaHash: diploma[3]
    });
  }
  
  return diplomas;
};

module.exports = {
  contract,
  provider,
  wallet,
  storeInBlockchain,
  getDiplomasFromBlockchain
};