import { useState, useEffect } from 'react';
import { Contract, providers } from 'ethers';
import ItContract from './contracts/ItContract.json';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Hardhat локальный адрес

export default function App() {
  const [contract, setContract] = useState(null);
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) throw new Error("MetaMask не установлен");
        
        const provider = new providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        
        const contract = new Contract(
          CONTRACT_ADDRESS,
          ItContract.abi,
          provider.getSigner()
        );
        
        setContract(contract);
        await loadDiplomas(contract);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const loadDiplomas = async (contract) => {
    const count = await contract.getDiplomasCount();
    const diplomas = [];
    for (let i = 0; i < count; i++) {
      diplomas.push(await contract.diplomas(i));
    }
    setDiplomas(diplomas);
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="app">
      <h1>Diploma Registry</h1>
      {contract && (
        <>
          <p>Контракт подключен: {CONTRACT_ADDRESS}</p>
          <h2>Дипломы ({diplomas.length})</h2>
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