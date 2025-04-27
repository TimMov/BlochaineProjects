const { ethers } = require('ethers');
require('dotenv').config();

// Проверка конфигурации
function validateConfig() {
  const required = ['BLOCKCHAIN_URL', 'PRIVATE_KEY', 'CONTRACT_ADDRESS'];
  const errors = [];

  required.forEach(key => {
    if (!process.env[key]) errors.push(`Missing ${key} in .env`);
  });

  if (errors.length > 0) throw new Error(errors.join('\n'));
}

// Инициализация блокчейн-подключения
function initBlockchain() {
  validateConfig();

  const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const contractABI = require('../contracts/abi/DiplomaContract.json');
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractABI,
    wallet
  );

  return { provider, wallet, contract };
}

// Методы для работы с контрактом
async function addDiplomaToBlockchain(contract, data) {
  const tx = await contract.addDiploma(
    data.studentName,
    data.universityName,
    data.year,
    data.diplomaHash
  );
  const receipt = await tx.wait();
  return receipt;
}

module.exports = {
  initBlockchain,
  addDiplomaToBlockchain
};