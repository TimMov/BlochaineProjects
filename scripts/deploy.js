const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Получаем фабрику контракта
  const DiplomaRegistry = await ethers.getContractFactory("DiplomaRegistry");
  console.log("Deploying DiplomaRegistry...");

  // Разворачиваем контракт
  const diplomaRegistry = await DiplomaRegistry.deploy();
  
  // Ждем, пока контракт будет развернут (для ethers.js v6+ используем waitForDeployment())
  await diplomaRegistry.waitForDeployment();
  
  // Получаем адрес контракта (важно для ethers.js v6+)
  const contractAddress = await diplomaRegistry.getAddress();
  console.log("DiplomaRegistry deployed to:", contractAddress);

  // Добавляем тестовый диплом
  const tx = await diplomaRegistry.addDiploma(
    "0x1234567890abcdef1234567890abcdef12345678",
    "Diploma #1",
    "University XYZ",
    "2025"
  );
  
  // Ждем подтверждения транзакции
  await tx.wait();
  console.log("Diploma added for student: 0x1234567890abcdef1234567890abcdef12345678");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });