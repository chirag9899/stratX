import { ethers } from 'ethers';
import chalk from 'chalk';
import { loadData, saveData, depositFile, withdrawalFile, transferFile, infoFile, snipingFile, strategyFile } from './utils';
import { DepositData, WithdrawalData, TransferData, InfoData, SnipingData, StrategyExecution, StrategyData } from './types';
import {
    fraxChainProviderUrl,
    ethereumProviderUrl,
    fraxTokenAddressFraxtal,
    fraxTokenAddressEthereum,
    strategyContractAddress,
    fraxToEthBridgeContractAddress,
    ethToFraxBridgeContractAddress,
    sFraxAddress,
    ethPrivateKey,
    fraxPrivateKey,
    expectedBatchSize,
    publicKey,
    bscMainnetUrl,
    data,
} from './config';
import { bridgeContractAbi } from './abi/bridgeContractAbi';
import { fraxTokenAbi } from './abi/fraxTokenAbi';
import { sfraxTokenAbi } from './abi/sfraxTokenAbi';
import { strategyContractAbi } from './abi/strategyContractAbi';

const fraxProvider = new ethers.providers.JsonRpcProvider(fraxChainProviderUrl);
const ethProvider = new ethers.providers.JsonRpcProvider(ethereumProviderUrl);
const bscProvider = new ethers.providers.JsonRpcProvider(bscMainnetUrl);

const fraxTokenABI = fraxTokenAbi;
const strategyContractABI = strategyContractAbi;
const bridgeContractABI = bridgeContractAbi;
const sFraxABI = sfraxTokenAbi;

const fraxWallet = new ethers.Wallet(fraxPrivateKey, fraxProvider);
const ethWallet = new ethers.Wallet(ethPrivateKey, ethProvider);
const bscWallet = new ethers.Wallet(ethPrivateKey, bscProvider);

const fraxTokenFraxtal = new ethers.Contract(fraxTokenAddressFraxtal, fraxTokenABI, fraxWallet);
const fraxTokenEthereum = new ethers.Contract(fraxTokenAddressEthereum, fraxTokenABI, ethWallet);
const strategyContract = new ethers.Contract(strategyContractAddress, strategyContractABI, fraxWallet);
const fraxToEthBridgeContract = new ethers.Contract(fraxToEthBridgeContractAddress, bridgeContractABI, fraxWallet);
const ethToFraxBridgeContract = new ethers.Contract(ethToFraxBridgeContractAddress, bridgeContractABI, ethWallet);
const sFrax = new ethers.Contract(sFraxAddress, sFraxABI, ethWallet);

const factory = new ethers.Contract(
    data.factory,
    ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
    bscWallet
  );
  
  const router = new ethers.Contract(
    data.router,
    [
      'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
      'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
      'function approve(address spender, uint amount) public returns (bool)'
    ],
    bscWallet
  );
  
  const wbnb = new ethers.Contract(
    data.WBNB,
    [
      'function approve(address spender, uint amount) public returns (bool)'
    ],
    bscWallet
  );
  
  

// // Query past events from the latest block number

strategyContract.on('DepositSFraxRequested', async (user: string, amount: ethers.BigNumber, event) => {
    try {
        
    console.log(`Deposit event detected: ${user} deposited ${amount}`);
    const infoData: InfoData = loadData(infoFile);
    console.log(event.blockNumber, infoData.lastDepositBlockNumber);
    if (event.blockNumber > infoData.lastDepositBlockNumber) {
        
        const depositData: DepositData = loadData(depositFile);
        const newTotalAmount = ethers.BigNumber.from(depositData.totalAmount).add(amount);
    
        if (newTotalAmount.gte(ethers.utils.parseUnits(expectedBatchSize.toString(), 18))) {
            depositData.deposits.push({ user, amount: amount.toString() });
            depositData.totalAmount = newTotalAmount.toString();
        
            saveData(depositFile, depositData);
    
            await bridgeFraxToEthereum(newTotalAmount.toString());
        } else {
            await handleIndividualDeposit(user, amount);
        }

        infoData.lastDepositBlockNumber = event.blockNumber
        saveData(infoFile, infoData);
    }

    } catch (error) {
        console.log(error)
    }
});

