// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const JAN_1ST_2030 = 1893456000;
const ONE_GWEI = 1_000_000_000n;

module.exports = buildModule("ItModule", (m) => {
  const initialSupply = m.getParameter("initialSupply", 1000000);
  const MyToken = m.contract("ItContract", [initialSupply]);

  return { MyToken };
});
