require('dotenv').config();
const { ethers } = require('ethers');
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
  ]; // ABI твоего смарт-контракта

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  wallet
);

module.exports = { provider, wallet, contract };