strategyContract.on('WithdrawSFraxRequested', async (user: string, amount: ethers.BigNumber, event) => {
    console.log(`Withdraw event detected: ${user} requested ${amount}`);
    const infoData: InfoData = loadData(infoFile);
    console.log(event.blockNumber, infoData.lastWithdrawBlockNumber);
    if (event.blockNumber > infoData.lastWithdrawBlockNumber) {

        await handleWithdrawRequest(user, amount);

        infoData.lastWithdrawBlockNumber = event.blockNumber;
        saveData(infoFile, infoData);
    }
});


strategyContract.on('TransferSFraxRequested', async (user: string, recipient: string, amount: ethers.BigNumber, event) => {
    console.log(`Transfer event detected: ${user} requested to transfer ${amount} to ${recipient}`);
    const infoData: InfoData = loadData(infoFile);
    console.log(event.blockNumber, infoData.lastTransferBlockNumber);
    if (event.blockNumber > infoData.lastTransferBlockNumber) {

        await handleTransferRequest(user, recipient, amount);

        infoData.lastTransferBlockNumber = event.blockNumber;
        saveData(infoFile, infoData);
    }
});


strategyContract.on('StrategyExecuted', async (user, strategyId, initialDepositBalance, initialDepositCollatral, finalDepositBalance, finalDepositCollatral, event) => {
    console.log(`Strategy executed by user ${user}, Strategy ID: ${strategyId}`);
    console.log(`Initial Deposit Balance: ${initialDepositBalance.toString()}`);
    console.log(`Initial Deposit Collateral: ${initialDepositCollatral.toString()}`);
    console.log(`Final Deposit Balance: ${finalDepositBalance.toString()}`);
    console.log(`Final Deposit Collateral: ${finalDepositCollatral.toString()}`);

    // Load existing data
    const strategyData: StrategyData = loadData(strategyFile);
    const infoData: InfoData = loadData(infoFile);

     // Initialize user info data if not present
     if (!infoData.users) {
        infoData.users = {};
    }
    if (!infoData.users[user]) {
        infoData.users[user] = { lastStrategyBlockNumber: 0 };
    }
    console.log(event.blockNumber > (infoData.users[user]?.lastStrategyBlockNumber))
    // Check if the event block number is greater than the last processed block number for the user
    if (event.blockNumber > (infoData.users[user]?.lastStrategyBlockNumber || 0)) {
        // Update the strategy data with initial and final balances
        if (!strategyData[user]) {
            strategyData[user] = [];
        }

        strategyData[user].push({
            strategyId: strategyId.toString(),
            initialDepositBalance: initialDepositBalance.toString(),
            initialDepositCollatral: initialDepositCollatral.toString(),
            finalDepositBalance: finalDepositBalance.toString(),
            finalDepositCollatral: finalDepositCollatral.toString()
        });

        // Update the last processed block number for the user
        infoData.users[user].lastStrategyBlockNumber = event.blockNumber;


        // Save updated data
        saveData(strategyFile, strategyData);
        saveData(infoFile, infoData);
    }
});


export const getUserBalance = (user: string): StrategyExecution[] => {
    const strategyData: StrategyData = loadData(strategyFile);
    return strategyData[user] || [];
};

async function handleIndividualDeposit(user: string, amount: ethers.BigNumber) {
    try {
        const availableFunds = await checkAvailableFrax_eth();
        if (availableFunds.gte(amount)) {
            try {
                const approve_tx = await fraxTokenEthereum.approve(sFraxAddress, amount);
                const approve_receipt = await approve_tx.wait();
                const tx = await depositIntoSFraxVault(amount.toString());
                console.log(approve_tx, tx)
            } catch (error) {
                console.log(error)
            }
            console.log(`Deposit for ${user} processed successfully`);
        } else {
            const depositData: DepositData = loadData(depositFile);
            const newTotalAmount = ethers.BigNumber.from(depositData.totalAmount).add(amount);
            depositData.deposits.push({ user, amount: amount.toString() });
            depositData.totalAmount = newTotalAmount.toString();
            saveData(depositFile, depositData);
            console.log(`Added in json`);
        }
    } catch (error) {
        console.error(`Error processing deposit for ${user}:`, error);
    }
}

