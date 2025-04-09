async function main() {
    const [deployer] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("ItContract");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
    console.log("Contract deployed to:", await contract.getAddress());
  }