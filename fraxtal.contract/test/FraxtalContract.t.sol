// // SPDX-License-Identifier: UNLICENSED
// pragma solidity ^0.8.13;

// import {Test, console} from "forge-std/Test.sol";
// import {StrategyContract} from "src/FraxtalContract.sol";
// import {SniperBot} from "src/SnippingBot.sol";
// import {IFrax} from "../interface/IFrax.sol";
// import {ISFrax} from "../interface/ISFrax.sol";


// contract StrategyContractTest is Test {
//     StrategyContract public strategyContract;
//     SniperBot public sniperBot;
//     IFrax public fraxToken;
//     ISFrax public sfraxToken;
//     address public sam;
//     address public joy;
//     address public bob;

//     uint256 constant ONE_FRAX = 10 ** 18;

//     function setUp() public {
//         fraxToken = IFrax(0xFc00000000000000000000000000000000000001); // Correct mainnet Frax address
//         sfraxToken = ISFrax(0xfc00000000000000000000000000000000000008);

//         sniperBot = new SniperBot(0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32);

//         strategyContract = new StrategyContract(
//             address(sniperBot),
//             0xfc00000000000000000000000000000000000008,
//             0x00160baF84b3D2014837cc12e838ea399f8b8478,
//             address(fraxToken)
//         );

//         sam = makeAddr("sam");
//         joy = makeAddr("joy");
//         bob = makeAddr("bob");

//         deal(address(fraxToken), sam, 1000 * ONE_FRAX); // Adjusted for token decimal
//     }

//     function test_deposit() public {
//         console.log("Starting test_deposit...");
//         vm.startPrank(sam);
//         uint256 amount = 100 * ONE_FRAX;
//         fraxToken.approve(address(strategyContract), amount);

//         uint256 allowance = fraxToken.allowance(sam, address(strategyContract));
//         console.log(
//             "Allowance set for StrategyContract to spend sam's FRAX tokens:",
//             allowance
//         );

//         strategyContract.deposit(100 * ONE_FRAX);
//         assertEq(strategyContract.userBalances(sam), amount);
//         vm.stopPrank();
//     }

//     function test_withdrawFrax() public {
//         console.log("Starting test_withdrawFrax...", fraxToken.balanceOf(sam));
//         vm.startPrank(joy);
//         deal(address(fraxToken), joy, 20 * ONE_FRAX);
//         uint256 depositAmount = 20 * ONE_FRAX;

//         fraxToken.approve(address(strategyContract), depositAmount);
//         strategyContract.deposit(depositAmount);
//         uint256 initialBalance = fraxToken.balanceOf(sam);

//         strategyContract.withdrawFrax(depositAmount);

//         uint256 finalBalance = fraxToken.balanceOf(sam);
//         console.log("Initial balance:", initialBalance);
//         assertEq(finalBalance, initialBalance - depositAmount + 20 * ONE_FRAX);
//         vm.stopPrank();
//     }

//     function test_createStrategy() public {
//         console.log("Starting test_createStrategy...");
//         vm.startPrank(sam);

//         StrategyContract.FunctionCall[]
//             memory functionCalls = new StrategyContract.FunctionCall[](1);
//         functionCalls[0] = StrategyContract.FunctionCall({
//             functionType: StrategyContract.FunctionType.Deposit,
//             parameters: abi.encode(100 * ONE_FRAX)
//         });

//         // strategyContract.createStrategy(functionCalls, true);
//         uint256[] memory strategies = strategyContract.getUserStrategies(sam);
//         assertEq(strategies.length, 1);

//         uint256 strategyId = strategies[0];

//         (
//             StrategyContract.FunctionCall[] memory functionCallsCreated,
//             uint256 totalInvested,
//             address creator,
//             bool isActive,
//             address[] memory participants
//         ) = strategyContract.getStrategy(strategyId);

//         console.log("Strategy created:", totalInvested, isActive, creator);
//         assertEq(creator, sam);
//         assertEq(isActive, true);
//         assertEq(functionCallsCreated.length, 1);
//         assertEq(
//             uint256(functionCallsCreated[0].functionType),
//             uint256(StrategyContract.FunctionType.Deposit)
//         );

//         vm.stopPrank();
//     }

// function testExecuteStrategy() public {
//     vm.startPrank(joy);
//     deal(address(fraxToken), joy, 600 * ONE_FRAX);
//     deal(address(sfraxToken), address(strategyContract), 100 * ONE_FRAX);

//     // Step 1: Approve and deposit tokens to the strategy contract
//     fraxToken.approve(address(strategyContract), 500 * ONE_FRAX);

//     // Step 2: Create a strategy
//     StrategyContract.FunctionCall[] memory functionCalls = new StrategyContract.FunctionCall[](3);

//     functionCalls[0] = StrategyContract.FunctionCall({
//         functionType: StrategyContract.FunctionType.Deposit,
//         parameters: abi.encode(100 * ONE_FRAX)
//     });

//     functionCalls[1] = StrategyContract.FunctionCall({
//         functionType: StrategyContract.FunctionType.WithdrawFrax,
//         parameters: abi.encode(50 * ONE_FRAX)
//     });

//     functionCalls[2] = StrategyContract.FunctionCall({
//         functionType: StrategyContract.FunctionType.DepositToFraxFi,
//         parameters: abi.encode(30 * ONE_FRAX)
//     });

//     // strategyContract.createStrategy(functionCalls, true);
    
//     // // Get the strategies for the user
//     uint256[] memory strategies = strategyContract.getUserStrategies(joy);
    
//     // // Ensure the strategies array is not empty
//     require(strategies.length > 0, "No strategies found for the user");
    
//     uint256 strategyId = strategies[0];

//     // Execute the strategy
//     fraxToken.approve(address(strategyContract), 200 * ONE_FRAX);

//     bytes[] memory parameters = new bytes[](3);
//     parameters[0] = abi.encode(100 * ONE_FRAX);
//     parameters[1] = abi.encode(50 * ONE_FRAX);
//     parameters[2] = abi.encode(30 * ONE_FRAX);
//     strategyContract.executeStrategy(strategyId, parameters);

//     // Verify final balances if necessary
// }



//     function test_abc() public {
//         vm.startPrank(joy);
//         deal(address(fraxToken), joy, 20 * ONE_FRAX);
//         // transaction between
//         // transaction between
//         // transaction between
//         vm.stopPrank();
//     }
// }