strategyContract.on('TransferSFraxRequested', async (user: string, recipient: string, amount: ethers.BigNumber) => {
    console.log(`Transfer event detected: ${user} requested to transfer ${amount} to ${recipient}`);

    const transferData: TransferData = loadData(transferFile);
    const newTotalAmount = ethers.BigNumber.from(transferData.totalAmount).add(amount);

    transferData.transfers.push({ user, recipient, amount: amount.toString() });
    transferData.totalAmount = newTotalAmount.toString();

    saveData(transferFile, transferData);

    await handleTransferRequest(user, recipient, amount);
});

sFrax.on('DistributeRewards', async() => {
    const totalDepositedCollateral = 10;
    console.log(totalDepositedCollateral)
    const currentPriceFraxinSfrax = await sFrax.pricePerShare()
    console.log(currentPriceFraxinSfrax)
    const balanceof_contract_sfrax = await sFrax.balanceOf(strategyContractAddress)
    console.log(balanceof_contract_sfrax)

    const updatedBalanceInFrax = balanceof_contract_sfrax.div(currentPriceFraxinSfrax);
    const yieldReward = totalDepositedCollateral - updatedBalanceInFrax; 

    if (totalDepositedCollateral / updatedBalanceInFrax  ) {
        await strategyContract.updateDepositedWithYield(updatedBalanceInFrax)
        await fraxTokenFraxtal.transfer(strategyContractAddress, yieldReward);
    }
});


export const checkPriceAndSell = async () => {
    const snipingData: SnipingData = loadData(snipingFile);
    const tokenOut = snipingData.currentToken.address;
    const path = [tokenOut, data.WBNB];

    // Calculate the target price for profit
    const initialPrice = ethers.BigNumber.from(snipingData.currentToken.price);
    const amountsOut = await router.getAmountsOut(ethers.BigNumber.from(snipingData.currentToken.amount), path);
    const currentPrice = amountsOut[1];

    console.log(`Current price: ${ethers.utils.formatEther(currentPrice)}, Initial price: ${ethers.utils.formatEther(initialPrice)}`);

    if (currentPrice.gt(initialPrice)) {
        const sellAmountMin = currentPrice.sub(currentPrice.div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from(data.Slippage)));

        try {
            const tx = await router.swapExactTokensForTokens(
                ethers.BigNumber.from(snipingData.currentToken.amount),
                sellAmountMin,
                path,
                data.recipient,
                Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes from now
                {
                    gasLimit: data.gasLimit,
                    gasPrice: ethers.utils.parseUnits(`${data.gasPrice}`, 'gwei')
                }
            );

            console.log(chalk.green(`Sell transaction sent: ${tx.hash}`));
            const receipt = await tx.wait();
            console.log(chalk.green('Sell transaction receipt:'));
            console.log(receipt);

            // Calculate total profits and report them
            const totalProfits = sellAmountMin.sub(initialPrice.mul(ethers.BigNumber.from(snipingData.currentToken.amount)).div(ethers.BigNumber.from('10').pow(18)));
            
            // @todo- send totalprofit to contract
            await strategyContract.reportSniperBotProfits(totalProfits);
            await fraxTokenFraxtal.transfer(strategyContractAddress, totalProfits);
            console.log(chalk.green(`Reported profits: ${ethers.utils.formatEther(totalProfits)}`));

            // Reset sniping data
            snipingData.currentToken = {
                address: "",
                price: "0",
                amount: "0"
            };
            snipingData.readyToSnipe = false; 
            saveData(snipingFile, snipingData);

        } catch (error) {
            console.error(chalk.red('Sell transaction failed.'));
            console.error(error);
        }
    }
};


