import cron from 'node-cron';
import { processQueuedWithdrawals, processQueuedTransfers, processBatchedDeposits, checkAvailableSFrax_eth } from './eventHandler';
import { loadData, depositFile } from './utils';
import { DepositData } from './types';
import { expectedBatchSize } from './config';
import { ethers } from 'ethers';
import { checkPriceAndSell } from './eventHandler';

cron.schedule('* * * * *', async () => { // Runs every minute
    const depositData: DepositData = loadData(depositFile);
    const depositTotalAmount = ethers.BigNumber.from(depositData.totalAmount);

    const availableSFrax = await checkAvailableSFrax_eth();
    console.log(ethers.utils.formatEther(availableSFrax));


    if (availableSFrax.gte(depositTotalAmount) && depositTotalAmount.gte(ethers.utils.parseUnits(expectedBatchSize.toString(), 18))) {
        await processBatchedDeposits(depositTotalAmount);
    } else if (availableSFrax.lte(depositTotalAmount) && availableSFrax.gte(ethers.BigNumber.from(expectedBatchSize.toString()))) {
        await processBatchedDeposits(ethers.BigNumber.from(expectedBatchSize.toString()));
    }

    await processQueuedWithdrawals();
    await processQueuedTransfers();
    await checkPriceAndSell(); 
});
