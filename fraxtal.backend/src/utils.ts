import fs from 'fs';
import path from 'path';
import { DepositData, WithdrawalData, TransferData, InfoData, SnipingData, StrategyData } from './types';

export const depositFile = 'store/deposits.json';
export const withdrawalFile = 'store/withdrawals.json';
export const transferFile = 'store/transfers.json';
export const infoFile = 'store/info.json'; 
export const snipingFile = 'store/sniping.json';
export const strategyFile = 'store/strategies.json';


export function loadData<T>(file: string): T {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
}

export function saveData(file: string, data: any) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function initializeFiles() {
    if (!fs.existsSync(depositFile)) {
        saveData(depositFile, { totalAmount: '0', deposits: [] });
    }
    if (!fs.existsSync(withdrawalFile)) {
        saveData(withdrawalFile, { totalAmount: '0', withdrawals: [] });
    }

    if (!fs.existsSync(transferFile)) {
        saveData(transferFile, { totalAmount: '0', transfers: [] });
    }
    if (!fs.existsSync(infoFile)) {
        // Initialize infoFile with default values based on InfoData interface
        const initialInfoData: InfoData = {
            lastDepositBlockNumber: 0,
            lastWithdrawBlockNumber: 0,
            lastTransferBlockNumber: 0,
            users: {},
        };
        saveData(infoFile, initialInfoData);
    }
    if (!fs.existsSync(snipingFile)) {
        const initialSnipingData: SnipingData = {
            snipingAmount: "0",
            currentToken: {
                address: "",
                price: "0",
                amount: "0"
            },
            snipe: [],
            readyToSnipe: false, 
        };
        saveData(snipingFile, initialSnipingData);
    }

    if(!fs.existsSync(strategyFile)){
        const initialStrategyData:StrategyData  = {};
        saveData(strategyFile, initialStrategyData);
    }

}

