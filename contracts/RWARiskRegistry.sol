// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RWARiskRegistry
 * @dev On-chain registry for RWA (Real World Asset) risk analysis data
 * @notice Stores risk scores and analysis metadata for tokenized real-world assets
 * @custom:security-contact security@risklens.io
 */
contract RWARiskRegistry {
    
    // ============ Enums ============
    
    enum AssetType { RealEstate, Bonds, Invoices, Commodities }
    enum RiskLevel { Low, Medium, High, Critical }
    
    // ============ Structs ============
    
    struct RiskAnalysis {
        uint256 overallScore;
        uint256 financialHealthScore;
        uint256 teamCredibilityScore;
        uint256 marketViabilityScore;
        uint256 regulatoryComplianceScore;
        uint256 technicalImplementationScore;
        RiskLevel riskLevel;
        string ipfsHash;
        uint256 timestamp;
        address analyzer;
    }
    
    struct Project {
        string name;
        AssetType assetType;
        address tokenContract;
        uint256 totalValue;
        string tokenSymbol;
        bool isActive;
        uint256 registeredAt;
        address owner;
    }
    
    struct AnalysisInput {
        uint256 overallScore;
        uint256 financialHealthScore;
        uint256 teamCredibilityScore;
        uint256 marketViabilityScore;
        uint256 regulatoryComplianceScore;
        uint256 technicalImplementationScore;
        string ipfsHash;
    }
    
    // ============ State Variables ============
    
    address public owner;
    bool public paused;
    bool private locked;
    
    mapping(bytes32 => Project) public projects;
    mapping(bytes32 => RiskAnalysis[]) internal _projectAnalyses;
    mapping(bytes32 => bool) public projectExists;
    mapping(address => bool) public authorizedAnalyzers;
    
    bytes32[] public projectIds;
    
    uint256 public totalProjects;
    uint256 public totalAnalyses;
    
    uint256 public constant MAX_SCORE = 100;
    uint256 public constant MIN_ANALYSIS_INTERVAL = 1 hours;
    
    // ============ Events ============
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Paused(address account);
    event Unpaused(address account);
    
    event ProjectRegistered(
        bytes32 indexed projectId,
        string name,
        AssetType assetType,
        address tokenContract,
        address indexed owner
    );
    
    event AnalysisSubmitted(
        bytes32 indexed projectId,
        uint256 overallScore,
        RiskLevel riskLevel,
        address indexed analyzer
    );
    
    event AnalyzerAuthorized(address indexed analyzer, bool status);
    event ProjectStatusChanged(bytes32 indexed projectId, bool isActive);
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier onlyAuthorizedAnalyzer() {
        require(
            authorizedAnalyzers[msg.sender] || msg.sender == owner,
            "Not authorized analyzer"
        );
        _;
    }
    
    modifier projectMustExist(bytes32 projectId) {
        require(projectExists[projectId], "Project does not exist");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
        authorizedAnalyzers[msg.sender] = true;
        emit OwnershipTransferred(address(0), msg.sender);
    }
    
    // ============ Owner Functions ============
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    function setAnalyzerAuthorization(address analyzer, bool status) external onlyOwner {
        authorizedAnalyzers[analyzer] = status;
        emit AnalyzerAuthorized(analyzer, status);
    }
    
    // ============ External Functions ============
    
    function registerProject(
        string calldata name,
        AssetType assetType,
        address tokenContract,
        uint256 totalValue,
        string calldata tokenSymbol
    ) external whenNotPaused returns (bytes32) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(tokenSymbol).length > 0, "Symbol cannot be empty");
        
        bytes32 projectId = keccak256(
            abi.encodePacked(name, tokenContract, block.timestamp, msg.sender)
        );
        
        require(!projectExists[projectId], "Project already exists");
        
        projects[projectId] = Project({
            name: name,
            assetType: assetType,
            tokenContract: tokenContract,
            totalValue: totalValue,
            tokenSymbol: tokenSymbol,
            isActive: true,
            registeredAt: block.timestamp,
            owner: msg.sender
        });
        
        projectExists[projectId] = true;
        projectIds.push(projectId);
        totalProjects++;
        
        emit ProjectRegistered(projectId, name, assetType, tokenContract, msg.sender);
        
        return projectId;
    }
    
    function submitAnalysis(
        bytes32 projectId,
        AnalysisInput calldata data
    ) 
        external 
        whenNotPaused
        nonReentrant
        onlyAuthorizedAnalyzer
        projectMustExist(projectId)
    {
        _validateScores(data);
        RiskLevel riskLevel = _recordAnalysis(projectId, msg.sender, data);
        emit AnalysisSubmitted(projectId, data.overallScore, riskLevel, msg.sender);
    }
    
    function setProjectStatus(bytes32 projectId, bool isActive) 
        external 
        projectMustExist(projectId)
    {
        require(
            msg.sender == projects[projectId].owner || msg.sender == owner,
            "Not authorized"
        );
        
        projects[projectId].isActive = isActive;
        emit ProjectStatusChanged(projectId, isActive);
    }
    
    // ============ View Functions ============
    
    function getLatestAnalysis(bytes32 projectId) 
        external 
        view 
        projectMustExist(projectId)
        returns (RiskAnalysis memory) 
    {
        require(_projectAnalyses[projectId].length > 0, "No analyses available");
        return _projectAnalyses[projectId][_projectAnalyses[projectId].length - 1];
    }
    
    function getProjectAnalyses(bytes32 projectId) 
        external 
        view 
        projectMustExist(projectId)
        returns (RiskAnalysis[] memory) 
    {
        return _projectAnalyses[projectId];
    }
    
    function getAnalysisCount(bytes32 projectId) 
        external 
        view 
        projectMustExist(projectId)
        returns (uint256) 
    {
        return _projectAnalyses[projectId].length;
    }
    
    function getAllProjectIds() external view returns (bytes32[] memory) {
        return projectIds;
    }
    
    function getProject(bytes32 projectId) 
        external 
        view 
        projectMustExist(projectId)
        returns (Project memory) 
    {
        return projects[projectId];
    }
    
    function isAuthorizedAnalyzer(address analyzer) external view returns (bool) {
        return authorizedAnalyzers[analyzer];
    }
    
    // ============ Internal Functions ============
    
    function _validateScores(AnalysisInput calldata data) internal pure {
        require(data.overallScore <= MAX_SCORE, "Overall score exceeds max");
        require(data.financialHealthScore <= MAX_SCORE, "Financial score exceeds max");
        require(data.teamCredibilityScore <= MAX_SCORE, "Team score exceeds max");
        require(data.marketViabilityScore <= MAX_SCORE, "Market score exceeds max");
        require(data.regulatoryComplianceScore <= MAX_SCORE, "Regulatory score exceeds max");
        require(data.technicalImplementationScore <= MAX_SCORE, "Technical score exceeds max");
    }
    
    function _recordAnalysis(
        bytes32 projectId,
        address analyzer,
        AnalysisInput calldata data
    ) internal returns (RiskLevel) {
        RiskAnalysis[] storage analyses = _projectAnalyses[projectId];
        
        if (analyses.length > 0) {
            require(
                block.timestamp >= analyses[analyses.length - 1].timestamp + MIN_ANALYSIS_INTERVAL,
                "Too soon since last analysis"
            );
        }
        
        RiskLevel riskLevel = _calculateRiskLevel(data.overallScore);
        
        analyses.push(RiskAnalysis({
            overallScore: data.overallScore,
            financialHealthScore: data.financialHealthScore,
            teamCredibilityScore: data.teamCredibilityScore,
            marketViabilityScore: data.marketViabilityScore,
            regulatoryComplianceScore: data.regulatoryComplianceScore,
            technicalImplementationScore: data.technicalImplementationScore,
            riskLevel: riskLevel,
            ipfsHash: data.ipfsHash,
            timestamp: block.timestamp,
            analyzer: analyzer
        }));
        
        totalAnalyses++;
        
        return riskLevel;
    }
    
    function _calculateRiskLevel(uint256 score) internal pure returns (RiskLevel) {
        if (score >= 75) return RiskLevel.Low;
        if (score >= 50) return RiskLevel.Medium;
        if (score >= 25) return RiskLevel.High;
        return RiskLevel.Critical;
    }
}
