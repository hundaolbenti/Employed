// scripts/compile.js - THIS IS THE ACTUAL COMPILATION SCRIPT
const path = require('path');
const fs = require('fs');
const solc = require('solc'); // Make sure you installed solc as a dev dependency (npm install solc)

// Path to your contracts directory
const contractsDir = path.resolve(__dirname, '../contracts');
// Path to your build directory where compiled artifacts will be saved
const buildDir = path.resolve(__dirname, '../build');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
} else {
    // OPTIONAL: Clear build directory before compiling
    // This ensures you always have fresh artifacts
    fs.readdirSync(buildDir).forEach(file => {
        fs.unlinkSync(path.join(buildDir, file));
    });
    console.log("Cleared existing build artifacts.");
}


// Read all .sol files in the contracts directory
const contractFiles = fs.readdirSync(contractsDir).filter(file => file.endsWith('.sol'));

if (contractFiles.length === 0) {
    console.error("No Solidity files found in the 'contracts/' directory.");
    process.exit(1);
}

// Prepare input for solc
const input = {
    language: 'Solidity',
    sources: {},
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode.object'],
            },
        },
    },
};

contractFiles.forEach(file => {
    const filePath = path.join(contractsDir, file);
    input.sources[file] = {
        content: fs.readFileSync(filePath, 'utf8'),
    };
});

console.log("Compiling contracts...");
const output = JSON.parse(solc.compile(JSON.stringify(input)));
console.log("Compilation complete.");

// Check for compilation errors
if (output.errors) {
    output.errors.forEach(err => {
        if (err.severity === 'error') {
            console.error('Compilation Error:', err.formattedMessage);
        } else {
            console.warn('Compilation Warning:', err.formattedMessage);
        }
    });
    if (output.errors.some(err => err.severity === 'error')) {
         process.exit(1);
    }
}


// Save compiled output to JSON files in the build directory
for (const fileName in output.contracts) {
    for (const contractName in output.contracts[fileName]) {
        const contract = output.contracts[fileName][contractName];
        const outputPath = path.resolve(buildDir, `${contractName}.json`);
        fs.writeFileSync(
            outputPath,
            JSON.stringify({
                abi: contract.abi,
                bytecode: `0x${contract.evm.bytecode.object}`,
            }, null, 2)
        );
        console.log(`Saved ${contractName}.json to ${buildDir}`);
    }
}