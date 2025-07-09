# Comprehensive DApp Deployment Plan

This document outlines a step-by-step guide to deploy your Decentralized Application (DApp). It covers setting up a persistent Ganache node on a Raspberry Pi, exposing it to the internet using Ngrok, deploying your smart contracts, deploying your frontend to Netlify, and configuring MetaMask for testing.

---

## Part 1: Configure Your Raspberry Pi as a Persistent Ganache Node

This section focuses on preparing your Ubuntu Raspberry Pi to host a persistent Ganache instance. All commands in this part are executed directly on your Raspberry Pi via an SSH connection.

### Step 1: Install Dependencies on Ubuntu

First, establish an SSH connection to your Raspberry Pi and install the necessary software.

1.  **Connect to your Pi via SSH:**
    ```bash
    ssh your_username@<your_pi_local_ip>
    ```
    *Replace `your_username` with your Raspberry Pi's username and `<your_pi_local_ip>` with its local IP address.*

2.  **Update Ubuntu and Install Node.js & Git:**
    ```bash
    # Update package lists and upgrade existing packages
    sudo apt update && sudo apt upgrade -y

    # Install Node.js (includes npm) and git
    curl -fsSL [https://deb.nodesource.com/setup_lts.x](https://deb.nodesource.com/setup_lts.x) | sudo -E bash -
    sudo apt-get install -y nodejs git
    ```

### Step 2: Install and Run Your Specific Ganache Instance

We will now install Ganache CLI and `pm2` (a process manager) to run your Ganache instance persistently, replicating the exact environment defined in your `README.md`.

1.  **Install Ganache CLI and pm2:**
    ```bash
    sudo npm install -g ganache pm2
    ```

2.  **Create the Persistent Data Directory:**
    Your `README.md` specifies using a directory named `ganache_data`. Let's create this in your home directory to store Ganache's blockchain data.
    ```bash
    mkdir ~/ganache_data
    ```

3.  **Start Ganache with pm2 (Using Your Exact Command):**
    This command tells `pm2` to run `npx`, which in turn executes `ganache` with all your custom arguments, including your specific mnemonic. This ensures the same accounts (employer, employees) are always generated.
    ```bash
    pm2 start npx --name ganache-node -- \
    ganache --db ~/ganache_data --host 0.0.0.0 --chain.chainId 1337 --wallet.mnemonic "test test test test test test test test test test test junk"
    ```
    * `--name ganache-node`: Assigns a readable name to the process in `pm2`.
    * `--host 0.0.0.0`: **Crucial change** from a local-only command. This makes Ganache accessible over your local network.

4.  **Make it Run on Boot:**
    Configure `pm2` to automatically start your Ganache node whenever your Raspberry Pi boots up.
    ```bash
    pm2 startup
    # Follow the command pm2 gives you to copy/paste (e.g., sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your_username --hp /home/your_username)
    pm2 save
    ```
    Your personal, persistent Ganache node is now live on your local network. You can verify its status and logs using:
    * `pm2 status`
    * `pm2 logs ganache-node`

---

## Part 2: Ngrok Setup (for Public DApp Access via Netlify)

Ngrok will provide a publicly accessible URL that tunnels directly to your Raspberry Pi's Ganache instance. This public URL is what your Netlify-hosted DApp will indirectly use (via the user's MetaMask setup).

**Goal:** Expose `http://0.0.0.0:8545` from your Raspberry Pi to the internet via a public Ngrok URL.

These steps are performed on your Raspberry Pi (via SSH).

### Step 1: Install Ngrok

```bash
# Install ngrok
curl -sSL [https://ngrok.com/download](https://ngrok.com/download) | bash
```

### Step 2: Authenticate Ngrok

You need an Ngrok account to get an authtoken.

