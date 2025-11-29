# Blockchain-Certificate-Validator
🎓 Decentralized certificate issuance &amp; verification system using blockchain technology. Issue tamper-proof certificates, verify instantly via QR code, and store permanently on Polygon blockchain. Built with React, Node.js, Solidity &amp; Web3.js. Perfect solution for educational institutions to combat certificate fraud.
# 🎓 Blockchain Certificate Validator

A decentralized certificate issuance and verification system built with React, Node.js, and Solidity.

![Demo](https://img.shields.io/badge/Status-Active-success)
![Blockchain](https://img.shields.io/badge/Blockchain-Polygon-purple)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

- ✅ Issue tamper-proof certificates on blockchain
- ✅ Instant verification via QR code
- ✅ Permanent, immutable storage
- ✅ PDF certificate generation
- ✅ Real-time analytics dashboard
- ✅ Multi-institution support

## 🎯 Problem Solved

Certificate forgery is a **$200B+ global problem**. Our solution:
- Makes certificates tamper-proof using blockchain
- Enables instant verification by anyone, anywhere
- Eliminates need for central verification authority
- Costs pennies per certificate

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, Web3.js
- **Blockchain**: Solidity, Polygon Mumbai Testnet
- **Tools**: Remix IDE, MetaMask, Infura

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MetaMask browser extension
- Test MATIC tokens ([Get free](https://faucet.polygon.technology/))

### Installation

1. **Clone repository**
```bash
git clone https://github.com/YOUR_USERNAME/blockchain-certificate-validator.git
cd blockchain-certificate-validator
```

2. **Deploy Smart Contract**
- Open [Remix IDE](https://remix.ethereum.org/)
- Copy `contracts/CertificateRegistry.sol`
- Compile with Solidity 0.8.0+
- Deploy to Polygon Mumbai Testnet
- Copy contract address

3. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

4. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

5. **Open Browser**
