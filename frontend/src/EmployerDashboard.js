import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

function EmployerDashboard({ contract, account }) {
    const [newAddress, setNewAddress] = useState('');
    const [newName, setNewName] = useState('');
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newEmployeeType, setNewEmployeeType] = useState('public');

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const addresses = await contract.getAllEmployeeAddresses();
            const employeeData = await Promise.all(
                addresses.map(async (addr) => {
                    const emp = await contract.getEmployeeData(addr);
                    return {
                        address: addr,
                        name: emp.name,
                        lastClockInTime: emp.lastClockInTime,
                        totalTimeWorked: emp.totalTimeWorked,
                        isClockedIn: emp.isClockedIn,
                        exists: emp.exists
                    };
                })
            );
            setEmployees(employeeData);
        } catch (err) {
            setError('Failed to fetch employees: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [contract]);

    useEffect(() => {
        if (contract) {
            fetchEmployees();
        }
    }, [contract, fetchEmployees]);

    const isValidAddress = (address) => {
        try {
            return ethers.isAddress(address);
        } catch {
            return false;
        }
    };

    const addEmployee = async (e) => {
        e.preventDefault();
        if (!newAddress || !newName) return;
        if (!isValidAddress(newAddress)) {
            setError('Please enter a valid Ethereum address.');
            setTimeout(() => setError(''), 3000);
            return;
        }
        // Prevent duplicate
        if (employees.some(emp => emp.address.toLowerCase() === newAddress.toLowerCase())) {
            setError('Employee already exists!');
            setTimeout(() => setError(''), 3000);
            return;
        }
        try {
            setLoading(true);
            let employeeAddress = newAddress;
            if (newEmployeeType === 'private') {
                try {
                    const wallet = new ethers.Wallet(newAddress);
                    employeeAddress = wallet.address;
                } catch (err) {
                    setError('Invalid private key: ' + err.message);
                    return;
                }
            }
            const tx = await contract.addEmployee(employeeAddress, newName);
            await tx.wait();
            fetchEmployees();
            setNewAddress('');
            setNewName('');
            setSuccess('Employee added!');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('Failed to add employee: ' + (err.reason || err.message || JSON.stringify(err)));
            console.error('Add employee error:', err);
            setTimeout(() => setError(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hrs}h ${mins}m`;
    };

    const formatDate = (timestamp) => {
        if (!timestamp || timestamp === 0) return 'Never';
        return new Date(timestamp * 1000).toLocaleString();
    };

    return (
        <div className="dashboard">
            <h2>Employer Dashboard</h2>
            <div className="section">
                <h3>Add New Employee</h3>
                <form onSubmit={addEmployee}>
                    <div className="form-group">
                        <label>Employee Type:</label>
                        <div className="employee-type-selector">
                            <button 
                                type="button"
                                className={newEmployeeType === 'public' ? 'active' : ''}
                                onClick={() => setNewEmployeeType('public')}
                            >
                                Public Address
                            </button>
                            <button 
                                type="button"
                                className={newEmployeeType === 'private' ? 'active' : ''}
                                onClick={() => setNewEmployeeType('private')}
                            >
                                Private Key
                            </button>
                        </div>
                    </div>
                    {newEmployeeType === 'public' ? (
                        <div className="form-group">
                            <label>Ethereum Address:</label>
                            <input
                                type="text"
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                                placeholder="0x..."
                                required
                            />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Private Key:</label>
                            <input
                                type="password"
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                                placeholder="0x..."
                                required
                            />
                            <p className="warning">
                                ⚠️ Warning: Only use test private keys. Never use real private keys!
                            </p>
                        </div>
                    )}
                    <div className="form-group">
                        <label>Employee Name:</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Employee'}
                    </button>
                    <button type="button" style={{marginLeft:8}} onClick={fetchEmployees} disabled={loading}>
                        Refresh List
                    </button>
                </form>
            </div>
            <div className="section">
                <h3>Employee List</h3>
                {loading ? (
                    <p>Loading employees...</p>
                ) : employees.length === 0 ? (
                    <p>No employees added yet</p>
                ) : (
                    <div className="employee-list">
                        <div className="list-header">
                            <div>Name</div>
                            <div>Address</div>
                            <div>Status</div>
                            <div>Total Time</div>
                            <div>Last Clock In</div>
                        </div>
                        {employees.map((emp, index) => (
                            <div key={index} className="employee-item">
                                <div>{emp.name}</div>
                                <div style={{fontSize:'0.85em'}}>{emp.address.substring(0,6)}...{emp.address.substring(emp.address.length-4)}</div>
                                <div className={`status ${emp.isClockedIn ? 'in' : 'out'}`}>
                                    {emp.isClockedIn ? 'Clocked In' : 'Clocked Out'}
                                </div>
                                <div>{formatTime(Number(emp.totalTimeWorked))}</div>
                                <div>{formatDate(Number(emp.lastClockInTime))}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {success && <div className="success">{success}</div>}
            {error && <div className="error">{error}</div>}
        </div>
    );
}

export default EmployerDashboard;