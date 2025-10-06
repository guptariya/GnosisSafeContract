```markdown
<div align="center">

# 🛡️ Gnosis Safe AllowlistGuard

### Custom Smart Contract Guard for Enhanced Safe Wallet Security

[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-e6e6e6?style=for-the-badge&logo=solidity&logoColor=black)](https://docs.soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-FFF100?style=for-the-badge&logo=hardhat&logoColor=black)](https://hardhat.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)](https://ethereum.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[🚀 Live Demo](#-deployed-contracts) • [📖 Documentation](#-how-it-works) • [🧪 Run Tests](#-quick-start) • [🤝 Contribute](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Deployed Contracts](#-deployed-contracts)
- [Quick Start](#-quick-start)
- [How It Works](#-how-it-works)
- [Architecture](#-architecture)
- [Security](#-security)
- [Use Cases](#-use-cases)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**AllowlistGuard** is a production-ready smart contract that extends [Gnosis Safe](https://safe.global/) (formerly Gnosis Safe) with allowlist-based transaction validation. By implementing the Guard interface, this contract ensures that Safe wallets can only send transactions to pre-approved addresses.

### The Problem

Traditional Safe wallets allow transactions to any address. While multi-signature requirements add security, there's no way to restrict *where* funds can go.

### The Solution

AllowlistGuard acts as a gatekeeper, validating every transaction before execution. Only addresses on the approved allowlist can receive funds, providing an additional layer of security for DAOs, treasuries, and institutional wallets.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔒 Security First
- ✅ Allowlist-based validation
- ✅ Owner-only controls
- ✅ Zero address protection
- ✅ Custom error handling
- ✅ Event emission for transparency

</td>
<td width="50%">

### ⚡ Developer Friendly
- ✅ Gas optimized
- ✅ Comprehensive tests
- ✅ ERC165 interface support
- ✅ Well-documented code
- ✅ Hardhat integration

</td>
</tr>
</table>

### Key Capabilities

| Feature | Description |
|---------|-------------|
| 🎯 **Allowlist Management** | Add or remove approved addresses dynamically |
| 📦 **Batch Operations** | Add multiple addresses in a single transaction |
| 🔐 **Access Control** | Only guard owner can modify the allowlist |
| 🚨 **Transaction Blocking** | Automatically revert unauthorized transactions |
| 📊 **Event Logging** | Track all allowlist changes and validations |

---

## 🚀 Deployed Contracts

### Sepolia Testnet (Verified)

| Contract | Address | Explorer |
|----------|---------|----------|
| **AllowlistGuard** | `0x78C7696272a0c30bd6b5173EB68d7f2c5bd2df55` | [View on Etherscan ↗](https://sepolia.etherscan.io/address/0x78C7696272a0c30bd6b5173EB68d7f2c5bd2df55) |
| **MockSafe** | `0xC0F64bc4Db7D5eDCC9388F517485D898Ecae4370` | [View on Etherscan ↗](https://sepolia.etherscan.io/address/0xC0F64bc4Db7D5eDCC9388F517485D898Ecae4370) |

<div align="center">

**🌐 Network:** Ethereum Sepolia Testnet  
**⛽ Gas Optimized:** ~50k gas per allowlist addition  
**✅ Verified:** Source code verified on Etherscan

</div>

---

## ⚡ Quick Start

### Prerequisites

```bash
Node.js >= v16
npm or yarn
Git
```

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/YOUR-USERNAME/gnosis-safe-allowlist-guard.git
cd gnosis-safe-allowlist-guard

# 2️⃣ Install dependencies
npm install --legacy-peer-deps

# 3️⃣ Set up environment variables
cp .env.example .env
# Edit .env with your SEPOLIA_RPC_URL and PRIVATE_KEY

# 4️⃣ Compile contracts
npx hardhat compile

# 5️⃣ Run tests
npx hardhat test
```

---

## 🏗️ How It Works

### The Guard Pattern

Guards are smart contracts that hook into Safe transaction execution:

```
┌─────────────────────────────────────────────────────┐
│                    Safe Wallet                       │
│                                                      │
│  1. Transaction Proposed ───────────────────┐       │
│                                              │       │
│  2. Signatures Collected                    ▼       │
│                                    ┌─────────────────┤
│  3. Execute Transaction ──────────►│  Guard Contract │
│                                    │                 │
│     ┌─────────────────────────────│ checkTransaction│
│     │                              │      ↓          │
│     │ ✅ Allowlisted               │   Validate      │
│     │    Transaction Executes      │      ↓          │
│     │                              │   ✅ or ❌     │
│     │ ❌ Not Allowlisted           └─────────────────┤
│     │    Transaction Reverts                        │
│     │                                               │
│  4. Post-execution Check ◄────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Implementation Flow

```solidity
// 1️⃣ Deploy the Guard
AllowlistGuard guard = new AllowlistGuard(
    owner,
    [approvedAddress1, approvedAddress2]
);

// 2️⃣ Set Guard on Safe
safe.setGuard(address(guard));

// 3️⃣ Add addresses to allowlist
guard.addToAllowlist(newAddress);

