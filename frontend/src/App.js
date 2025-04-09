import { useState, useEffect } from 'react';
import { Contract, BrowserProvider, ethers } from 'ethers';
import ItContract from './contracts/ItContract.json';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function App() {
  const [contract, setContract] = useState(null);
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Объявляем функцию loadDiplomas внутри компонента
  const loadDiplomas = async (contract) => {
    try {
      const count = await contract.getDiplomasCount();
      const diplomas = [];
      
      for (let i = 0; i < count; i++) {
        // Получаем raw данные
        const rawDiploma = await contract.diplomas(i);
        
        // Вручную декодируем структуру
        const diploma = {
          studentName: ethers.decodeBytes32String(ethers.zeroPadValue(rawDiploma[0], 32)),
          universityName: ethers.decodeBytes32String(ethers.zeroPadValue(rawDiploma[1], 32)),
          year: rawDiploma[2].toString()
        };
        
        diplomas.push(diploma);
      }
      
      setDiplomas(diplomas);
    } catch (err) {
      console.error("Detailed decoding error:", {
        error: err,
        rawData: err.info?.value
      });
      setError("Failed to decode diploma data");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          throw new Error("Please install MetaMask!");
        }

        const provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        
        const signer = await provider.getSigner();
        const contract = new Contract(
          CONTRACT_ADDRESS, 
          ItContract.abi, 
          signer
        );
        
        setContract(contract);
        await loadDiplomas(contract); // Вызываем функцию здесь
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
  if (error) return <div>Error: {error}</div>;

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