import { useState } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../utils/contractConfig';

export default function AddDiplomaForm({ user }) {
  const [formData, setFormData] = useState({
    studentName: '',
    universityName: '',
    year: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

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
      alert('Диплом успешно добавлен в блокчейн!');
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка: ' + error.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Добавить диплом</h2>
      <form onSubmit={handleSubmit}>
        {/* Поля формы */}
      </form>
    </div>
  );
}