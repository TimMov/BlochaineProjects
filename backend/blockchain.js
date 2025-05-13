const { ethers } = require('ethers');
const diplomaContractABI = require('./contracts/abi/DiplomaContract.json'); // ABI контракта
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractAddress = process.env.CONTRACT_ADDRESS;

const contract = new ethers.Contract(contractAddress, diplomaContractABI, wallet);

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
