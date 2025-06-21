// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/////import "hardhat/console.sol"; // Useful for debugging

contract TimeTracking {
    // The address of the person who deployed the contract
    address public employer;

    // A custom data type to store information about an employee
    struct Employee {
        address account;
        string name;
        uint256 lastClockInTime;
        uint256 totalTimeWorked; // in seconds
        bool isClockedIn;
        bool exists;
    }

    // A mapping from an employee's address to their data
    mapping(address => Employee) public employees;

    // An array to store all employee addresses for easy retrieval
    address[] public employeeAddresses;

    // Event to announce when a new employee is added
    event EmployeeAdded(address indexed employeeAddress, string name);
    // Event for clocking in/out
    event TimeLogUpdated(address indexed employeeAddress, bool isClockedIn, uint256 timestamp);

    // This runs only once when the contract is deployed
    constructor() {
        // The person deploying is set as the employer
        employer = msg.sender;
    }

    // A modifier to restrict functions to be called only by the employer
    modifier onlyEmployer() {
        require(msg.sender == employer, "Only the employer can perform this action.");
        _;
    }

    // A modifier to ensure the caller is a registered employee
    modifier isEmployee() {
        require(employees[msg.sender].exists, "You are not a registered employee.");
        _;
    }

    /**
     * @dev Adds a new employee to the system. Can only be called by the employer.
     * @param _employeeAddress The Ethereum address of the new employee.
     * @param _name The name of the new employee.
     */
    function addEmployee(address _employeeAddress, string memory _name) public onlyEmployer {
        require(!employees[_employeeAddress].exists, "This employee already exists.");

        employees[_employeeAddress] = Employee({
            account: _employeeAddress,
            name: _name,
            lastClockInTime: 0,
            totalTimeWorked: 0,
            isClockedIn: false,
            exists: true
        });

        employeeAddresses.push(_employeeAddress);
        emit EmployeeAdded(_employeeAddress, _name);
    }

    /**
     * @dev Allows a registered employee to clock in.
     */
    function clockIn() public isEmployee {
        require(!employees[msg.sender].isClockedIn, "You are already clocked in.");

        employees[msg.sender].isClockedIn = true;
        employees[msg.sender].lastClockInTime = block.timestamp;

        emit TimeLogUpdated(msg.sender, true, block.timestamp);
    }

    /**
     * @dev Allows a registered employee to clock out.
     */
    function clockOut() public isEmployee {
        require(employees[msg.sender].isClockedIn, "You are not clocked in.");
        
        uint256 timeWorked = block.timestamp - employees[msg.sender].lastClockInTime;
        employees[msg.sender].totalTimeWorked += timeWorked;
        employees[msg.sender].isClockedIn = false;

        emit TimeLogUpdated(msg.sender, false, block.timestamp);
    }

    /**
     * @dev Retrieves the data for a single employee.
     * @param _employeeAddress The address of the employee to look up.
     * @return The employee's data struct.
     */
    function getEmployeeData(address _employeeAddress) public view returns (Employee memory) {
        require(employees[_employeeAddress].exists, "Employee not found.");
        return employees[_employeeAddress];
    }

    /**
     * @dev Returns a list of all registered employee addresses.
     * @return An array of Ethereum addresses.
     */
    function getAllEmployeeAddresses() public view returns (address[] memory) {
        return employeeAddresses;
    }
}
