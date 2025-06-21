import { useState } from 'react';
import { ethers } from 'ethers';
import TimeTracking from './contracts/TimeTracking.json';
import contractAddress from './contracts/contract-address.json';
import EmployerDashboard from './EmployerDashboard';
import EmployeeView from './EmployeeView';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [isEmployer, setIsEmployer] = useState(false);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                
                const timeTrackingContract = new ethers.Contract(
                    contractAddress.TimeTracking, 
                    TimeTracking.abi, 
                    signer
                );

                setContract(timeTrackingContract);
                setAccount(accounts[0]);

                const employerAddress = await timeTrackingContract.employer();
                setIsEmployer(accounts[0].toLowerCase() === employerAddress.toLowerCase());

            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        } else {
            alert('Please install MetaMask!');
        }
    };
    const handleQuickLogin = () => {
        connectWallet();
    };
    const handleLogout = () => {
        setAccount(null);
        setContract(null);
        setIsEmployer(false);
        // Show suggestion to disconnect from MetaMask extension
        alert('You have been logged out. To fully disconnect, use the "Disconnect" option in your MetaMask extension.');
        window.location.href = '/'; // Redirect to homepage
    };

    return (
        <div className="App">
            <header>
              <h1>Decentralized Time Tracker</h1>
              {account ? (
                <div className="account-info">
                  <p>Connected as: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
                  <p>Role: {isEmployer ? 'Employer' : 'Employee'}</p>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                <button className="connect-btn" onClick={connectWallet}>
                  Connect Wallet
                </button>
              )}
            </header>
            <main>
              <Routes>
                <Route path="/" element={
                  account ? (
                    isEmployer ? (
                      <Navigate to="/employer" replace />
                    ) : (
                      <Navigate to="/employee" replace />
                    )
                  ) : (
                    <div className="welcome">
                      <h2>Welcome to Time Tracker</h2>
                      <p>Connect your wallet to access the system</p>
                      <div className="login-options">
                        <button 
                          className="employer-login" 
                          onClick={handleQuickLogin}
                        >
                          Login as Employer
                        </button>
                        <button 
                          className="employee-login"
                          onClick={handleQuickLogin}
                        >
                          Login as Employee
                        </button>
                      </div>
                    </div>
                  )
                } />
                <Route path="/employer" element={
                  isEmployer ? (
                    <EmployerDashboard contract={contract} account={account} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                } />
                <Route path="/employee" element={
                  account && !isEmployer ? (
                    <EmployeeView contract={contract} account={account} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                } />
              </Routes>
            </main>
            <footer>
              <p>Powered by Ethereum & React</p>
            </footer>
        </div>
    );
}

export default App;