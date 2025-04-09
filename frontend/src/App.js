import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ItContract from './contracts/ItContract.json';
import AddDiplomaForm from './components/AddDiplomaForm';
import DiplomaList from './components/DiplomaList';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [diplomas, setDiplomas] = useState([]);

  useEffect(() => {
    const init = async () => {
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
      
      const signer = await prov.getSigner();
      const cntr = new ethers.Contract(
        CONTRACT_ADDRESS,
        ItContract.abi,
        signer
      );
      setContract(cntr);
      loadDiplomas(cntr);
    };

    if(window.ethereum) init();
  }, []);

  const loadDiplomas = async (contract) => {
    const count = await contract.getDiplomasCount();
    const loaded = [];
    for(let i = 0; i < count; i++) {
      loaded.push(await contract.diplomas(i));
    }
    setDiplomas(loaded);
  };

  return (
    <div className="app">
      <h1>Blockchain Diploma Registry</h1>
      <AddDiplomaForm contract={contract} onAdd={loadDiplomas} />
      <DiplomaList diplomas={diplomas} />
    </div>
  );
}

export default App;