1.  Go to the Ngrok website:
    * [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup) (if you don't have an account)
    * [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken) (if you have one)
2.  Copy your authtoken provided on the dashboard. It will look something like `2Xb3fGc4dE5fA6gH7iJ8kL9mN0oP1qR2sT3uV4wXyZ`.
3.  On your Raspberry Pi, run the command with your actual token:
    ```bash
    ngrok authtoken YOUR_ACTUAL_NGROK_AUTH_TOKEN
    ```

### Step 3: Start the Ngrok Tunnel for Ganache

Now, we'll start a tunnel for port `8545`. This command should be run on your Raspberry Pi.

```bash
ngrok http 8545 --log="stdout" > /home/hunda/ngrok.log &
```
* `ngrok http 8545`: Tells Ngrok to create an HTTP tunnel to port `8545` on your local machine.
* `--log="stdout" > /home/hunda/ngrok.log`: Redirects Ngrok's output to a specified log file.
* `&`: Runs the command in the background, so you can exit your SSH session without stopping the tunnel.

**To get the Ngrok URL:**
After running the command above, you can find the public URL Ngrok provides by checking the log file:
```bash
cat /home/hunda/ngrok.log
```
Look for a line that starts with `url=` or `msg="started tunnel"` and contains `http://` or `https://`. It will look something like:
`http://xxxxxx.ngrok-free.app` or `https://xxxxxx.ngrok-free.app`

**IMPORTANT:** This URL will change every time you stop and restart the Ngrok tunnel (unless you have a paid Ngrok plan for static domains). You will need to get this new URL each time you restart Ngrok.

### Step 4: Update Hardhat Configuration (on your Development Machine)

Now, on your main development computer, you need to update your `hardhat.config.js` to point to this new Ngrok URL.

1.  **Edit `hardhat.config.js`:**
    Ensure your `raspberrypi` network uses `process.env.RASPBERRY_PI_URL`.
    ```javascript
    // hardhat.config.js
    require("@nomiclabs/hardhat-ethers");
    require("dotenv").config();

    module.exports = {
      solidity: "0.8.28",
      networks: {
        // ... your existing networks ...
        raspberrypi: {
          url: process.env.RASPBERRY_PI_URL, // This will now come from Ngrok
          chainId: 1337,
          accounts: [
            "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Admin (0)
            "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // (1)
            "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // (2)
            "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", // (3)
            "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a", // (4)
            "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba", // (5)
            "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e", // (6)
            "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356", // (7)
            "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97", // (8)
            "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6"  // (9)
          ]
        }
      }
    };
    ```

2.  **Update `.env` file:**
    In your project's root directory (e.g., `~/gan/`) on your development machine, update your `.env` file with the current Ngrok URL you got from Step 3.

    ```
    RASPBERRY_PI_URL=YOUR_CURRENT_NGROK_HTTP_URL_HERE
    ```
    (e.g., `RASPBERRY_PI_URL=http://00a0-123-45-67-89.ngrok-free.app`)

### Step 5: Deploy Contracts to the Ngrok Tunnel

From your project's root directory (e.g., `/gan`) on your development machine, run the deployment script.

```bash
npx hardhat run scripts/hardhat-deploy.js --network raspberrypi
```
This command will deploy your smart contracts to your Ganache node, which is now publicly accessible via the Ngrok tunnel. Your frontend files (e.g., `contract-address.json`, `TimeTracking.json`) will be updated automatically with the new deployment information.

### Step 6: Deploy Frontend to Netlify

Once your contracts are deployed and your frontend files are updated, you can deploy your DApp's frontend.

1.  **Commit and Push Changes to Git:**
    Ensure all changes, especially the updated contract artifacts, are committed and pushed to your Git repository.
    ```bash
    git add .
    git commit -m "Update contract deployment for Ngrok"
    git push origin main # Or your main branch name
    ```
2.  **Netlify Automatic Deployment:**
    If your Netlify project is configured for continuous deployment from your Git repository, Netlify will automatically detect the new push and trigger a build and deployment.

### Step 7: Configure MetaMask for Testing (Client/Tester Side)

For anyone (including yourself) to use the Netlify-hosted DApp, they need to tell MetaMask to connect to your Ngrok-exposed Ganache.

1.  **Open MetaMask:**
    Open the MetaMask extension in your web browser.

2.  **Add a New Network:**
    * Click the network dropdown at the top (usually says "Ethereum Mainnet").
    * Select "Add network".
    * Choose "Add a network manually".

3.  **Fill in Network Details:**
    Enter the following information:
    * **Network Name:** `My Ngrok Ganache` (or any descriptive name you prefer)
    * **New RPC URL:** `YOUR_CURRENT_NGROK_HTTP_URL_HERE` (The exact same URL you put in your `.env` file).
    * **Chain ID:** `1337`
    * **Currency Symbol:** `ETH`
    * **Block Explorer URL (Optional):** You can leave this blank or use a local block explorer if you have one.
    * Click "Save".

4.  **Import Accounts:**
    To interact with your DApp using the pre-funded accounts from your Ganache mnemonic:
    * Click the circular account icon in MetaMask (top right).
    * Select "Import account".
    * Paste the private keys for the employer and employee accounts from your Hardhat configuration (or the ones generated by your Ganache mnemonic).
    * Click "Import". Repeat for all necessary accounts.

Now, your DApp on Netlify should work when MetaMask is configured to your "My Ngrok Ganache" network, allowing you and others to interact with your Raspberry Pi's persistent Ganache node!

---

## Part 3: Troubleshooting and Rerunning Ngrok (Important for Free Tier)

Since the free Ngrok tier provides temporary URLs, you will need to re-configure your setup periodically. Here's how to manage it.

### Checking Status and Logs

1.  **Check if Ganache is running (pm2):**
    ```bash
    pm2 list
    ```
    This will show you the status of your `ganache-node` process.

2.  **View Ganache logs:**
    ```bash
    pm2 logs ganache-node
    ```
    This is useful for debugging any issues with Ganache itself.

3.  **Check Ngrok logs:**
    ```bash
    cat /home/hunda/ngrok.log
    ```
    This file contains the public URL provided by Ngrok and any other Ngrok-related messages.

4.  **Check if Ngrok is running:**
    ```bash
    ps aux | grep ngrok
    ```
    This command will show if the Ngrok process is active.

5.  **Check if Ganache is listening for connections:**
    You can test if Ganache is accessible on its local port.
    ```bash
    curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545
    ```
    A successful response will show the current block number.

### Rerunning Ngrok and Updating Configuration

If your Ngrok tunnel has expired or you've restarted your Raspberry Pi, you'll need to get a new Ngrok URL.

1.  **Stop the existing Ngrok tunnel (if running):**
    First, find the Ngrok process ID:
    ```bash
    ps aux | grep ngrok
    ```
    Then, kill the process (replace `<PID>` with the actual process ID):
    ```bash
    kill <PID>
    ```
    Alternatively, you can try `pkill ngrok` if you're sure you want to stop all Ngrok processes.

2.  **Re-authenticate Ngrok (if needed):**
    If your authtoken has changed or you're setting up on a new device, use the `ngrok authtoken` command again. You can use your existing token or a new one.
    ```bash
    ngrok authtoken YOUR_ACTUAL_NGROK_AUTH_TOKEN
    ```
    (e.g., `ngrok authtoken 2zehAKzHXDP6ACwrW9VH2ujclzp_36f4jVXBPZACDDabg7WVZ`)

3.  **Start a new Ngrok tunnel:**
    ```bash
    ngrok http 8545 --log="stdout" > /home/hunda/ngrok.log &
    ```
    This will create a new tunnel and log its details to the specified file.

4.  **Get the new Ngrok URL:**
    ```bash
    cat /home/hunda/ngrok.log
    ```
    Locate the new `http://` or `https://` URL.

5.  **Update Hardhat Configuration (on your Development Machine):**
    * Edit your project's `.env` file and replace `RASPBERRY_PI_URL` with the **new Ngrok URL**.
        ```
        RASPBERRY_PI_URL=YOUR_NEW_NGROK_HTTP_URL_HERE
        ```
    * You **do not** need to change `hardhat.config.js` again unless the structure of your network configuration changes.

6.  **Redeploy Contracts to the New Ngrok Tunnel:**
    From your project's root directory on your development machine:
    ```bash
    npx hardhat run scripts/hardhat-deploy.js --network raspberrypi
    ```
    This will deploy your contracts to the Ganache instance now accessible via the new Ngrok URL, updating your frontend's contract artifacts.

7.  **Redeploy Frontend to Netlify:**
    Commit and push your changes to Git. Netlify will automatically redeploy your frontend with the updated contract addresses.

8.  **Configure MetaMask for Testing (Client/Tester Side):**
    **Crucially, anyone using your DApp (including yourself) will need to update their MetaMask network settings with the new Ngrok URL.**
    * Open MetaMask.
    * Click the network dropdown.
    * Select "Settings" -> "Networks".
    * Find your "My Ngrok Ganache" network and click on it.
    * Edit the "New RPC URL" field to the **new Ngrok URL**.
    * Save the network.

By following these steps, you can keep your DApp accessible even with Ngrok's changing URLs.