factory.on('PairCreated', async (token0, token1, pairAddress) => {

    const snipingData: SnipingData = loadData(snipingFile);
    if (!snipingData.readyToSnipe) {
        console.log(chalk.yellow('Sniping amount not ready. Skipping...'));
        return;
    }

    const snipingAmount = ethers.utils.parseUnits(snipingData.snipingAmount, 'ether');
    const batchSize = ethers.utils.parseUnits(expectedBatchSize.toString(), 18);

    if (snipingAmount.lt(batchSize)) {
        console.log(chalk.yellow(`Total sniping amount (${ethers.utils.formatEther(snipingAmount)}) does not reach the expected batch size. Skipping...`));
        return;
    }
    
    console.log(chalk.blue(`New pair created: ${pairAddress} with tokens ${token0} and ${token1}`));

    let tokenIn, tokenOut;
    if (token0.toLowerCase() === data.WBNB.toLowerCase()) {
        tokenIn = token0;
        tokenOut = token1;
    } else if (token1.toLowerCase() === data.WBNB.toLowerCase()) {
        tokenIn = token1;
        tokenOut = token0;
    } else {
        console.log(chalk.red('Neither token is WBNB, skipping...'));
        return;
    }

    console.log(chalk.green(`Monitoring liquidity for pair ${pairAddress}`));

    const pair = new ethers.Contract(pairAddress, ['event Mint(address indexed sender, uint amount0, uint amount1)'], bscWallet);

    pair.on('Mint', async (sender, amount0, amount1) => {
        if (data.initialLiquidityDetected) {
            console.log(chalk.yellow('Liquidity already detected, skipping further actions.'));
            return;
        }

        data.initialLiquidityDetected = true;

        console.log(chalk.green('Liquidity addition detected.'));

        console.log(chalk.green(`Sniping amount in WBNB: ${batchSize.toString()}`));

        const amounts = await router.getAmountsOut(batchSize, [tokenIn, tokenOut]);
        console.log(chalk.green(`Amounts out: ${amounts.toString()}`));

        const amountOutMin = amounts[1].sub(amounts[1].div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from(data.Slippage)));
        console.log(chalk.green(`Minimum amount out (with slippage): ${amountOutMin.toString()}`));

        console.log('Processing Transaction.....');
        console.log(chalk.yellow(`amountIn: ${batchSize}`));
        console.log(chalk.yellow(`amountOutMin: ${amountOutMin}`));
        console.log(chalk.yellow(`tokenIn: ${tokenIn}`));
        console.log(chalk.yellow(`tokenOut: ${tokenOut}`));
        console.log(chalk.yellow(`data.recipient: ${data.recipient}`));
        console.log(chalk.yellow(`data.gasLimit: ${data.gasLimit}`));
        console.log(chalk.yellow(`data.gasPrice: ${ethers.utils.parseUnits(`${data.gasPrice}`, 'gwei')}`));
        
        // Approve token
        try {
            const approveTx = await wbnb.approve(data.router, batchSize, {
                gasLimit: 10000000 // Set a higher gas limit for the approve transaction
            });
            console.log(chalk.green(`Approval transaction: ${approveTx.hash}`));
            await approveTx.wait();
            console.log(chalk.green('Approval transaction confirmed.'));
        } catch (error) {
            console.error(chalk.red('Approval transaction failed.'));
            console.error(error);
            return;
        }

        try {
            const tx = await router.swapExactTokensForTokens(
                batchSize,
                amountOutMin,
                [tokenIn, tokenOut],
                data.recipient,
                Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes from now
                {
                    gasLimit: data.gasLimit,
                    gasPrice: ethers.utils.parseUnits(`${data.gasPrice}`, 'gwei')
                }
            );

            console.log(chalk.green(`Swap transaction sent: ${tx.hash}`));
            const receipt = await tx.wait();
            console.log(chalk.green('Transaction receipt:'));
            console.log(receipt);

            // Save token details to JSON
            snipingData.currentToken = {
                address: tokenOut,
                price: amounts[1].toString(),
                amount: amountOutMin.toString()
            };

            // Retain excess amount
            const excessAmount = snipingAmount.sub(batchSize);
            snipingData.snipingAmount = excessAmount.toString(); // Retain excess amount for the next batch
            saveData(snipingFile, snipingData);

        } catch (error) {
            console.error(chalk.red('Swap transaction failed.'));
            console.error(error);
        }
    });
});

