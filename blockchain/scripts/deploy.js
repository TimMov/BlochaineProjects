import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const ItContract = await ethers.getContractFactory("ItContract");
  const contract = await ItContract.deploy();
  
  // Ждем подтверждения деплоя
  await contract.deployed();
  
  console.log("Contract deployed to:", contract.address);
  
  // Возвращаем адрес для использования в других скриптах
  return contract.address;
}

main()
  .then((address) => {
    console.log("Deployment complete. Address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });