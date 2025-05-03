import { useState } from 'react';
import { ethers } from 'ethers';
const diplomaContractABI = require('D:\Goland\BlochaineProjects\backend\contracts\abi\DiplomaContract.json');

export default function AddDiplomPage() {
  const [formData, setFormData] = useState({
    studentName: '',
    universityName: '',
    year: ''
  });

  const addDiploma = async () => {
    try {
      if (!window.ethereum) {
        alert('Пожалуйста, установите MetaMask!');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Адрес и ABI должны быть в этом же файле
      const contractAddress = process.env.CONTRACT_ADDRESS;

      const contract = new ethers.Contract(contractAddress, diplomaContractABI, signer);

      const diplomaHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(formData))
      );

      const tx = await contract.addDiploma(
        formData.studentName,
        formData.universityName,
        formData.year,
        diplomaHash
      );
      
      await tx.wait();
      alert('Диплом успешно добавлен!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert(`Ошибка: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Добавить диплом</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        addDiploma();
      }}>
        <input
          value={formData.studentName}
          onChange={(e) => setFormData({...formData, studentName: e.target.value})}
          placeholder="Имя студента"
        />
        <input
          value={formData.universityName}
          onChange={(e) => setFormData({...formData, universityName: e.target.value})}
          placeholder="Университет"
        />
        <input
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({...formData, year: e.target.value})}
          placeholder="Год выпуска"
        />
        <button type="submit">Добавить</button>
      </form>
    </div>
  );
}