export const handleSniperBotCollateralAdded = async (user: string, amount: number) => {
    const snipingData: SnipingData = loadData(snipingFile);

    // Update the total sniping amount and add to the snipe list
    const newTotalAmount = ethers.BigNumber.from(snipingData.snipingAmount).add(amount);
    snipingData.snipingAmount = newTotalAmount.toString();
    snipingData.snipe.push({ user, amount: amount.toString() });

    console.log(`SniperBotCollateralAdded event handled. User: ${user}, Amount: ${ethers.utils.formatEther(amount)}`);

    // check in cron jobs
    if (newTotalAmount.gte(ethers.utils.parseUnits(expectedBatchSize.toString(), 18))) {
        console.log('Sniping amount reached the expected batch size. Ready to snipe.');
        snipingData.readyToSnipe = true; 
    }

    // Save updated data
    saveData(snipingFile, snipingData);

};

strategyContract.on('SniperBotCollateralAdded', async (user:string, amount:number) => {
    await handleSniperBotCollateralAdded(user, amount);
});


async function withdrawFromFinanceAndBridge(amount: string) {
    console.log(`Withdrawing ${amount} Frax from finance and bridging`);
    // Withdraw from finance contract
    await withdrawFromFinance(publicKey, amount);
    // Bridge Frax to Fraxtal
    await bridgeFraxToFraxChain(amount);
}

async function handleWithdrawRequest(user: string, amount: ethers.BigNumber) {
    const availableFrax = await checkAvailableFrax_frax();
    if (availableFrax.gte(amount)) {
        await processWithdrawal(user, amount.toString());
    } else {
        const withdrawalData: WithdrawalData = loadData(withdrawalFile);
        const newTotalAmount = ethers.BigNumber.from(withdrawalData.totalAmount).add(amount);
        withdrawalData.withdrawals.push({ user, amount: amount.toString() });
        withdrawalData.totalAmount = newTotalAmount.toString();
        saveData(withdrawalFile, withdrawalData);

        if (newTotalAmount.gte(ethers.utils.parseUnits(expectedBatchSize.toString(), 18))) {
            await withdrawFromFinanceAndBridge(newTotalAmount.toString());
        }
    }
}

async function handleTransferRequest(user: string, recipient: string, amount: ethers.BigNumber) {
    const availableFrax = await checkAvailableFrax_frax();
    if (availableFrax.gte(amount)) {
        await transferFromFinance(user, recipient, amount.toString());
    } else {
        const transferData: TransferData = loadData(transferFile);
        const newTotalAmount = ethers.BigNumber.from(transferData.totalAmount).add(amount);
        transferData.transfers.push({ user, recipient, amount: amount.toString() });
        transferData.totalAmount = newTotalAmount.toString();
        saveData(transferFile, transferData);

        if (newTotalAmount.gte(ethers.utils.parseUnits(expectedBatchSize.toString(), 18))) {
            await bridgeFraxToFraxChain(newTotalAmount.toString());
        }
    }
}

async function processBatchedDeposits(amount: ethers.BigNumber) {
    console.log(`Processing batched deposits: total amount ${amount}`);
    await depositIntoSFraxVault(amount.toString());

    const depositData: DepositData = loadData(depositFile);
    const newDeposits = [];
    let processedAmount = ethers.BigNumber.from(0);

    for (const deposit of depositData.deposits) {
        const depositAmount = ethers.BigNumber.from(deposit.amount);
        if (processedAmount.add(depositAmount).lte(amount)) {
            processedAmount = processedAmount.add(depositAmount);
        } else {
            newDeposits.push(deposit);
        }
    }

    depositData.deposits = newDeposits;
    depositData.totalAmount = ethers.BigNumber.from(depositData.totalAmount).sub(processedAmount).toString();

    saveData(depositFile, depositData);
    console.log('Batched deposits processed successfully');
}

async function checkAvailableSFrax_eth() {
    const balance = await sFrax.balanceOf(publicKey);
    console.log(balance)
    return ethers.BigNumber.from(balance);
}

async function checkAvailableFrax_frax() {
    const balance = await fraxTokenFraxtal.balanceOf(publicKey);
    return ethers.BigNumber.from(balance);
}

