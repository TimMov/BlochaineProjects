const hre = require("hardhat");

async function main() {
  // Получаем фабрику контракта
  const DiplomaContract = await hre.ethers.getContractFactory("DiplomaContract");
  
  // Деплоим контракт
  const diploma = await DiplomaContract.deploy();
  
  // Ждем подтверждения деплоя
  await diploma.waitForDeployment();

  // Получаем адрес контракта
  const contractAddress = await diploma.getAddress();
  
  console.log("DiplomaContract deployed to:", contractAddress);
  console.log("Transaction hash:", diploma.deploymentTransaction().hash);

  // Проверка работы
  try {
    const count = await diploma.getDiplomasCount();
    console.log("Initial diplomas count:", count.toString());
  } catch (error) {
    console.error("Test call failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });