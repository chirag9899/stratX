export const fraxChainProviderUrl = 'https://virtual.fraxtal.rpc.tenderly.co/b29a0eff-d8a6-4949-afe6-bc146f3f7c3e';
export const ethereumProviderUrl = 'https://virtual.mainnet.rpc.tenderly.co/4ad3290d-96ec-4ec1-b250-95109be7790e';
export const bscMainnetUrl = 'https://virtual.binance.rpc.tenderly.co/bbb3944b-ed68-4c1d-a3c2-3aec56a430ab';
export const fraxTokenAddressFraxtal = '0xfc00000000000000000000000000000000000001';
export const fraxTokenAddressEthereum = '0x853d955aCEf822Db058eb8505911ED77F175b99e';
export const strategyContractAddress = '0x4A0383efD4046a22b0C10ba82390579E00bc2C1C';
export const fraxToEthBridgeContractAddress = '0x00160baF84b3D2014837cc12e838ea399f8b8478';
export const ethToFraxBridgeContractAddress = '0x5e1D94021484642863Ea8E7Cb4F0188e56B18FEE';
export const sFraxAddress = '0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32';
export const bridgingCost = 20; // Fixed bridging cost in USD
export const desiredCostPerUserDeposit = 0.50; // Desired cost per user deposit in USD
export const expectedBatchSize = 4000; // Expected batch size in USD
export const ethPrivateKey = 'b0104cc3ae940f18c66addbb6076c5f98d1c0f350cc2fe0c1b585e66b7ec498b';
export const fraxPrivateKey = 'b0104cc3ae940f18c66addbb6076c5f98d1c0f350cc2fe0c1b585e66b7ec498b';
export const publicKey = '0xE2db7ef93684d06BbF47137000065cF26E878B2e';
export const data = {
    WBNB: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
    factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // PancakeSwap V2 factory
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap V2 router
    recipient: publicKey, // Replace with your wallet address
    AMOUNT_OF_WBNB: '0.0002',
    Slippage: '3', // in Percentage
    gasPrice: '5', // in gwei
    gasLimit: '3000000', // set a manual gas limit
    initialLiquidityDetected: false
  };