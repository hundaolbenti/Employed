const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const TimeTracking = await hre.ethers.getContractFactory("TimeTracking");
  
  // If you already deployed, use this instead (replace with your actual contract address):
  // const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default Hardhat first address
  const contract = await TimeTracking.deploy();
  await contract.waitForDeployment();
  
  console.log("Contract address:", contract.target || contract.address);

  // Get the signer (employer account)
  const [employer] = await hre.ethers.getSigners();
  console.log("Employer address:", employer.address);

  // Add sample employees
  const sampleEmployees = [
    { address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", name: "Alice Johnson" },
    { address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", name: "Bob Smith" },
    { address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", name: "Charlie Lee" },
    { address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", name: "Diana Prince" },
    { address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", name: "Ethan Hunt" }
  ];

  for (const emp of sampleEmployees) {
    const tx = await contract.addEmployee(emp.address, emp.name);
    await tx.wait();
    console.log(`Added employee: ${emp.name} (${emp.address})`);
  }

  console.log("Sample employees added successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });