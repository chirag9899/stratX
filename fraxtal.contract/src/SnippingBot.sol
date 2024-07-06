// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IFrax} from "../interface/IFrax.sol";


contract SniperBot {
    struct UserShare {
        uint256 invested;
        uint256 rewards;
    }

    mapping(address => UserShare) public userShares;
    uint256 public totalInvested;
    address public strategySniperContract;
    address public admin;
    address[] public participants;
    IFrax public sFraxToken;



    event ProfitsDistributed(uint256 totalProfits);

    modifier onlyStrategyContract() {
        require(strategySniperContract != address(0) && msg.sender == strategySniperContract, "Only strategy sniper contract can call this function");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "UnAuthorized Access! : Only admin can call this function");
        _;
    }

    constructor(address _sFraxToken) {
        admin = msg.sender;
        sFraxToken = IFrax(_sFraxToken);
    }

    function setStrategyContract(address _strategySniperContract) external onlyAdmin{
        strategySniperContract = _strategySniperContract;
    }

    function registerShare(address user, uint256 amount) external onlyStrategyContract {
        if (userShares[user].invested == 0) {
            participants.push(user);
        }
        userShares[user].invested += amount;
        totalInvested += amount;
    }

    function handleEarnings(uint256 earnings) external payable onlyStrategyContract {
        // Calculate profits from handling earnings
        require(sFraxToken.balanceOf(address(this)) >= earnings, "Insufficient earnings");
        uint256 totalProfits = earnings; // Assuming earnings are the total profits

        // Distribute profits among participants
        for (uint256 i = 0; i < participants.length; i++) {
            address user = participants[i];
            uint256 userShare = (userShares[user].invested * totalProfits) / totalInvested;
            userShares[user].rewards += userShare;
        }

        emit ProfitsDistributed(totalProfits);

        // Report the profits back to the StrategySniper contract
        for (uint256 i = 0; i < participants.length; i++) {
            address user = participants[i];
            IStrategySniper(strategySniperContract).reportSniperBotProfits(user, userShares[user].rewards);
            userShares[user].rewards = 0; // Reset rewards after distribution
        }
    }

    receive() external payable {}

    fallback() external payable {}
}

interface IStrategySniper {
    function reportSniperBotProfits(address user, uint256 profits) external;
}
