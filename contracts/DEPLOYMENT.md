# Smart Contract Deployment Guide

This guide explains how to deploy the RWA Risk Analyzer smart contracts on Mantle Network.

## Prerequisites

1. Install Foundry or Hardhat for Solidity development
2. Have MNT (Mantle native token) for gas fees
3. OpenZeppelin Contracts v5.0+ installed

## Contract Overview

### 1. RWARiskRegistry.sol
**Purpose**: On-chain registry for storing risk analysis data for RWA projects.

**Key Functions**:
- `registerProject()` - Register a new RWA project
- `submitAnalysis()` - Submit AI risk analysis on-chain
- `getLatestAnalysis()` - Retrieve the latest risk assessment
- `getProject()` - Get project details

**Constructor**: No arguments needed (deployer becomes owner)

### 2. RWAToken.sol
**Purpose**: ERC20 token representing fractional ownership of a real-world asset.

**Constructor Parameters**:
```solidity
constructor(
    string memory name,           // e.g., "Manhattan Real Estate Token"
    string memory symbol,         // e.g., "MPRE"
    string memory _assetDescription,  // Description of underlying asset
    uint256 _underlyingAssetValue,    // Total value in wei
    uint256 _maxSupply               // Maximum token supply
)
```

**Key Features**:
- Whitelist compliance for regulated securities
- Pausable transfers for emergencies
- Asset value tracking

### 3. RWAYieldDistributor.sol
**Purpose**: Distributes yield from real-world assets to token holders proportionally.

**Constructor Parameters**:
```solidity
constructor(
    address _rwaToken,     // Address of deployed RWAToken
    address _yieldToken    // Address of token used for yield (e.g., USDC, MNT)
)
```

## Deployment Steps

### Step 1: Deploy RWARiskRegistry
```bash
# Using Foundry
forge create --rpc-url https://rpc.mantle.xyz \
  --private-key YOUR_PRIVATE_KEY \
  contracts/RWARiskRegistry.sol:RWARiskRegistry
```

### Step 2: Deploy RWAToken (for each RWA project)
```bash
forge create --rpc-url https://rpc.mantle.xyz \
  --private-key YOUR_PRIVATE_KEY \
  --constructor-args "My RWA Token" "MRWA" "Tokenized real estate in NYC" 100000000000000000000000 10000000000000000000000000 \
  contracts/RWAToken.sol:RWAToken
```

### Step 3: Deploy RWAYieldDistributor
```bash
forge create --rpc-url https://rpc.mantle.xyz \
  --private-key YOUR_PRIVATE_KEY \
  --constructor-args RWA_TOKEN_ADDRESS YIELD_TOKEN_ADDRESS \
  contracts/RWAYieldDistributor.sol:RWAYieldDistributor
```

## Network Configuration

### Mantle Mainnet
- **Chain ID**: 5000 (0x1388)
- **RPC URL**: https://rpc.mantle.xyz
- **Block Explorer**: https://explorer.mantle.xyz

### Mantle Sepolia Testnet (Recommended for testing first)
- **Chain ID**: 5003 (0x138b)
- **RPC URL**: https://rpc.sepolia.mantle.xyz
- **Block Explorer**: https://sepolia.mantlescan.xyz
- **Faucet**: https://faucet.sepolia.mantle.xyz

## Post-Deployment

1. **Verify Contracts**: Use Mantle's block explorer to verify source code
2. **Authorize Analyzers**: Call `setAnalyzerAuthorization(address, true)` on RWARiskRegistry
3. **Configure Integration**: Update your app with deployed contract addresses

## Security Considerations

- All contracts use OpenZeppelin's security patterns (ReentrancyGuard, Pausable, Ownable)
- Risk scores are validated to be 0-100 range
- Analysis submissions have minimum time intervals to prevent spam
- Whitelist feature for compliance with securities regulations

## Gas Estimates (Mantle)

| Function | Estimated Gas |
|----------|---------------|
| registerProject | ~150,000 |
| submitAnalysis | ~200,000 |
| mint (RWAToken) | ~65,000 |
| claimYield | ~80,000 |

Note: Mantle has significantly lower gas costs than Ethereum mainnet.
