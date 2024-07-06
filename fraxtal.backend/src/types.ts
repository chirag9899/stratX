export interface Deposit {
    user: string;
    amount: string;
}

export interface Withdrawal {
    user: string;
    amount: string;
}

export interface Transfer {
    user: string;
    recipient: string;
    amount: string;
}

export interface DepositData {
    totalAmount: string;
    deposits: Deposit[];
}

export interface WithdrawalData {
    totalAmount: string;
    withdrawals: Withdrawal[];
}


export interface TransferData {
    totalAmount: string;
    transfers: Transfer[];
}

export interface UserInfoData {
    lastStrategyBlockNumber?: number;
}

export interface InfoData {
    lastDepositBlockNumber: number;
    lastWithdrawBlockNumber: number;
    lastTransferBlockNumber: number;
    users: {
        [user: string]: UserInfoData;
    };
}

export interface SnipingData {
    snipingAmount: string;
    snipe: { user: string, amount: string }[];
    currentToken?: {
        address: string;
        price: string;
        amount: string;
    };
    readyToSnipe: boolean; 
}

export interface StrategyExecution {
    strategyId: number;
    initialDepositBalance: string;
    initialDepositCollatral: string;
    finalDepositBalance: string;
    finalDepositCollatral: string;
}

export interface StrategyData {
    [user: string]: StrategyExecution[];
}
