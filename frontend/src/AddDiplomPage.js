// frontend/src/pages/AddDiplomPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AddDiplomPage = () => {
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDiplomas = async () => {
    try {
      const response = await axios.get(`${API_URL}/diplomas`);
      setDiplomas(response.data);
    } catch (err) {
      setError('Failed to load diplomas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiplomas();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Diplomas</h1>
      <ul>
        {diplomas.map(diploma => (
          <li key={diploma.diploma_id}>
            {diploma.student_name} - {diploma.university_name} ({diploma.year})
            <br/>
            TX: {diploma.tx_hash}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddDiplomPage;