// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    const DiplomaContract = await hre.ethers.getContractFactory("DiplomaContract");
    const diploma = await DiplomaContract.deploy();
    
    await diploma.deployed();
    
    console.log("Contract deployed to:", diploma.address);
    
    // Проверка работы
    const count = await diploma.getDiplomasCount();
    console.log("Initial diplomas count:", count.toString());
    
    // Пример добавления диплома
    const tx = await diploma.addDiploma(
        "Test Student",
        "Test University",
        2023,
        "0xtesthash123"
    );
    await tx.wait();
    
    console.log("Added test diploma");
    console.log("New count:", (await diploma.getDiplomasCount()).toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });