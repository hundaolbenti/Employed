import { useState, useEffect } from 'react';

function EmployeeView({ contract, account }) {
    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [simulatedTime, setSimulatedTime] = useState(0);

    const fetchEmployeeData = async () => {
        try {
            setLoading(true);
            const data = await contract.getEmployeeData(account);
            setEmployeeData({
                name: data.name,
                lastClockInTime: data.lastClockInTime,
                totalTimeWorked: data.totalTimeWorked,
                isClockedIn: data.isClockedIn
            });
            setSimulatedTime(0);
        } catch (err) {
            setError('Failed to fetch your data: ' + err.message);
            setTimeout(() => setError(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contract) {
            fetchEmployeeData();
        }
    }, [contract, account]);

    useEffect(() => {
        if (employeeData && process.env.NODE_ENV === 'development') {
            const interval = setInterval(() => {
                if (employeeData.isClockedIn) {
                    setSimulatedTime(prev => {
                        const newTime = prev + 60;
                        setEmployeeData(prevData => ({
                            ...prevData,
                            totalTimeWorked: Number(prevData.totalTimeWorked) + 60
                        }));
                        return newTime;
                    });
                }
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [employeeData]);

    const handleClockIn = async () => {
        try {
            setActionLoading(true);
            const tx = await contract.clockIn();
            await tx.wait();
            await fetchEmployeeData();
            setSuccess('Successfully clocked in!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to clock in: ' + err.message);
            setTimeout(() => setError(''), 5000);
        } finally {
            setActionLoading(false);
        }
    };

    const handleClockOut = async () => {
        try {
            setActionLoading(true);
            const tx = await contract.clockOut();
            await tx.wait();
            await fetchEmployeeData();
            setSuccess('Successfully clocked out!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to clock out: ' + err.message);
            setTimeout(() => setError(''), 5000);
        } finally {
            setActionLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const totalSeconds = Number(seconds) + (employeeData?.isClockedIn ? simulatedTime : 0);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        return `${hrs}h ${mins}m`;
    };

    const formatDate = (timestamp) => {
        if (!timestamp || timestamp === 0) return 'Never';
        // Fix: Convert BigInt to Number before multiplying
        const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
        return new Date(ts * 1000).toLocaleString();
    };

    if (loading) {
        return <div className="loading">Loading your data...</div>;
    }

    return (
        <div className="employee-view">
            <h2>Employee Portal</h2>
            {employeeData && (
                <>
                    <div className="employee-info">
                        <div className="info-item">
                            <span>Name:</span>
                            <span>{employeeData.name}</span>
                        </div>
                        <div className="info-item">
                            <span>Status:</span>
                            <span className={`status ${employeeData.isClockedIn ? 'in' : 'out'}`}>
                                {employeeData.isClockedIn ? 'Clocked In' : 'Clocked Out'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span>Total Time Worked:</span>
                            <span>
                                {formatTime(employeeData.totalTimeWorked)}
                                {process.env.NODE_ENV === 'development' && employeeData.isClockedIn && (
                                    <span className="simulated-notice"> (simulating +{simulatedTime/60}m)</span>
                                )}
                            </span>
                        </div>
                        <div className="info-item">
                            <span>Last Clock In:</span>
                            <span>{formatDate(employeeData.lastClockInTime)}</span>
                        </div>
                    </div>
                    <div className="actions">
                        {employeeData.isClockedIn ? (
                            <button 
                                onClick={handleClockOut} 
                                disabled={actionLoading}
                                className="clock-out"
                            >
                                {actionLoading ? 'Processing...' : 'Clock Out'}
                            </button>
                        ) : (
                            <button 
                                onClick={handleClockIn} 
                                disabled={actionLoading}
                                className="clock-in"
                            >
                                {actionLoading ? 'Processing...' : 'Clock In'}
                            </button>
                        )}
                        <button style={{marginLeft:8}} onClick={fetchEmployeeData} disabled={actionLoading || loading}>
                            Refresh
                        </button>
                    </div>
                </>
            )}
            {success && <div className="success">{success}</div>}
            {error && <div className="error">{error}</div>}
            {process.env.NODE_ENV === 'development' && (
                <div className="dev-notice">
                    Development Mode: Time is being simulated (+1m/min when clocked in)
                </div>
            )}
        </div>
    );
}

export default EmployeeView;