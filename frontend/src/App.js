import React from 'react';
import { ethers } from 'ethers';
import contractAbi from './contracts/ItContract.json';
import './App.css';

function App() {
  const [contract, setContract] = React.useState(null);

  const initContract = async () => {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const contract = new ethers.Contract(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Замените на ваш адрес
      contractAbi.abi,
      provider
    );
    setContract(contract);
  };

  React.useEffect(() => {
    initContract();
  }, []);

  return (
    <div className="App">
      <h1>Diploma Registry</h1>
      {contract ? (
        <p>Contract connected at {contract.address}</p>
      ) : (
        <p>Loading contract...</p>
      )}
    </div>
  );
}

export default App;