import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import DiplomaRegistryArtifact from '../artifacts/contracts/ItContract.sol/DiplomaRegistry.json'; // Путь к ABI

function App() {
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [diplomas, setDiplomas] = useState([]);

    useEffect(() => {
        const init = async () => {
            // Подключение к локальной сети
            const provider = new ethers.JsonRpcProvider("http://localhost:8545");
            setProvider(provider);

            // Подключение к контракту
            const contractAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"; // Адрес развернутого контракта
            const contract = new ethers.Contract(contractAddress, DiplomaRegistryArtifact.abi, provider);
            setContract(contract);
        };
        init();
    }, []);

    // Функция для получения дипломов
    const getDiplomas = async () => {
        if (contract) {
            const count = await contract.getDiplomasCount();
            const diplomasList = [];
            for (let i = 0; i < count; i++) {
                const diploma = await contract.diplomas(i);
                diplomasList.push(diploma);
            }
            setDiplomas(diplomasList);
        }
    };

    // Функция для добавления диплома
    const addDiploma = async () => {
        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);

        const tx = await contractWithSigner.addDiploma(
            "0x1234567890abcdef1234567890abcdef12345678", // Пример адреса владельца диплома
            "Diploma #1",
            "University XYZ",
            "2025"
        );
        await tx.wait();
        getDiplomas(); // После добавления диплома обновим список
    };

    return (
        <div>
            <h1>Diploma Registry</h1>
            <button onClick={addDiploma}>Add Diploma</button>
            <button onClick={getDiplomas}>Get Diplomas</button>
            <ul>
                {diplomas.map((diploma, index) => (
                    <li key={index}>
                        {diploma.diplomaHash} - {diploma.studentName} - {diploma.universityName} - {diploma.year}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
