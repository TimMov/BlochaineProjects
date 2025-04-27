require('dotenv').config();
const { Web3 } = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

// Проверка обязательных переменных окружения
const requiredEnvVars = ['ADMIN_PRIVATE_KEY', 'INFURA_URL', 'CONTRACT_ADDRESS'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Инициализация провайдера с улучшенной обработкой ошибок
const initProvider = () => {
  try {
    return new HDWalletProvider({
      privateKeys: [
        process.env.ADMIN_PRIVATE_KEY.startsWith('0x') 
          ? process.env.ADMIN_PRIVATE_KEY 
          : '0x' + process.env.ADMIN_PRIVATE_KEY
      ],
      providerOrUrl: process.env.INFURA_URL,
      pollingInterval: 10000 // Опционально: интервал опроса в мс
    });
  } catch (err) {
    console.error('Provider initialization failed:', err);
    throw new Error('Failed to initialize blockchain provider');
  }
};

const provider = initProvider();
const web3 = new Web3(provider);

// Полный ABI контракта DiplomaRegistry (должен соответствовать вашему смарт-контракту)
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "universityName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "year",
        "type": "uint256"
      }
    ],
    "name": "DiplomaAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_studentName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_universityName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_year",
        "type": "uint256"
      }
    ],
    "name": "addDiploma",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDiplomasCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getDiploma",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Инициализация контракта
const contract = new web3.eth.Contract(
  contractABI, 
  process.env.CONTRACT_ADDRESS,
  {
    gas: 500000,
    gasPrice: '10000000000' // 10 Gwei (можно динамически получать через web3.eth.getGasPrice())
  }
);

/**
 * Функция для записи хэша диплома в блокчейн
 * @param {string} diplomaHash - Хэш данных диплома (с префиксом 0x)
 * @returns {Promise<{txHash: string, blockNumber: number}>} - Результат транзакции
 */
const storeInBlockchain = async (diplomaHash) => {
  try {
    // 1. Получаем аккаунты
    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts available');
    }

    // 2. Отправляем транзакцию
    const tx = await contract.methods.addDiploma(
      diplomaHash, // В вашем случае нужно передавать хэш
      '',          // Поля studentName и university можно оставить пустыми
      0            // если храните только хэш в блокчейне
    ).send({
      from: accounts[0],
      gas: 500000
    });

    // 3. Проверяем статус транзакции
    const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
    if (!receipt.status) {
      throw new Error('Transaction failed');
    }

    return {
      txHash: tx.transactionHash,
      blockNumber: tx.blockNumber,
      gasUsed: tx.gasUsed
    };

  } catch (err) {
    console.error('Blockchain operation failed:', err);
    throw new Error(`Blockchain error: ${err.message}`);
  }
};

// Экспортируемые функции
module.exports = {
  web3,
  contract,
  storeInBlockchain, // Основная функция для сохранения в блокчейн
  
  // Вспомогательные функции
  getCurrentBlock: async () => {
    return await web3.eth.getBlockNumber();
  },
  
  getTransaction: async (txHash) => {
    return await web3.eth.getTransaction(txHash);
  },
  
  // Функция для безопасного завершения работы
  shutdown: () => {
    if (provider && provider.engine) {
      provider.engine.stop();
    }
  }
};