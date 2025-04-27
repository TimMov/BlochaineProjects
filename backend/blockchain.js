// Убедитесь, что используете ES-модули или CommonJS единообразно
require('dotenv').config();

// Для Web3.js v4.x+ (рекомендуемая версия)
const { Web3 } = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

// Проверка переменных окружения
if (!process.env.ADMIN_PRIVATE_KEY || !process.env.INFURA_URL) {
  throw new Error('Missing environment variables');
}

// Инициализация провайдера
const provider = new HDWalletProvider({
  privateKeys: [process.env.ADMIN_PRIVATE_KEY],
  providerOrUrl: process.env.INFURA_URL
});

// Создание экземпляра Web3
const web3 = new Web3(provider);

// Получение ABI контракта
const contractABI = [
  {
    inputs: [
      { internalType: "string", name: "studentName", type: "string" },
      { internalType: "string", name: "universityName", type: "string" },
      { internalType: "uint256", name: "year", type: "uint256" }
    ],
    name: "addDiploma",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getDiplomasCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getDiploma",
    outputs: [
      { internalType: "string", name: "studentName", type: "string" },
      { internalType: "string", name: "universityName", type: "string" },
      { internalType: "uint256", name: "year", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "removeDiploma",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];
const contractAddress = process.env.CONTRACT_ADDRESS;

// Инициализация контракта
const contract = new web3.eth.Contract(contractABI, contractAddress);

module.exports = {
  web3, // Экспортируем для использования в других файлах
  contract,
  addDiploma: async (studentName, university, year) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const tx = await contract.methods.addDiploma(
        studentName,
        university,
        year
      ).send({
        from: accounts[0],
        gas: 500000
      });
      
      return {
        txHash: tx.transactionHash,
        blockNumber: tx.blockNumber
      };
    } catch (err) {
      console.error('Blockchain error:', err);
      throw new Error('Failed to add diploma to blockchain: ' + err.message);
    }
  }
};