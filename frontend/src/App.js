import { useState, useEffect } from 'react';
import { Contract, BrowserProvider, ethers } from 'ethers';
import ItContract from './contracts/ItContract.json';

// 1. Убедитесь, что адрес совпадает с развернутым контрактом
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

export default function App() {
  const [contract, setContract] = useState(null);
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 2. Очистка переполненного хранилища
  useEffect(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn("Storage clearing error:", e);
    }
  }, []);

  const loadDiplomas = async (contract) => {
    try {
      const count = await contract.getDiplomasCount();
      const diplomas = [];
      
      for (let i = 0; i < count; i++) {
        try {
          // 3. Альтернативные способы вызова метода
          const rawData = await contract['diplomas(uint256)'](i);
          
          // 4. Выбор метода декодирования в зависимости от формата данных
          let diploma;
          if (Array.isArray(rawData)) {
            // Вариант для bytes32
            diploma = {
              studentName: ethers.decodeBytes32String(ethers.zeroPadValue(rawData[0], 32)),
              universityName: ethers.decodeBytes32String(ethers.zeroPadValue(rawData[1], 32)),
              year: rawData[2].toString()
            };
          } else {
            // Вариант для обычных строк
            diploma = {
              studentName: rawData.studentName || 'Unknown',
              universityName: rawData.universityName || 'Unknown',
              year: (rawData.year || 0).toString()
            };
          }
          diplomas.push(diploma);
        } catch (diplomaErr) {
          console.error(`Error loading diploma ${i}:`, diplomaErr);
        }
      }
      
      setDiplomas(diplomas);
    } catch (err) {
      console.error("Full error details:", {
        message: err.message,
        value: err.info?.value,
        method: err.method
      });
      setError("Failed to load diplomas. See console for details.");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          throw new Error("Please install MetaMask!");
        }

        const provider = new BrowserProvider(window.ethereum);
        
        // 5. Проверка сети
        const network = await provider.getNetwork();
        if (network.chainId !== 31337n) {
          throw new Error("Please connect to Hardhat local network");
        }

        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        
        // 6. Создание экземпляра контракта
        const contract = new Contract(
          CONTRACT_ADDRESS, 
          ItContract.abi, 
          signer
        );
        
        // 7. Проверка методов контракта
        console.log("Available methods:", Object.keys(contract.functions));
        
        setContract(contract);
        await loadDiplomas(contract);
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

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
      {contract && (
        <>
          <p>Contract address: {CONTRACT_ADDRESS}</p>
          <h2>Diplomas ({diplomas.length})</h2>
          <ul>
            {diplomas.map((d, i) => (
              <li key={i}>
                {d.studentName} - {d.universityName} ({d.year})
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}