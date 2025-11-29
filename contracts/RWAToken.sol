// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title RWAToken
 * @dev ERC20 token representing a tokenized real-world asset
 * @notice This token can represent fractional ownership of RWAs like real estate, bonds, etc.
 */
contract RWAToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ERC20Permit {
    
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    // ============ State Variables ============
    
    string public assetDescription;
    string public legalDocumentHash;  // IPFS hash for legal documentation
    uint256 public underlyingAssetValue;
    
    mapping(address => bool) public whitelisted;
    bool public whitelistEnabled;
    
    uint256 public maxSupply;
    
    // ============ Events ============
    
    event AssetValueUpdated(uint256 oldValue, uint256 newValue);
    event WhitelistUpdated(address indexed account, bool status);
    event WhitelistToggled(bool enabled);
    event LegalDocumentUpdated(string oldHash, string newHash);
    
    // ============ Modifiers ============
    
    modifier whenWhitelistCompliant(address from, address to) {
        if (whitelistEnabled) {
            require(whitelisted[from] || from == address(0), "Sender not whitelisted");
            require(whitelisted[to] || to == address(0), "Recipient not whitelisted");
        }
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        string memory name,
        string memory symbol,
        string memory _assetDescription,
        uint256 _underlyingAssetValue,
        uint256 _maxSupply
    ) 
        ERC20(name, symbol) 
        ERC20Permit(name)
    {
        assetDescription = _assetDescription;
        underlyingAssetValue = _underlyingAssetValue;
        maxSupply = _maxSupply;
        whitelistEnabled = false;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        
        // Whitelist deployer
        whitelisted[msg.sender] = true;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Mint new tokens
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @notice Pause all token transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @notice Update the underlying asset value
     * @param newValue New asset value
     */
    function updateAssetValue(uint256 newValue) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emit AssetValueUpdated(underlyingAssetValue, newValue);
        underlyingAssetValue = newValue;
    }
    
    /**
     * @notice Update legal document IPFS hash
     * @param newHash New IPFS hash
     */
    function updateLegalDocument(string calldata newHash) external onlyRole(COMPLIANCE_ROLE) {
        emit LegalDocumentUpdated(legalDocumentHash, newHash);
        legalDocumentHash = newHash;
    }
    
    /**
     * @notice Toggle whitelist requirement
     * @param enabled Enable or disable whitelist
     */
    function setWhitelistEnabled(bool enabled) external onlyRole(COMPLIANCE_ROLE) {
        whitelistEnabled = enabled;
        emit WhitelistToggled(enabled);
    }
    
    /**
     * @notice Add or remove address from whitelist
     * @param account Address to update
     * @param status Whitelist status
     */
    function setWhitelisted(address account, bool status) external onlyRole(COMPLIANCE_ROLE) {
        whitelisted[account] = status;
        emit WhitelistUpdated(account, status);
    }
    
    /**
     * @notice Batch whitelist update
     * @param accounts Addresses to update
     * @param status Whitelist status
     */
    function batchSetWhitelisted(address[] calldata accounts, bool status) 
        external 
        onlyRole(COMPLIANCE_ROLE) 
    {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelisted[accounts[i]] = status;
            emit WhitelistUpdated(accounts[i], status);
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get token price based on underlying asset value
     * @return Price per token
     */
    function tokenPrice() external view returns (uint256) {
        if (totalSupply() == 0) return 0;
        return underlyingAssetValue / totalSupply();
    }
    
    /**
     * @notice Check if an account is whitelisted
     * @param account Address to check
     */
    function isWhitelisted(address account) external view returns (bool) {
        return whitelisted[account];
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Override transfer to check whitelist
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
        whenWhitelistCompliant(from, to)
    {
        super._update(from, to, value);
    }
}
