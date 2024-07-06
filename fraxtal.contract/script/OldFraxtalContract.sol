// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
        string name;
        string details;
        FunctionCall[] functionCalls;
        uint256 totalInvested;
        address creator;
        bool isActive;
        address[] participants;
    }

    mapping(address => uint256) public userBalances;
    mapping(uint256 => Strategy) public strategies;
    mapping(address => uint256[]) public userStrategies;
    mapping(address => uint256) userDepoistFraxFin;
    mapping(address => uint256[]) public userInvestedStrategies;


    uint256 public strategyCounter;
    address public sniperBotContract;
    ISFrax public sFraxToken;
    IFraxferry public immutable ferryBridge;
    IFrax public immutable fraxToken;
    address owner;

    event StrategyCreated(address indexed creator, uint256 strategyId);
    event StrategyExecuted(
        address indexed user,
        uint256 strategyId
    );
    event ProfitsUpdated(address indexed user, uint256 profits);

    // ferryBridge = 0x00160baF84b3D2014837cc12e838ea399f8b8478
    // sFraxToken = 0xfc00000000000000000000000000000000000008 frax
    // sFraxToken = 0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32 eth
    // frax_token = 0xFc00000000000000000000000000000000000001 frax
    // frax_token = 0x853d955aCEf822Db058eb8505911ED77F175b99e eth

    constructor(
        address _sniperBotContract,
        address _sFraxToken,
        address _ferryBridge,
        address _fraxToken
    ) {
        sniperBotContract = _sniperBotContract;
        sFraxToken = ISFrax(_sFraxToken);
        owner = msg.sender;
        ferryBridge = IFraxferry(_ferryBridge);
        fraxToken = IFrax(_fraxToken);
        strategyCounter = 1; // Starting from 1 for simplicity
    }

    // User deposit function
    function deposit(uint256 amount) public payable {
        require(amount > 0, "Deposit amount must be greater than 0");
        fraxToken.transferFrom(msg.sender, address(this), amount);
        userBalances[msg.sender] += amount;
    }

    // User create strategy function
 function createStrategy(FunctionCall[] memory functionCalls, bool isActive) public {
        uint256 strategyId = strategyCounter++;
        
        // Create a new strategy in memory
        Strategy memory newStrategy;
        newStrategy.totalInvested = 0;
        newStrategy.creator = msg.sender;
        newStrategy.isActive = isActive;
        newStrategy.participants = new address[](0) ;

        // Initialize the functionCalls array length in memory
        newStrategy.functionCalls = new FunctionCall[](functionCalls.length);

        // Manually copy each element from memory to memory
        for (uint256 i = 0; i < functionCalls.length; i++) {
            newStrategy.functionCalls[i] = FunctionCall({
                functionType: functionCalls[i].functionType,
                parameters: functionCalls[i].parameters
            });
        }

       // Store the new strategy into the strategies mapping by copying each field individually
        Strategy storage strategy = strategies[strategyId];
        strategy.totalInvested = newStrategy.totalInvested;
        strategy.creator = newStrategy.creator;
        strategy.isActive = newStrategy.isActive;
        strategy.participants = newStrategy.participants;

        // Copy the functionCalls array
        for (uint256 i = 0; i < newStrategy.functionCalls.length; i++) {
            strategy.functionCalls.push(newStrategy.functionCalls[i]);
        }

        userStrategies[msg.sender].push(strategyId);
        emit StrategyCreated(msg.sender, strategyId);
    }
    
    
    // User execute strategy function
    function executeStrategy(uint256 strategyId, bytes[] memory parameters) public {
        require(strategies[strategyId].isActive, "Strategy is not active");

        // userBalances[msg.sender] -= amount;
        userInvestedStrategies[msg.sender].push(strategyId);
        strategies[strategyId].participants.push(msg.sender);

        // Execute each function call in the strategy sequentially
        for (uint256 i = 0; i < strategies[strategyId].functionCalls.length; i++) {
            FunctionCall memory funcCall = strategies[strategyId].functionCalls[i];
            bytes memory funcParameters = parameters[i]; 

            if (funcCall.functionType == FunctionType.Deposit) {
                uint256 depositAmount = abi.decode(funcParameters, (uint256));
                deposit(depositAmount);
            } else if (funcCall.functionType == FunctionType.DepositToFraxFi) {
                uint256 collateralAmount = abi.decode(funcParameters, (uint256));
                depositToFraxFi(collateralAmount);
            } else if (funcCall.functionType == FunctionType.WithdrawFrax) {
                uint256 withdrawAmount = abi.decode(funcParameters,(uint256));
                withdrawFrax(withdrawAmount);
            } else if (funcCall.functionType == FunctionType.WithdrawSfrax) {
                uint256 withdrawSFraxAmount = abi.decode(funcParameters,(uint256));
                withdrawSFrax(withdrawSFraxAmount);
            } else if (funcCall.functionType == FunctionType.TransferFrax) {
                (address recipient, uint256 transferAmount) = abi.decode(funcParameters,(address, uint256));
                transferFrax(recipient, transferAmount);
            } else if (funcCall.functionType == FunctionType.TransferSfrax) {
                (address recipient, uint256 transferAmount) = abi.decode(funcParameters,(address, uint256));
                transferSFrax(recipient, transferAmount);
            } else if (funcCall.functionType == FunctionType.SniperBot) {
                uint256 collateralAmount = abi.decode(funcParameters, (uint256));
                ISniperBot(sniperBotContract).registerShare(msg.sender,collateralAmount);
            }
        }
        emit StrategyExecuted(msg.sender, strategyId);
    }

    // Function to approve SniperBot to spend sFRAX
    function sendRewardsToSniperBot(uint256 rewards) public {
        require(sFraxToken.transfer(owner, rewards), "Transfer failed"); // sending money to node snipinr bot
    }

    // Function to handle sniper bot profits
    function reportSniperBotProfits(address user, uint256 profits) public {
        require(
            msg.sender == sniperBotContract,
            "Only sniper bot contract can report profits"
        );

        userBalances[user] += profits;
        emit ProfitsUpdated(user, profits);
    }

    // Function to withdraw Frax funds
    function withdrawFrax(uint256 amount) public {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        userBalances[msg.sender] -= amount;
        // payable(msg.sender).transfer(amount);
        fraxToken.transfer(msg.sender, amount);
    }

    // Function to withdraw sFrax tokens
    function withdrawSFrax(uint256 amount) public {
        require(
            sFraxToken.balanceOf(address(this)) >= amount,
            "Insufficient sFrax balance"
        );
        require(
            sFraxToken.transfer(msg.sender, amount),
            "sFrax transfer failed"
        );
        
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
            sFraxToken.balanceOf(address(this)) >= amount,
            "Insufficient sFrax balance"
        );
        require(
            sFraxToken.transfer(recipient, amount),
            "sFrax transfer failed"
        );
    }

    function depositToFraxFi(uint256 amount) internal {
        require(
            amount > 20,
            "Insufficient gas : Amount must be greater than 20"
        );

        userDepoistFraxFin[msg.sender] += (amount - 20);
        
        // ferryBridge.embark(amount);
        // ISFrax(0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32).deposit(
        //     (amount - 20),
        //     address(this)
        // );
    }

     // Getter function for user strategies
    function getUserStrategies(address user) public view returns (uint256[] memory) {
        return userStrategies[user];
    }

    // Getter function for strategies
    function getStrategy(uint256 strategyId) public view returns (
        FunctionCall[] memory functionCalls,
        uint256 totalInvested,
        address creator,
        bool isActive,
        address[] memory participants
    ) {
        Strategy storage strategy = strategies[strategyId];
        return (
            strategy.functionCalls,
            strategy.totalInvested,
            strategy.creator,
            strategy.isActive,
            strategy.participants
        );
    }

    function getAllStrategies() public view returns (Strategy[] memory) {
        Strategy[] memory allStrategies = new Strategy[](strategyCounter - 1);
        for (uint256 i = 1; i < strategyCounter; i++) {
            allStrategies[i - 1] = strategies[i];
        }
        return allStrategies;
    }

    receive() external payable {}

    fallback() external payable {}
}

interface ISniperBot {
    function registerShare(address user, uint256 amount) external;

    function handleEarnings(uint256 earnings) external;

    function distributeProfits() external;
}
