// backend/blockchain.js

const { ethers } = require('ethers');
const diplomaContractABI = require('./contracts/abi/DiplomaContract.json'); // ABI контракта
require('dotenv').config();

// Настройки подключения к блокчейну
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // RPC_URL берем из .env
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Адрес развернутого контракта
const contractAddress = process.env.CONTRACT_ADDRESS;

// Подключение к контракту
const contract = new ethers.Contract(contractAddress, diplomaContractABI, wallet);

// Функция для добавления диплома в блокчейн
async function addDiplomaToBlockchain({ studentName, university, degree, graduationYear }) {
    try {
        const tx = await contract.addDiploma(studentName, university, degree, graduationYear);
        const receipt = await tx.wait(); // Ждем подтверждения транзакции
        return receipt;
    } catch (error) {
        console.error('Ошибка при отправке диплома в блокчейн:', error);
        throw error;
    }
}

module.exports = {
    addDiplomaToBlockchain
};
