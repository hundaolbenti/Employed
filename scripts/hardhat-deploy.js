const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const contractName = "TimeTracking";
  const TimeTracking = await hre.ethers.getContractFactory(contractName);
  const contract = await TimeTracking.deploy();
  await contract.deployed();
  console.log(`${contractName} deployed to:`, contract.address);

  // Save address and ABI for frontend
  const frontendDir = path.resolve(__dirname, "../frontend/src/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(frontendDir, "contract-address.json"),
    JSON.stringify({ [contractName]: contract.address }, null, 2)
  );
  const artifact = await hre.artifacts.readArtifact(contractName);
  fs.writeFileSync(
    path.join(frontendDir, `${contractName}.json`),
    JSON.stringify({ abi: artifact.abi, bytecode: artifact.bytecode }, null, 2)
  );
  console.log(`Contract address and ABI exported to frontend.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
