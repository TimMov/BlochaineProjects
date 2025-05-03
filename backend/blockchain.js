// backend/blockchain.js

const { ethers } = require('ethers');
const diplomaContractABI = require('./contracts/abi/DiplomaContract.json'); // ABI контракта
require('dotenv').config();

// Настройки подключения к блокчейну
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // RPC_URL из .env
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Адрес развернутого контракта
const contractAddress = process.env.CONTRACT_ADDRESS;

// Подключение к контракту
const contract = new ethers.Contract(contractAddress, diplomaContractABI, wallet);

// Функция для добавления диплома в блокчейн
async function addDiplomaToBlockchain({
    studentName,
    universityName,
    year,
    diplomaHash,
    diplomaSeries,
    diplomaNumber,
    registrationNumber,
    specialty_code
}) {
    try {
        const tx = await contract.addDiploma(
            studentName,
            universityName,
            Number(year),
            diplomaHash,
            diplomaSeries,
            diplomaNumber,
            registrationNumber,
            specialty_code
        );
        const receipt = await tx.wait();
        return receipt;
    } catch (error) {
        console.error('Ошибка при отправке диплома в блокчейн:', error);
        console.error(studentName, universityName, year, diplomaHash, diplomaSeries, diplomaNumber, registrationNumber, specialty_code);
        throw error;
    }
}

module.exports = {
    addDiplomaToBlockchain
};
