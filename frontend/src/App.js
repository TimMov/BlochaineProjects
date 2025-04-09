import { useState, useEffect } from 'react';
import { Contract, BrowserProvider } from 'ethers';

// Конфигурация контракта
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "studentName", "type": "string"},
      {"internalType": "string", "name": "universityName", "type": "string"},
      {"internalType": "uint256", "name": "year", "type": "uint256"}
    ],
    "name": "addDiploma",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDiplomasCount",
    "outputs": [{"internalType": "uint256", "name": "count", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "diplomas",
    "outputs": [
      {"internalType": "string", "name": "studentName", "type": "string"},
      {"internalType": "string", "name": "universityName", "type": "string"},
      {"internalType": "uint256", "name": "year", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function DiplomaRegistry() {
  // Состояния приложения
  const [contract, setContract] = useState(null);
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState({
    init: true,
    adding: false,
    refreshing: false
  });
  const [error, setError] = useState('');
  const [account, setAccount] = useState('');
  const [formData, setFormData] = useState({
    studentName: '',
    universityName: '',
    year: ''
  });

  // 1. Инициализация подключения к блокчейну
  useEffect(() => {
    const initBlockchain = async () => {
      try {
        // Проверка наличия MetaMask
        if (!window.ethereum) {
          throw new Error("Пожалуйста, установите MetaMask!");
        }

        // Инициализация провайдера
        const provider = new BrowserProvider(window.ethereum);
        
        // Проверка сети
        const network = await provider.getNetwork();
        console.log("Connected to network:", network);
        
        if (network.chainId !== 31337n) {
          throw new Error("Подключитесь к локальной сети Hardhat (chainId: 31337)");
        }

        // Получение аккаунтов
        const accounts = await provider.send("eth_requestAccounts", []);
        if (!accounts.length) {
          throw new Error("Не удалось получить доступ к аккаунтам");
        }
        setAccount(accounts[0]);

        // Создание экземпляра контракта
        const signer = await provider.getSigner();
        const contractInstance = new Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        // Проверка доступности контракта
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') {
          throw new Error("Контракт не развернут по этому адресу");
        }

        // Проверка методов контракта
        try {
          await contractInstance.getDiplomasCount();
        } catch (e) {
          throw new Error("Контракт не содержит необходимых методов");
        }

        setContract(contractInstance);
        await refreshDiplomas(contractInstance);
      } catch (err) {
        console.error("Ошибка инициализации:", err);
        setError(err.message);
      } finally {
        setLoading(prev => ({...prev, init: false}));
      }
    };

    initBlockchain();
  }, []);

  // 2. Обновление списка дипломов
  const refreshDiplomas = async (contractInstance) => {
    try {
      setLoading(prev => ({...prev, refreshing: true}));
      setError('');

      // Получение количества дипломов
      const count = await contractInstance.getDiplomasCount();
      console.log("Total diplomas:", count.toString());

      // Загрузка каждого диплома
      const loadedDiplomas = [];
      for (let i = 0; i < count; i++) {
        try {
          const diploma = await contractInstance.diplomas(i);
          loadedDiplomas.push({
            studentName: diploma.studentName,
            universityName: diploma.universityName,
            year: diploma.year.toString()
          });
        } catch (diplomaErr) {
          console.error(`Ошибка загрузки диплома ${i}:`, diplomaErr);
        }
      }

      setDiplomas(loadedDiplomas);
    } catch (err) {
      console.error("Ошибка обновления:", {
        error: err,
        contractMethods: contractInstance ? Object.keys(contractInstance.functions) : null
      });
      setError("Не удалось загрузить список дипломов");
    } finally {
      setLoading(prev => ({...prev, refreshing: false}));
    }
  };

  // 3. Добавление нового диплома
  const handleAddDiploma = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      setLoading(prev => ({...prev, adding: true}));
      setError('');

      // Валидация данных
      if (!formData.studentName.trim() || !formData.universityName.trim()) {
        throw new Error("Заполните все обязательные поля");
      }

      const year = parseInt(formData.year);
      if (isNaN(year) || year < 1900 || year > 2100) {
        throw new Error("Укажите корректный год (1900-2100)");
      }

      // Отправка транзакции
      const tx = await contract.addDiploma(
        formData.studentName,
        formData.universityName,
        year
      );

      // Ожидание подтверждения транзакции
      await tx.wait();

      // Обновление списка и сброс формы
      await refreshDiplomas(contract);
      setFormData({ studentName: '', universityName: '', year: '' });
    } catch (err) {
      console.error("Ошибка добавления:", {
        error: err,
        message: err.message,
        data: err.data
      });
      setError(err.message || "Ошибка при добавлении диплома");
    } finally {
      setLoading(prev => ({...prev, adding: false}));
    }
  };

  // Отображение загрузки
  if (loading.init) return <div className="loading">Инициализация приложения...</div>;

  // Основной интерфейс
  return (
    <div className="container">
      <header>
        <h1>Реестр дипломов</h1>
        <p>Подключенный аккаунт: {account || 'Не подключен'}</p>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="form-section">
        <h2>Добавить новый диплом</h2>
        <form onSubmit={handleAddDiploma}>
          <div className="form-group">
            <label>ФИО студента *</label>
            <input
              value={formData.studentName}
              onChange={(e) => setFormData({...formData, studentName: e.target.value})}
              disabled={loading.adding}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Учебное заведение *</label>
            <input
              value={formData.universityName}
              onChange={(e) => setFormData({...formData, universityName: e.target.value})}
              disabled={loading.adding}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Год выпуска *</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: e.target.value})}
              min="1900"
              max="2100"
              disabled={loading.adding}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading.adding || !contract}
            className="submit-btn"
          >
            {loading.adding ? 'Добавление...' : 'Добавить диплом'}
          </button>
        </form>
      </section>

      <section className="diplomas-section">
        <div className="section-header">
          <h2>Список дипломов ({diplomas.length})</h2>
          <button 
            onClick={() => refreshDiplomas(contract)} 
            disabled={loading.refreshing}
            className="refresh-btn"
          >
            {loading.refreshing ? 'Обновление...' : 'Обновить'}
          </button>
        </div>
        
        {loading.refreshing ? (
          <p>Загрузка списка дипломов...</p>
        ) : diplomas.length > 0 ? (
          <ul className="diplomas-list">
            {diplomas.map((d, i) => (
              <li key={i} className="diploma-item">
                <h3>{d.studentName}</h3>
                <p>{d.universityName}</p>
                <p>Год выпуска: {d.year}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Нет зарегистрированных дипломов</p>
        )}
      </section>
    </div>
  );
}