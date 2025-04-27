import React, { useState } from 'react';
import axios from 'axios';
import { useMetaMask } from 'metamask-react';

function AddDiplomPage() {
  const [form, setForm] = useState({
    studentName: '',
    university: '',
    year: '',
    studentId: ''
  });
  const { account } = useMetaMask();

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/api/diplomas', {
        ...form,
        creatorId: account // ID из MetaMask
      });
      
      alert(`Диплом добавлен! TX Hash: ${response.data.txHash}`);
    } catch (err) {
      alert('Ошибка: ' + err.response?.data?.error);
    }
  };

  return (
    <div>
      <h2>Добавить диплом</h2>
      {/* Форма ввода данных */}
      <button onClick={handleSubmit}>Сохранить в блокчейн</button>
    </div>
  );
}