import React, { useState, useEffect } from 'react';
import { Contract, BrowserProvider } from 'ethers';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = [
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

function App() {
  const [form, setForm] = useState({
    studentName: '',
    universityName: '',
    year: ''
  });
  const [diplomas, setDiplomas] = useState([]);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          alert('Пожалуйста, установите MetaMask!');
          return;
        }

        // Запрос подключения кошелька
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const provider = new BrowserProvider(window.ethereum);
        
        // Проверка сети
        const network = await provider.getNetwork();
        if (network.chainId !== 31337n) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7A69', // 31337 в hex
              chainName: 'Hardhat',
              nativeCurrency: { name: 'TM', symbol: 'TM', decimals: 18 },
              rpcUrls: ['http://localhost:8545']
            }]
          });
        }

        const signer = await provider.getSigner();
        const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contractInstance);
        await loadDiplomas(contractInstance);

      } catch (error) {
        console.error('Ошибка инициализации:', error);
        alert(`Ошибка: ${error.message}`);
      }
    };

    init();

    return () => {
      window.ethereum?.removeAllListeners();
    };
  }, []);
  

  const loadDiplomas = async (contractInstance) => {
    try {
      const count = await contractInstance.getDiplomasCount();
      const loaded = [];
      for (let i = 0; i < count; i++) {
        const diploma = await contractInstance.getDiploma(i);
        loaded.push({
          studentName: diploma[0],
          universityName: diploma[1],
          year: diploma[2].toString() // Преобразуем год в строку
        });
      }
      setDiplomas(loaded);
    } catch (error) {
      console.error('Error loading diplomas:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;

    const tx = await contract.addDiploma(
      form.studentName,
      form.universityName,
      parseInt(form.year)
    );
    await tx.wait();
    setForm({ studentName: '', universityName: '', year: '' });
    await loadDiplomas(contract);
  };

  // const handleRemove = async (index) => {
  //   if (!contract) return;
  //   try {
  //     const tx = await contract.removeDiploma(index);
  //     await tx.wait();
  //     await loadDiplomas(contract);
  //   } catch (error) {
  //     console.error('Error removing diploma:', error);
  //   }
  // };

  return (
    <div className="container mt-5">
      <h1>Система управления дипломами</h1>
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Добавить диплом</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">ФИО студента</label>
                  <input
                    type="text"
                    className="form-control"
                    name="studentName"
                    value={form.studentName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Учебное заведение</label>
                  <input
                    type="text"
                    className="form-control"
                    name="universityName"
                    value={form.universityName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Год выпуска</label>
                  <input
                    type="number"
                    className="form-control"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Добавить в блокчейн</button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Просмотр дипломов</h5>
              <button className="btn btn-secondary mb-3" onClick={() => loadDiplomas(contract)}>
                Показать все дипломы
              </button>
              <div id="diplomasList">
                {diplomas.map((d, i) => (
                  <div key={i} className="border p-2 mb-2 rounded">
                    <strong>{d.studentName}</strong><br />
                    {d.universityName}<br />
                    {d.year}
                    {/* <button onClick={() => handleRemove(i)} className="btn btn-danger btn-sm ms-2">Удалить</button> */}
                  </div>
                ))}
                {diplomas.length === 0 && <p>Нет добавленных дипломов.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
