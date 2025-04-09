import { useState, useEffect } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import ItContract from './contracts/ItContract.json';

// Убедитесь, что этот адрес соответствует развернутому контракту
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

export default function App() {
  const [contract, setContract] = useState(null);
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          throw new Error("Please install MetaMask!");
        }

        const provider = new BrowserProvider(window.ethereum);
        
        // Проверка сети
        const network = await provider.getNetwork();
        console.log("Connected to network:", network);
        
        if (network.chainId !== 31337n) { // Проверка для Hardhat
          throw new Error("Please connect to Hardhat local network (chainId: 31337)");
        }

        // Получаем аккаунты
        const accounts = await provider.send("eth_requestAccounts", []);
        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found");
        }
        setCurrentAccount(accounts[0]);

        // Создаем экземпляр контракта
        const signer = await provider.getSigner();
        const contract = new Contract(
          CONTRACT_ADDRESS, 
          ItContract.abi, 
          signer
        );
        
        setContract(contract);
        
        // Проверка доступности методов контракта
        try {
          console.log("Checking contract methods...");
          await contract.getDiplomasCount();
          console.log("Contract methods available");
        } catch (err) {
          console.error("Contract method check failed:", err);
          throw new Error("Contract methods not available. Check ABI and address.");
        }
        
        await loadDiplomas(contract);
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      // Очистка при размонтировании
    };
  }, []);

  const loadDiplomas = async (contract) => {
    try {
      console.log("Loading diplomas...");
      
      // 1. Проверяем количество дипломов
      const count = await contract.getDiplomasCount();
      console.log("Diplomas count:", count.toString());
      
      // 2. Получаем дипломы
      const diplomas = [];
      for (let i = 0; i < count; i++) {
        const diploma = await contract.diplomas(i);
        diplomas.push(diploma);
        console.log(`Diploma ${i}:`, diploma);
      }
      
      setDiplomas(diplomas);
    } catch (err) {
      console.error("Detailed error loading diplomas:", {
        error: err,
        contractAddress: CONTRACT_ADDRESS,
        abi: ItContract.abi,
        currentAccount
      });
      setError("Failed to load diplomas. Check console for details.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return (
    <div className="error">
      <h2>Error</h2>
      <p>{error}</p>
      {error.includes("MetaMask") && (
        <a href="https://metamask.io/download.html" target="_blank" rel="noopener noreferrer">
          Install MetaMask
        </a>
      )}
    </div>
  );

  return (
    <div className="app">
      <h1>Diploma Registry</h1>
      {currentAccount && <p>Connected account: {currentAccount}</p>}
      
      {contract ? (
        <>
          <p>Contract address: {CONTRACT_ADDRESS}</p>
          <h2>Diplomas ({diplomas.length})</h2>
          {diplomas.length > 0 ? (
            <ul>
              {diplomas.map((d, i) => (
                <li key={i}>
                  {d.studentName} - {d.universityName} ({d.year})
                </li>
              ))}
            </ul>
          ) : (
            <p>No diplomas found</p>
          )}
        </>
      ) : (
        <p>Contract not connected</p>
      )}
    </div>
  );
}