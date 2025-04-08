import React from 'react';
import { ethers } from 'ethers';
import DiplomaRegistryArtifact from './contracts/itContract.sol/DiplomaRegistry.json';
import './styles/App.css';

// Константы для адреса контракта и fallback-значений
const CONTRACT_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
const DEFAULT_OWNER = "0x1234567890abcdef1234567890abcdef12345678";

function App() {
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [diplomas, setDiplomas] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newDiploma, setNewDiploma] = useState({
        owner: '',
        studentName: '',
        universityName: '',
        year: ''
    });

    // Инициализация подключения к блокчейну
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const provider = new ethers.JsonRpcProvider("http://localhost:8545");
                setProvider(provider);

                const contract = new ethers.Contract(
                    CONTRACT_ADDRESS, 
                    DiplomaRegistryArtifact.abi, 
                    provider
                );
                setContract(contract);
                await getDiplomas();
            } catch (err) {
                console.error("Initialization error:", err);
                setError("Failed to connect to blockchain. Make sure local node is running.");
            } finally {
                setLoading(false);
            }
        };
        
        init();
        
        // Очистка при размонтировании
        return () => {
            setProvider(null);
            setContract(null);
        };
    }, []);

    // Получение списка дипломов
    const getDiplomas = async () => {
        if (!contract) {
            setError("Contract not initialized");
            return;
        }
        
        try {
            setLoading(true);
            const count = await contract.getDiplomasCount();
            const diplomasList = [];
            
            // Оптимизированная загрузка дипломов
            const diplomaPromises = Array.from({ length: Number(count) }, (_, i) => 
                contract.diplomas(i)
            );
            const diplomasData = await Promise.all(diplomaPromises);
            
            diplomasData.forEach((diploma, i) => {
                diplomasList.push({
                    id: i,
                    owner: diploma[0],
                    studentName: diploma[1],
                    universityName: diploma[2],
                    year: diploma[3]
                });
            });
            
            setDiplomas(diplomasList);
            setError(null);
        } catch (err) {
            console.error("Error fetching diplomas:", err);
            setError("Failed to fetch diplomas: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDiploma(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Добавление нового диплома
    const addDiploma = async () => {
        if (!provider || !contract) {
            setError("Provider or contract not initialized");
            return;
        }
        
        // Валидация полей
        if (!newDiploma.studentName || !newDiploma.universityName || !newDiploma.year) {
            setError("Please fill all required fields");
            return;
        }
        
        try {
            setLoading(true);
            const signer = await provider.getSigner();
            const contractWithSigner = contract.connect(signer);

            const tx = await contractWithSigner.addDiploma(
                newDiploma.owner || DEFAULT_OWNER,
                newDiploma.studentName,
                newDiploma.universityName,
                newDiploma.year
            );
            
            await tx.wait();
            setNewDiploma({
                owner: '',
                studentName: '',
                universityName: '',
                year: ''
            });
            await getDiplomas();
            setError(null);
        } catch (err) {
            console.error("Error adding diploma:", err);
            setError("Failed to add diploma: " + (err.reason || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <header>
                <h1>Diploma Registry</h1>
                <p>Manage academic diplomas on the blockchain</p>
            </header>

            <div className="content">
                {loading && <div className="loader">Loading...</div>}
                {error && <div className="error-message">{error}</div>}

                <div className="form-section">
                    <h2>Add New Diploma</h2>
                    <div className="form-group">
                        <label>Owner Address:</label>
                        <input
                            type="text"
                            name="owner"
                            value={newDiploma.owner}
                            onChange={handleInputChange}
                            placeholder={`Default: ${DEFAULT_OWNER}`}
                            pattern="^0x[a-fA-F0-9]{40}$"
                            title="Enter valid Ethereum address (0x...) or leave empty for default"
                        />
                    </div>
                    <div className="form-group">
                        <label>Student Name*:</label>
                        <input
                            type="text"
                            name="studentName"
                            value={newDiploma.studentName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>University*:</label>
                        <input
                            type="text"
                            name="universityName"
                            value={newDiploma.universityName}
                            onChange={handleInputChange}
                            placeholder="University XYZ"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Year*:</label>
                        <input
                            type="text"
                            name="year"
                            value={newDiploma.year}
                            onChange={handleInputChange}
                            placeholder="2025"
                            required
                        />
                    </div>
                    <button 
                        onClick={addDiploma} 
                        className="action-button"
                        disabled={loading || !newDiploma.studentName || !newDiploma.universityName || !newDiploma.year}
                    >
                        {loading ? 'Processing...' : 'Add Diploma'}
                    </button>
                </div>

                <div className="diplomas-section">
                    <div className="section-header">
                        <h2>Registered Diplomas ({diplomas.length})</h2>
                        <button 
                            onClick={getDiplomas} 
                            className="refresh-button"
                            disabled={loading}
                            title="Refresh list"
                        >
                            ↻ Refresh
                        </button>
                    </div>
                    
                    {diplomas.length === 0 ? (
                        <p className="no-data">No diplomas found. Add one to get started!</p>
                    ) : (
                        <div className="diplomas-list">
                            {diplomas.map((diploma) => (
                                <div key={diploma.id} className="diploma-card">
                                    <h3>{diploma.studentName}</h3>
                                    <p><strong>University:</strong> {diploma.universityName}</p>
                                    <p><strong>Year:</strong> {diploma.year}</p>
                                    <p className="owner-address" title={diploma.owner}>
                                        <strong>Owner:</strong> {diploma.owner.substring(0, 6)}...{diploma.owner.substring(38)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;