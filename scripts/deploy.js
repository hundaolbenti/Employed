// scripts/deploy.js - THIS IS THE ACTUAL DEPLOYMENT SCRIPT
const { ethers } = require('ethers'); // Import ethers.js
const fs = require('fs');
const path = require('path');

async function main() {
    const contractName = "TimeTracking"; // The exact name of your Solidity contract

    // --- 1. Load Compiled Contract Data ---
    const contractJsonPath = path.resolve(__dirname, '../build', `${contractName}.json`);
    if (!fs.existsSync(contractJsonPath)) {
        console.error(`Error: Compiled contract file not found at ${contractJsonPath}`);
        console.error("Please run 'node scripts/compile.js' first.");
        process.exit(1);
    }
    const contractJson = JSON.parse(fs.readFileSync(contractJsonPath, 'utf8'));
    const abi = contractJson.abi;
    const bytecode = contractJson.bytecode;

    // --- 2. Connect to Ganache Provider and Get Signer ---
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const signer = await provider.getSigner();

    console.log(`Attempting to deploy ${contractName} from account: ${signer.address}`);

    // --- 3. Deploy the Contract ---
    const TimeTrackingFactory = new ethers.ContractFactory(abi, bytecode, signer);

    const timeTracking = await TimeTrackingFactory.deploy(); // Add constructor args here: TimeTrackingFactory.deploy(arg1, arg2)
    await timeTracking.waitForDeployment();

    const contractAddress = timeTracking.target;
    console.log(`${contractName} contract deployed to: ${contractAddress}`);

    // --- 4. Exporting the contract address and ABI for the frontend ---
    const frontendContractsDir = path.resolve(__dirname, "../frontend/src/contracts");

    if (!fs.existsSync(frontendContractsDir)) {
        fs.mkdirSync(frontendContractsDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(frontendContractsDir, "contract-address.json"),
        JSON.stringify({ [contractName]: contractAddress }, undefined, 2)
    );

    fs.writeFileSync(
        path.join(frontendContractsDir, `${contractName}.json`),
        JSON.stringify(contractJson, null, 2) // Saving the entire compiled JSON artifact
    );

    console.log(`Contract address and ABI exported to ${frontendContractsDir}/`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});