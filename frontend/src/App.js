import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ItContract from './contracts/ItContract.json';
import './App.css';

export default function App() {
  const [contract, setContract] = useState(null);
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  useEffect(() => {
    const initContract = async () => {
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");
      const contract = new ethers.Contract(
        contractAddress,
        ItContract.abi,
        provider
      );
      setContract(contract);
    };
    initContract();
  }, []);

  return (
    <div className="App">
      <h1>Diploma Registry</h1>
      {contract ? (
        <div>
          <p>Contract address: {contractAddress}</p>
          <button onClick={() => console.log(contract)}>Test Connection</button>
        </div>
      ) : (
        <p>Connecting to contract...</p>
      )}
    </div>
  );
}