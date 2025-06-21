# Decentralized Time Tracker DApp

This guide will help you set up, run, and test the Time Tracker DApp using Hardhat for contract management and Ganache for a persistent local blockchain.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Installation](#installation)
4. [Starting Ganache (Persistent Blockchain)](#starting-ganache-persistent-blockchain)
5. [Compiling and Deploying Contracts](#compiling-and-deploying-contracts)
6. [Running the Frontend](#running-the-frontend)
7. [Using MetaMask](#using-metamask)
8. [Testing the DApp](#testing-the-dapp)
9. [Persistence & Resetting](#persistence--resetting)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites
- **Node.js** (v16 or later recommended)
- **npm** (comes with Node.js)
- **MetaMask** browser extension

---

## Project Structure
```
/gan
  contracts/              # Solidity smart contracts
  scripts/                # Deployment and utility scripts
  build/                  # Compiled contract artifacts (auto-generated)
  frontend/               # React frontend app
  ganache_data/           # Persistent Ganache blockchain data
  hardhat.config.js       # Hardhat configuration
  package.json            # Project dependencies
```

---

## Installation
1. **Clone the repository** (if not already):
   ```bash
   git clone <your-repo-url>
   cd gan
   ```
2. **Install backend dependencies:**
   ```bash
   npm install
   ```
3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

---

## Starting Ganache (Persistent Blockchain)
Start Ganache in persistent mode (from the `/gan` directory):
```bash
npx ganache --db ganache_data --chain.chainId 1337 --wallet.mnemonic "test test test test test test test test test test test junk"
```
- This will create a local blockchain with persistent data in `ganache_data/`.
- **Do not delete or modify `ganache_data/` if you want to keep your blockchain state.**

---

## Compiling and Deploying Contracts
1. **Compile contracts with Hardhat:**
   ```bash
   npx hardhat compile
   ```
2. **Deploy contracts to Ganache:**
   ```bash
   npx hardhat run scripts/hardhat-deploy.js --network ganache
   ```
   - This will deploy your contracts and update the frontend with the correct contract address and ABI.

---

## Running the Frontend
1. **Start the React app:**
   ```bash
   cd frontend
   npm start
   ```
2. **Open your browser:**
   - Go to [http://localhost:3000](http://localhost:3000)

---

## Using MetaMask
1. **Add the Ganache network to MetaMask:**
   - Network Name: `Ganache Local`
   - New RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`
2. **Import Ganache accounts:**
   - Use the private keys printed by Ganache at startup (or from this mnemonic: `test test test test test test test test test test test junk`).
   - The first account is the employer (deployer).
   - Others can be used as employees.
3. **Switch between accounts in MetaMask to test employer/employee roles.**

---

## Testing the DApp
- **Employer:**
  - Log in with the first Ganache account.
  - Add employees by entering their Ethereum address and name.
- **Employee:**
  - Switch MetaMask to an employee account.
  - Log in to view and interact with your data.

---

## Persistence & Resetting
- **Persistence:**
  - As long as you use the same `ganache_data/` directory and mnemonic, your contracts and data will persist across Ganache restarts.
- **Resetting:**
  - To reset the blockchain, stop Ganache and delete the `ganache_data/` directory:
    ```bash
    rm -rf ganache_data/
    ```
  - Then restart Ganache and redeploy your contracts.

---

## Troubleshooting
- **MetaMask not connecting:**
  - Make sure MetaMask is on the correct network (`localhost:8545`, Chain ID 1337).
- **Contract not found or wrong address:**
  - Always redeploy after resetting Ganache, and make sure the frontend uses the latest contract address.
- **Dependency errors:**
  - Ensure you are using compatible versions of Hardhat and ethers (ethers v5 for Hardhat plugins).
- **Revert errors:**
  - Make sure you are using the employer account to add employees, and that the employee address is not already registered.

---

## Useful Commands
- Start Ganache:  
  `npx ganache --db ganache_data --chain.chainId 1337 --wallet.mnemonic "test test test test test test test test test test test junk"`
- Compile contracts:  
  `npx hardhat compile`
- Deploy contracts:  
  `npx hardhat run scripts/hardhat-deploy.js --network ganache`
- Start frontend:  
  `cd frontend && npm start`

---

Enjoy building and testing your DApp!
