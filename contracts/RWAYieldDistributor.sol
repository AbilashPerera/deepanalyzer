// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title RWAYieldDistributor
 * @dev Distributes yield from real-world assets to token holders
 * @notice Allows proportional yield distribution based on token holdings
 */
contract RWAYieldDistributor is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // ============ State Variables ============
    
    IERC20 public immutable rwaToken;
    IERC20 public immutable yieldToken;
    
    uint256 public totalYieldDistributed;
    uint256 public currentEpoch;
    
    struct Epoch {
        uint256 totalYield;
        uint256 snapshotTotalSupply;
        uint256 startTime;
        uint256 endTime;
        bool finalized;
    }
    
    struct UserInfo {
        uint256 lastClaimedEpoch;
        uint256 totalClaimed;
    }
    
    mapping(uint256 => Epoch) public epochs;
    mapping(address => UserInfo) public userInfo;
    mapping(uint256 => mapping(address => uint256)) public snapshotBalances;
    
    uint256 public constant EPOCH_DURATION = 30 days;
    uint256 public constant MIN_YIELD_AMOUNT = 1e18;
    
    // ============ Events ============
    
    event EpochStarted(uint256 indexed epoch, uint256 startTime);
    event YieldDeposited(uint256 indexed epoch, uint256 amount);
    event EpochFinalized(uint256 indexed epoch, uint256 totalYield, uint256 snapshotSupply);
    event YieldClaimed(address indexed user, uint256 indexed epoch, uint256 amount);
    event SnapshotTaken(uint256 indexed epoch, address indexed user, uint256 balance);
    
    // ============ Constructor ============
    
    constructor(address _rwaToken, address _yieldToken) Ownable(msg.sender) {
        require(_rwaToken != address(0), "Invalid RWA token");
        require(_yieldToken != address(0), "Invalid yield token");
        
        rwaToken = IERC20(_rwaToken);
        yieldToken = IERC20(_yieldToken);
        
        currentEpoch = 1;
        epochs[currentEpoch].startTime = block.timestamp;
        
        emit EpochStarted(currentEpoch, block.timestamp);
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Take a snapshot of a user's balance for the current epoch
     * @param user Address to snapshot
     */
    function takeSnapshot(address user) external whenNotPaused {
        require(user != address(0), "Invalid address");
        require(!epochs[currentEpoch].finalized, "Epoch already finalized");
        
        uint256 balance = rwaToken.balanceOf(user);
        snapshotBalances[currentEpoch][user] = balance;
        
        emit SnapshotTaken(currentEpoch, user, balance);
    }
    
    /**
     * @notice Take snapshots for multiple users
     * @param users Addresses to snapshot
     */
    function batchTakeSnapshot(address[] calldata users) external whenNotPaused {
        require(!epochs[currentEpoch].finalized, "Epoch already finalized");
        
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] != address(0)) {
                uint256 balance = rwaToken.balanceOf(users[i]);
                snapshotBalances[currentEpoch][users[i]] = balance;
                emit SnapshotTaken(currentEpoch, users[i], balance);
            }
        }
    }
    
    /**
     * @notice Deposit yield for distribution
     * @param amount Amount of yield tokens to deposit
     */
    function depositYield(uint256 amount) external whenNotPaused {
        require(amount >= MIN_YIELD_AMOUNT, "Amount too small");
        require(!epochs[currentEpoch].finalized, "Epoch already finalized");
        
        yieldToken.safeTransferFrom(msg.sender, address(this), amount);
        epochs[currentEpoch].totalYield += amount;
        
        emit YieldDeposited(currentEpoch, amount);
    }
    
    /**
     * @notice Finalize the current epoch and start a new one
     */
    function finalizeEpoch() external onlyOwner whenNotPaused {
        Epoch storage epoch = epochs[currentEpoch];
        
        require(!epoch.finalized, "Epoch already finalized");
        require(
            block.timestamp >= epoch.startTime + EPOCH_DURATION,
            "Epoch not ended"
        );
        
        epoch.snapshotTotalSupply = rwaToken.totalSupply();
        epoch.endTime = block.timestamp;
        epoch.finalized = true;
        
        totalYieldDistributed += epoch.totalYield;
        
        emit EpochFinalized(currentEpoch, epoch.totalYield, epoch.snapshotTotalSupply);
        
        currentEpoch++;
        epochs[currentEpoch].startTime = block.timestamp;
        
        emit EpochStarted(currentEpoch, block.timestamp);
    }
    
    /**
     * @notice Claim yield for a specific epoch
     * @param epoch Epoch to claim from
     */
    function claimYield(uint256 epoch) external nonReentrant whenNotPaused {
        require(epochs[epoch].finalized, "Epoch not finalized");
        require(userInfo[msg.sender].lastClaimedEpoch < epoch, "Already claimed");
        
        uint256 userBalance = snapshotBalances[epoch][msg.sender];
        require(userBalance > 0, "No balance in snapshot");
        
        Epoch storage epochData = epochs[epoch];
        uint256 userShare = (epochData.totalYield * userBalance) / epochData.snapshotTotalSupply;
        
        require(userShare > 0, "No yield to claim");
        
        userInfo[msg.sender].lastClaimedEpoch = epoch;
        userInfo[msg.sender].totalClaimed += userShare;
        
        yieldToken.safeTransfer(msg.sender, userShare);
        
        emit YieldClaimed(msg.sender, epoch, userShare);
    }
    
    /**
     * @notice Claim yield for multiple epochs
     * @param epochsToClaim Array of epochs to claim from
     */
    function batchClaimYield(uint256[] calldata epochsToClaim) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        uint256 totalClaim = 0;
        uint256 maxEpochClaimed = userInfo[msg.sender].lastClaimedEpoch;
        
        for (uint256 i = 0; i < epochsToClaim.length; i++) {
            uint256 epoch = epochsToClaim[i];
            
            if (!epochs[epoch].finalized) continue;
            if (epoch <= userInfo[msg.sender].lastClaimedEpoch) continue;
            
            uint256 userBalance = snapshotBalances[epoch][msg.sender];
            if (userBalance == 0) continue;
            
            Epoch storage epochData = epochs[epoch];
            uint256 userShare = (epochData.totalYield * userBalance) / epochData.snapshotTotalSupply;
            
            if (userShare > 0) {
                totalClaim += userShare;
                if (epoch > maxEpochClaimed) {
                    maxEpochClaimed = epoch;
                }
                emit YieldClaimed(msg.sender, epoch, userShare);
            }
        }
        
        require(totalClaim > 0, "No yield to claim");
        
        userInfo[msg.sender].lastClaimedEpoch = maxEpochClaimed;
        userInfo[msg.sender].totalClaimed += totalClaim;
        
        yieldToken.safeTransfer(msg.sender, totalClaim);
    }
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Emergency withdraw (only when paused)
     * @param token Token to withdraw
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, address to, uint256 amount) 
        external 
        onlyOwner 
        whenPaused 
    {
        IERC20(token).safeTransfer(to, amount);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Calculate pending yield for a user
     * @param user User address
     * @param epoch Epoch to calculate for
     */
    function pendingYield(address user, uint256 epoch) external view returns (uint256) {
        if (!epochs[epoch].finalized) return 0;
        if (epoch <= userInfo[user].lastClaimedEpoch) return 0;
        
        uint256 userBalance = snapshotBalances[epoch][user];
        if (userBalance == 0) return 0;
        
        Epoch storage epochData = epochs[epoch];
        return (epochData.totalYield * userBalance) / epochData.snapshotTotalSupply;
    }
    
    /**
     * @notice Get total pending yield for a user across all unclaimed epochs
     * @param user User address
     */
    function totalPendingYield(address user) external view returns (uint256) {
        uint256 total = 0;
        uint256 lastClaimed = userInfo[user].lastClaimedEpoch;
        
        for (uint256 i = lastClaimed + 1; i < currentEpoch; i++) {
            if (!epochs[i].finalized) continue;
            
            uint256 userBalance = snapshotBalances[i][user];
            if (userBalance == 0) continue;
            
            Epoch storage epochData = epochs[i];
            total += (epochData.totalYield * userBalance) / epochData.snapshotTotalSupply;
        }
        
        return total;
    }
    
    /**
     * @notice Get epoch info
     * @param epoch Epoch number
     */
    function getEpochInfo(uint256 epoch) external view returns (
        uint256 totalYield,
        uint256 snapshotTotalSupply,
        uint256 startTime,
        uint256 endTime,
        bool finalized
    ) {
        Epoch storage e = epochs[epoch];
        return (
            e.totalYield,
            e.snapshotTotalSupply,
            e.startTime,
            e.endTime,
            e.finalized
        );
    }
    
    /**
     * @notice Get user info
     * @param user User address
     */
    function getUserInfo(address user) external view returns (
        uint256 lastClaimedEpoch,
        uint256 totalClaimed
    ) {
        UserInfo storage info = userInfo[user];
        return (info.lastClaimedEpoch, info.totalClaimed);
    }
}
