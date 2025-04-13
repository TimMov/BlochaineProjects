import React, { useEffect, useState } from "react";
import { Contract, BrowserProvider } from "ethers";

// Адрес развернутого контракта
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// ABI контракта
const contractAbi = [
  {
    inputs: [
      { internalType: "string", name: "studentName", type: "string" },
      { internalType: "string", name: "universityName", type: "string" },
      { internalType: "uint256", name: "year", type: "uint256" }
    ],
    name: "addDiploma",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getDiplomasCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getDiploma",
    outputs: [
      { internalType: "string", name: "studentName", type: "string" },
      { internalType: "string", name: "universityName", type: "string" },
      { internalType: "uint256", name: "year", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "removeDiploma",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

const DiplomaViewer = () => {
  const [diplomas, setDiplomas] = useState([]);

  useEffect(() => {
    loadDiplomas();
  }, []);

  async function loadDiplomas() {
    try {
      if (!window.ethereum) {
        alert("Установите MetaMask");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

      const count = await contract.getDiplomasCount();
      const diplomaList = [];

      for (let i = 0; i < count; i++) {
        const diploma = await contract.getDiploma(i);
        diplomaList.push({
          studentName: diploma[0],
          universityName: diploma[1],
          year: diploma[2].toString()
        });
      }

      setDiplomas(diplomaList);
    } catch (error) {
      console.error("Ошибка при загрузке дипломов:", error);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Список дипломов</h2>
      {diplomas.length === 0 ? (
        <p>Нет дипломов для отображения.</p>
      ) : (
        <ul>
          {diplomas.map((diploma, index) => (
            <li key={index} style={{ marginBottom: "10px" }}>
              <strong>Имя:</strong> {diploma.studentName}<br />
              <strong>Университет:</strong> {diploma.universityName}<br />
              <strong>Год:</strong> {diploma.year}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DiplomaViewer;