// 4️⃣ Transactions are now protected
safe.execTransaction(allowlistedAddr, ...);  // ✅ Success
safe.execTransaction(randomAddr, ...);       // ❌ Reverts
```

---

## 🏛️ Architecture

### Contract Structure

```
AllowlistGuard
├── State Variables
│   ├── owner (address)
│   └── allowlist (mapping)
├── Events
│   ├── AddressAllowlisted
│   ├── AddressRemovedFromAllowlist
│   └── TransactionChecked
├── Errors
│   ├── NotOwner
│   ├── AddressNotAllowlisted
│   └── ZeroAddress
└── Functions
    ├── checkTransaction()      // Guard hook (before execution)
    ├── checkAfterExecution()   // Guard hook (after execution)
    ├── addToAllowlist()        // Owner only
    ├── removeFromAllowlist()   // Owner only
    ├── batchAddToAllowlist()   // Owner only
    ├── isAllowlisted()         // View
    └── supportsInterface()     // ERC165
```

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Solidity | 0.8.19 | Smart contract language |
| Hardhat | 2.22 | Development environment |
| Ethers.js | 6.13 | Ethereum library |
| Chai | 4.3 | Testing framework |

---

## 🔐 Security

### Security Features

- ✅ **Access Control**: Only the guard owner can modify the allowlist
- ✅ **Input Validation**: Zero address checks prevent accidental burns
- ✅ **Custom Errors**: Gas-efficient error handling
- ✅ **Event Emission**: All state changes emit events for transparency
- ✅ **Reentrancy Safe**: No external calls in validation logic

### Best Practices Implemented

```solidity
✓ Use of custom errors for gas optimization
✓ Checks-Effects-Interactions pattern
✓ Access control with modifiers
✓ Explicit function visibility
✓ NatSpec documentation
✓ Event emission for state changes
```

---

## 💼 Use Cases

### 1. DAO Treasury Management
Restrict DAO funds to only flow to approved vendors, grants, and operational addresses.

### 2. Corporate Payroll
Ensure company Safe only pays verified employee wallets.

### 3. Investment Fund
Limit DeFi protocol interactions to audited, approved contracts.

### 4. Escrow Services
Create time-bound or condition-based payment restrictions.

---

## 📚 API Reference

### Core Functions

#### `checkTransaction()`
```solidity
function checkTransaction(
    address to,
    uint256 value,
    bytes memory data,
    Operation operation,
    ...
) external
```
Validates transaction before execution. Reverts if `to` address is not allowlisted.

---

#### `addToAllowlist(address target)`
```solidity
function addToAllowlist(address target) external onlyOwner
```
Adds an address to the allowlist.

**Access:** Owner only  
**Events:** Emits `AddressAllowlisted(address)`

---

#### `batchAddToAllowlist(address[] calldata targets)`
```solidity
function batchAddToAllowlist(address[] calldata targets) external onlyOwner
```
Adds multiple addresses to the allowlist in one transaction.

---

#### `removeFromAllowlist(address target)`
```solidity
function removeFromAllowlist(address target) external onlyOwner
```
Removes an address from the allowlist.

---

#### `isAllowlisted(address target)`
```solidity
function isAllowlisted(address target) external view returns (bool)
```
Checks if an address is allowlisted.

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run coverage
npx hardhat coverage
```

### Test Coverage

```
AllowlistGuard with Safe
  Guard Deployment
    ✓ Should deploy with correct owner
    ✓ Should have initial allowlisted address
  Guard Management
    ✓ Should allow owner to add address
    ✓ Should allow owner to remove address
    ✓ Should batch add addresses
  Transaction Validation
    ✓ Should allow transaction to allowlisted address
    ✓ Should reject transaction to non-allowlisted address

  8 passing (2s)
```

---

## 🚀 Deployment

### Local Development

```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment (Sepolia)

```bash
# 1. Get testnet ETH from faucet
# Visit: https://sepoliafaucet.com/

# 2. Configure .env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY
PRIVATE_KEY=your-private-key-without-0x

# 3. Deploy
npx hardhat run scripts/deploy.js --network sepolia

# 4. Verify on Etherscan
npx hardhat verify --network sepolia DEPLOYED_ADDRESS "CONSTRUCTOR_ARGS"
```

---

## 📁 Project Structure

```
gnosis-safe-allowlist-guard/
├── contracts/
│   ├── AllowlistGuard.sol      # Main Guard implementation
│   └── MockSafe.sol             # Safe mock for testing
├── test/
│   └── AllowlistGuard.test.js  # Comprehensive test suite
├── scripts/
│   └── deploy.js                # Deployment script
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Dependencies
├── README.md                    # Documentation
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
└── LICENSE                      # MIT License
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 👨‍💻 Author

**Riya Gupta**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/guptariya)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/riyagupta28)

---

## 🙏 Acknowledgments

- **[Gnosis Safe](https://safe.global/)** - Safe smart account architecture
- **[OpenZeppelin](https://openzeppelin.com/)** - Security best practices
- **[Hardhat](https://hardhat.org/)** - Development environment
- **[Ethereum Community](https://ethereum.org/)** - Continuous innovation

---

## 📚 Resources

- [Gnosis Safe Documentation](https://docs.safe.global/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)

---
## Example
https://sepolia.etherscan.io/address/0xEF8B74EA469E27F2367EA7392b2c3C53AEAE0Dce

<div align="center">

### ⭐ If you find this project useful, please give it a star!

**Built with ❤️ for blockchain security**

</div>
```