async function checkAvailableFrax_eth() {
    const balance = await fraxTokenEthereum.balanceOf(publicKey);
    return ethers.BigNumber.from(balance);
}

async function withdrawFromFinance(user: string, amount: string) {
    console.log(`Withdrawing ${amount} Frax for ${user}`);
    await sFrax.withdraw(amount, user,user );
    console.log(`Withdrawal for ${user} completed: ${amount}`);
}

async function transferFromFinance(user: string, recipient: string, amount: string) {
    console.log(`Transferring ${amount} Frax from ${user} to ${recipient}`);
    await sFrax.withdraw(amount, recipient,user );

    console.log(`Transfer from ${user} to ${recipient} completed: ${amount}`);
}

async function processWithdrawal(user: string, amount: string) {
    try {
        console.log(`Processing withdrawal for ${user}: ${amount}`);
        await fraxTokenFraxtal.transfer(user, amount);
        console.log(`Withdrawal for ${user} completed: ${amount}`);
    } catch (error) {
        console.log(error);
        throw new Error(`Error processing withdrawal for ${user}: ${amount}`);
    }
}

async function processTransfer(user: string, recipient: string, amount: string) {
    console.log(`Processing transfer from ${user} to ${recipient}: ${amount}`);
    await sFrax.transfer(recipient, amount);
    console.log(`Transfer from ${user} to ${recipient} completed: ${amount}`);
}

async function bridgeFraxToEthereum(amount: string) {
    console.log(`Bridging ${amount} Frax to Ethereum`);
    await fraxToEthBridgeContract.bridge(amount);
}

async function bridgeFraxToFraxChain(amount: string) {
    console.log(`Bridging ${amount} sFrax to Frax chain`);
    await ethToFraxBridgeContract.bridge(amount);
}

async function depositIntoSFraxVault(amount: string) {
    console.log(`Depositing ${amount} Frax into sFrax vault`);
    await sFrax.deposit(amount,publicKey , {
        gasLimit: 1000000 // Set a manual gas limit
    });
}

async function processQueuedWithdrawals() {
    const withdrawalData: WithdrawalData = loadData(withdrawalFile);
    let availableFrax = await checkAvailableFrax_frax();

    for (let i = 0; i < withdrawalData.withdrawals.length; i++) {
        const withdrawal = withdrawalData.withdrawals[i];
        const user = withdrawal.user;
        const amount = ethers.BigNumber.from(withdrawal.amount);

        if (availableFrax.gte(amount)) {
            await processWithdrawal(user, amount.toString());

            // await withdrawFromFinance(withdrawal.user, withdrawal.amount);
            availableFrax = availableFrax.sub(amount);

            withdrawalData.withdrawals.splice(i, 1);
            withdrawalData.totalAmount = ethers.BigNumber.from(withdrawalData.totalAmount).sub(amount).toString();
            i--; // Adjust index due to item removal
        }
    }

    saveData(withdrawalFile, withdrawalData);
    console.log('Queued withdrawals processed successfully');
}

async function processQueuedTransfers() {
    const transferData: TransferData = loadData(transferFile);
    let availableFrax = await checkAvailableFrax_frax();

    for (let i = 0; i < transferData.transfers.length; i++) {
        const transfer = transferData.transfers[i];
        const amount = ethers.BigNumber.from(transfer.amount);

        if (availableFrax.gte(amount)) {
            await transferFromFinance(transfer.user, transfer.recipient, transfer.amount);
            availableFrax = availableFrax.sub(amount);

            transferData.transfers.splice(i, 1);
            transferData.totalAmount = ethers.BigNumber.from(transferData.totalAmount).sub(amount).toString();
            i--; // Adjust index due to item removal
        }
    }

    saveData(transferFile, transferData);
    console.log('Queued transfers processed successfully');
}

export {
    processBatchedDeposits,
    checkAvailableSFrax_eth,
    checkAvailableFrax_eth,
    checkAvailableFrax_frax,
    processWithdrawal,
    processTransfer,
    handleIndividualDeposit,
    processQueuedWithdrawals,
    processQueuedTransfers,
};
