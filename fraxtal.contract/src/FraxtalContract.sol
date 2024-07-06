// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISFrax} from "../interface/ISFrax.sol";
import {IFraxferry} from "../interface/IFraxferry.sol";
import {IFrax} from "../interface/IFrax.sol";

contract StrategyContract {
    enum FunctionType {
        Deposit,
        DepositToFraxFi,
        WithdrawFrax,
        TransferFrax,
        WithdrawSfrax,
        TransferSfrax,
        SniperBot
    }

    struct FunctionCall {
        FunctionType functionType;
        bytes parameters; // bytes should contain   bool useSniper, userparams
    }

    struct Strategy {
        uint256 id;
        string name;
        string description;
        FunctionCall[] functionCalls;
        uint256 totalInvested;
        address creator;
        bool isActive;
        address[] participants;
    }

    mapping(address => uint256) public userBalances;
    mapping(uint256 => Strategy) public strategies;
    mapping(address => Strategy[]) public userStrategies;
    mapping(address => uint256) public userDepoistFraxFin;
    mapping(address => Strategy[]) public userInvestedStrategies;
    mapping(address => uint256) public rewardsClaimed;
    mapping(address => uint256) public sniperBotShares;
    mapping(address => bool) private isUser; 
    mapping(address => mapping(uint256 => uint256)) public userStrategyDeposits; // user => strategyId => depositedAmount
    mapping(uint256 => uint256) public strategyTotalDepositedCollateral; // strategyId => totalDepositedCollateral

    address[] private users; 

    uint256 public constant BRIDGE_FEE_PER_UNIT = 5 * 1e13; // $0.005 in wei assuming 18 decimals
    address public immutable nodeAddress;
    uint256 public strategyCounter;
    IFrax public immutable fraxToken;
    address owner;
    uint256 totalDepositedCollateral;
    uint256 updatedCollatralWithYield;
    uint256 totalSniperBotShares; 
    uint256 totalSniperBotProfits; 

    event StrategyCreated(address indexed creator, uint256 strategyId);
    event StrategyExecuted(address indexed user, uint256 strategyId,uint256 initialDepositBalance, uint256 initialDepositCollatral, uint256 finalDepositBalance, uint256 finalDepositCollatral);

    event ProfitsUpdated(address indexed user, uint256 profits);
    event WithdrawSFraxRequested(address indexed user, uint256 amount);
    event WithdrawReward(address indexed user, uint256 amount);
    event DepositSFraxRequested(address indexed user, uint256 amount);
    event TransferSFraxRequested(
        address indexed from,
        address indexed to,
        uint256 amount
    );
    event SniperBotCollateralAdded(address indexed user, uint256 amount);

    // ferryBridge = 0x00160baF84b3D2014837cc12e838ea399f8b8478 
    // sFraxToken = 0xfc00000000000000000000000000000000000008 frax
    // sFraxToken = 0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32 eth
    // frax_token = 0xFc00000000000000000000000000000000000001 frax
    // frax_token = 0x853d955aCEf822Db058eb8505911ED77F175b99e eth

    constructor(address _nodeAddress, address _fraxToken) {
        owner = msg.sender;
        fraxToken = IFrax(_fraxToken);
        nodeAddress = _nodeAddress;
        strategyCounter = 1; // Starting from 1 for simplicity
    }

    // called by node to after yield add on and node send frax to this contract
    function updateDepositedWithYield(uint256 newTotalWithYield) external {
        updatedCollatralWithYield = newTotalWithYield;
        distributeRewards();
    }
    function calculateStrategyRewards(address user, uint256 strategyId) internal view returns (uint256) {
            uint256 userDeposited = userStrategyDeposits[user][strategyId];
            uint256 strategyDeposited = strategyTotalDepositedCollateral[strategyId];

            if (userDeposited == 0 || strategyDeposited == 0) {
                return 0;
            }

            // Calculate user's updated collateral based on total yield
            uint256 userUpdatedCollateral = (userDeposited * updatedCollatralWithYield) /
                totalDepositedCollateral;
            uint256 totalRewards = userUpdatedCollateral > userDeposited
                ? userUpdatedCollateral - userDeposited
                : 0;
            uint256 netRewards = totalRewards > rewardsClaimed[user]
                ? totalRewards - rewardsClaimed[user]
                : 0;

            return netRewards;
        }

    function calculateRewards(address user) internal view returns (uint256) {
        uint256 userDeposited = userDepoistFraxFin[user];

        if (userDeposited == 0 || totalDepositedCollateral == 0) {
            return 0; 
        }

        uint256 userShare = (userDeposited * updatedCollatralWithYield) /
            totalDepositedCollateral;
        uint256 totalRewards = userShare > userDeposited
            ? userShare - userDeposited
            : 0;
        uint256 netRewards = totalRewards > rewardsClaimed[user]
            ? totalRewards - rewardsClaimed[user]
            : 0;

        return netRewards;
    }

     function distributeRewards() internal {
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            uint256 rewards = calculateRewards(user);
            if (rewards > 0) {
                rewardsClaimed[user] += rewards;
                // Transfer the rewards to the user
                userBalances[user] += rewards;
            }
        }
    }

    // Function to get user rewards
    function getUserRewards(address user) external view returns (uint256) {
        return calculateRewards(user);
    }

    function getUserStrategyRewards(address user, uint256 strategyId) external view returns (uint256) {
        return calculateStrategyRewards(user, strategyId);
    }

    // User deposit function
    function deposit(uint256 amount) public payable {
        require(amount > 0, "Deposit amount must be greater than 0");
        fraxToken.transferFrom(msg.sender, address(this), amount);
        userBalances[msg.sender] += amount;

          if (!isUser[msg.sender]) {
            isUser[msg.sender] = true;
            users.push(msg.sender);
        }
    }
        
    function getAllUsers() external view returns (address[] memory) {
        return users;
    }

    function createStrategy(
        string memory name,
        string memory description,
        FunctionCall[] memory functionCalls,
        bool isActive
    ) public {
        uint256 strategyId = strategyCounter++;

        // Push an empty strategy to user's strategies to allocate space
        userStrategies[msg.sender].push();
        
        // Get the index of the last added strategy in userStrategies
        uint256 userStrategyIndex = userStrategies[msg.sender].length - 1;

        // Manually copy the new strategy to user's strategies
        Strategy storage userStrategy = userStrategies[msg.sender][userStrategyIndex];
        userStrategy.id = strategyId;
        userStrategy.totalInvested = 0;
        userStrategy.creator = msg.sender;
        userStrategy.isActive = isActive;
        userStrategy.participants = new address[](0);
        userStrategy.name = name;
        userStrategy.description = description;

        // Manually copy functionCalls to userStrategy.functionCalls
        for (uint256 i = 0; i < functionCalls.length; i++) {
            userStrategy.functionCalls.push(functionCalls[i]);
        }

        strategies[strategyId] = userStrategy;
        emit StrategyCreated(msg.sender, strategyId);
    }

    // User execute strategy function
    function executeStrategy(
        uint256 strategyId,
        bytes[] memory parameters
    ) public {
        require(strategies[strategyId].isActive, "Strategy is not active");
         uint256 initialDepositBalance = userBalances[msg.sender];
         uint256 initialDepositCollatral = userDepoistFraxFin[msg.sender];
        
        userInvestedStrategies[msg.sender].push();
        uint index = userInvestedStrategies[msg.sender].length - 1;
        Strategy storage storedStrategy = userInvestedStrategies[msg.sender][index];
        strategies[strategyId].participants.push(msg.sender);

        storedStrategy.id = strategyId;
        storedStrategy.isActive = strategies[strategyId].isActive;
        storedStrategy.totalInvested = strategies[strategyId].totalInvested;
        storedStrategy.name = strategies[strategyId].name;
        storedStrategy.description = strategies[strategyId].description;
        storedStrategy.creator = strategies[strategyId].creator;
        storedStrategy.participants = strategies[strategyId].participants;
        
        // Ensure functionCalls array is prepared for data
        for (uint256 i = 0; i < strategies[strategyId].functionCalls.length; i++) {
            storedStrategy.functionCalls.push();  
            storedStrategy.functionCalls[i].functionType = strategies[strategyId].functionCalls[i].functionType;
            storedStrategy.functionCalls[i].parameters = parameters[i];  // direct assignment since it's just bytes[]
        }
      

        // Execute each function call in the strategy sequentially
        for (uint256 i = 0; i < storedStrategy.functionCalls.length; i++) {
            FunctionCall memory funcCall = storedStrategy.functionCalls[i];
            bytes memory funcParameters = parameters[i];

            if (funcCall.functionType == FunctionType.Deposit) {
                uint256 depositAmount = abi.decode(funcParameters, (uint256));
                storedStrategy.totalInvested += depositAmount;
                deposit(depositAmount);
            } else if (funcCall.functionType == FunctionType.DepositToFraxFi) {
                uint256 collateralAmount = abi.decode(
                    funcParameters,
                    (uint256)
                );
                depositToFraxFi(collateralAmount);
                userStrategyDeposits[msg.sender][strategyId] += collateralAmount;
                strategyTotalDepositedCollateral[strategyId] += collateralAmount;
            } else if (funcCall.functionType == FunctionType.WithdrawFrax) {
                uint256 withdrawAmount = abi.decode(funcParameters, (uint256));
                withdrawFrax(withdrawAmount);
            } else if (funcCall.functionType == FunctionType.WithdrawSfrax) {
                uint256 withdrawSFraxAmount = abi.decode(
                    funcParameters,
                    (uint256)
                );
                userStrategyDeposits[msg.sender][strategyId] -= withdrawSFraxAmount;
                strategyTotalDepositedCollateral[strategyId] -= withdrawSFraxAmount;
                withdrawSFrax(withdrawSFraxAmount);
            } else if (funcCall.functionType == FunctionType.TransferFrax) {
                (address recipient, uint256 transferAmount) = abi.decode(
                    funcParameters,
                    (address, uint256)
                );
                transferFrax(recipient, transferAmount);
            } else if (funcCall.functionType == FunctionType.TransferSfrax) {
                (address recipient, uint256 transferAmount) = abi.decode(
                    funcParameters,
                    (address, uint256)
                );
                transferSFrax(recipient, transferAmount);
            } else if (funcCall.functionType == FunctionType.SniperBot) {
                uint256 sniperBotAmount = abi.decode(funcParameters, (uint256));
                userDepoistFraxFin[msg.sender] -= sniperBotAmount;
                sniperBotShares[msg.sender] += sniperBotAmount;
                totalSniperBotShares += sniperBotAmount;
                emit SniperBotCollateralAdded(msg.sender, sniperBotAmount);
            }
        }
        uint256 finalDepositBalance = userBalances[msg.sender];
        uint256 finalDepositCollatral = userDepoistFraxFin[msg.sender];
        emit StrategyExecuted(msg.sender, strategyId, initialDepositBalance, initialDepositCollatral,finalDepositBalance, finalDepositCollatral);
    }

    // Function to approve SniperBot to spend sFRAX
    function sendRewardsToSniperBot(uint256 rewards) public {
        require(fraxToken.transfer(nodeAddress, rewards), "Transfer failed"); 
    }

    function distributeSniperBotProfits(uint256 totalProfits) internal {
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            uint256 userShares = sniperBotShares[user];
            if (userShares > 0) {
                uint256 userShareOfProfits = (userShares * totalProfits) / totalSniperBotShares;
                if (userShareOfProfits > 0) {
                    userBalances[user] += userShareOfProfits;
                    // emit WithdrawReward(user, userShareOfProfits);
                }
            }
        }
    }

    // Function to handle sniper bot ProfitsUpdated
    function reportSniperBotProfits(uint256 totalProfits) public {
        require(
            msg.sender == nodeAddress,
            "Only sniper bot contract can report profits"
        );

        totalSniperBotProfits += totalProfits; // Add to total profits

        emit ProfitsUpdated(address(0), totalProfits); 

        distributeSniperBotProfits(totalProfits);

    }

    function getUserSniperReward() public view returns (uint256) {
        uint256 userShares = sniperBotShares[msg.sender];
        require(userShares > 0, "No sniper bot shares");

        if (totalSniperBotShares == 0) {
            return 0; // Avoid division by zero
        }

        uint256 userReward = (userShares * totalSniperBotProfits) /
            totalSniperBotShares;
        return userReward;
    }

    // Function to withdraw sniper bot profits
    function withdrawSniperBotProfits() public {
        uint256 userShares = sniperBotShares[msg.sender];
        require(userShares > 0, "No sniper bot shares");

        // Calculate user's share of the total profits
        uint256 userShareOfProfits = (userShares * totalSniperBotProfits) /
            totalSniperBotShares;
        require(userShareOfProfits > 0, "No profits to withdraw");

        // Update state variables
        totalSniperBotShares -= userShares;
        sniperBotShares[msg.sender] = 0;
        totalSniperBotProfits -= userShareOfProfits;

        emit WithdrawReward(msg.sender, userShareOfProfits);
    }

    // Function to withdraw Frax funds
    function withdrawFrax(uint256 amount) public {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        userBalances[msg.sender] -= amount;
        fraxToken.transfer(msg.sender, amount);
    }

    // Function to withdraw sFrax tokens
    function withdrawSFrax(uint256 amount) public {
        require(
            userDepoistFraxFin[msg.sender] >= amount,
            "Insufficient balance"
        );
        userDepoistFraxFin[msg.sender] -= amount;

        emit WithdrawSFraxRequested(msg.sender, amount);
    }

    // Function to transfer Frax tokens to another address
    function transferFrax(address recipient, uint256 amount) public {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        userBalances[msg.sender] -= amount;
        userBalances[recipient] += amount;
    }

    // Function to transfer sFRAX tokens to another address
    function transferSFrax(address recipient, uint256 amount) public {
        require(
            userDepoistFraxFin[msg.sender] >= amount,
            "Insufficient balance"
        );
        userDepoistFraxFin[msg.sender] -= amount;

        emit TransferSFraxRequested(msg.sender, recipient, amount);
    }

    function depositToFraxFi(uint256 amount) public {
        uint256 fee = (amount * BRIDGE_FEE_PER_UNIT) / 1e18;
        uint256 netAmount = amount - fee;
        totalDepositedCollateral += netAmount;
        require(netAmount > 0, "Insufficient amount to cover fee");

        userBalances[msg.sender] -= amount;
        userDepoistFraxFin[msg.sender] += netAmount;

        // @todo - send to node so he can deposit instead of us
        fraxToken.transfer(nodeAddress, amount);

        emit DepositSFraxRequested(msg.sender, amount);
    }

    // Getter function for user strategies
    function getUserStrategies(
        address user
    ) public view returns (Strategy[] memory) {
        return userStrategies[user];
    }

    function getUserInvestedStrategyIds(
        address user
    ) public view returns (Strategy[] memory) {
        return userInvestedStrategies[user];
    }

    function getAllStrategies() public view returns (Strategy[] memory) {
        Strategy[] memory allStrategies = new Strategy[](strategyCounter - 1);
        for (uint256 i = 1; i < strategyCounter; i++) {
            allStrategies[i - 1] = strategies[i];
        }
        return allStrategies;
    }

    function getTotalDepositedCollateral() public view returns (uint256) {
        return totalDepositedCollateral;
    }

    receive() external payable {}

    fallback() external payable {}
}
