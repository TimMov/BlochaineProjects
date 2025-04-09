import React, { useState } from 'react';

export default function AddDiplomaForm({ contract, onAdd }) {
  const [formData, setFormData] = useState({
    studentName: '',
    universityName: '',
    year: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.addDiploma(
        await contract.signer.getAddress(),
        formData.studentName,
        formData.universityName,
        formData.year
      );
      await tx.wait();
      onAdd(contract);
      setFormData({ studentName: '', universityName: '', year: '' });
    } catch (err) {
      console.error("Error adding diploma:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.studentName}
        onChange={(e) => setFormData({...formData, studentName: e.target.value})}
        placeholder="Student Name"
        required
      />
      <input
        value={formData.universityName}
        onChange={(e) => setFormData({...formData, universityName: e.target.value})}
        placeholder="University"
        required
      />
      <input
        value={formData.year}
        onChange={(e) => setFormData({...formData, year: e.target.value})}
        placeholder="Year"
        required
      />
      <button type="submit">Add Diploma</button>
    </form>
  );
}