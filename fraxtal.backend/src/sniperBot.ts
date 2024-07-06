import ethers from 'ethers';
import express from 'express';
import chalk from 'chalk';

const app = express();

const data = {
  WBNB: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
  factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // PancakeSwap V2 factory
  router: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap V2 router
  recipient: '0x20c9192B145CA6D6274704B244614f356361db59', // Replace with your wallet address
  AMOUNT_OF_WBNB: '0.0002',
  Slippage: '3', // in Percentage
  gasPrice: '5', // in gwei
  gasLimit: '300000' // set a manual gas limit
};

let initialLiquidityDetected = false;

const bscMainnetUrl = 'https://virtual.binance.rpc.tenderly.co/b4ab3e58-671f-4dc8-adad-7c72451a608f'; // Ankr or QuikNode
const privatekey = 'e62fd5eafc74f599dab28b51ec9718134fe61c35b1b076c07eec832b52d8f547'; // Replace with your private key (without 0x prefix)
const provider = new ethers.providers.JsonRpcProvider(bscMainnetUrl);
const wallet = new ethers.Wallet(privatekey, provider);

const factory = new ethers.Contract(
  data.factory,
  ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
  wallet
);

const router = new ethers.Contract(
  data.router,
  [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    'function approve(address spender, uint amount) public returns (bool)'
  ],
  wallet
);

const wbnb = new ethers.Contract(
  data.WBNB,
  [
    'function approve(address spender, uint amount) public returns (bool)'
  ],
  wallet
);

factory.on('PairCreated', async (token0, token1, pairAddress) => {
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

  const pair = new ethers.Contract(pairAddress, ['event Mint(address indexed sender, uint amount0, uint amount1)'], wallet);

  pair.on('Mint', async (sender, amount0, amount1) => {
    if (initialLiquidityDetected) {
      console.log(chalk.yellow('Liquidity already detected, skipping further actions.'));
      return;
    }

    initialLiquidityDetected = true;

    console.log(chalk.green('Liquidity addition detected.'));
    
    // We buy x amount of the new token for our WBNB
    const amountIn = ethers.utils.parseUnits(`${data.AMOUNT_OF_WBNB}`, 'ether');
    console.log(chalk.green(`Amount in WBNB: ${amountIn.toString()}`));

    const amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
    console.log(chalk.green(`Amounts out: ${amounts.toString()}`));

    // Our execution price will be a bit different, we need some flexibility
    const amountOutMin = amounts[1].sub(amounts[1].div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from(data.Slippage)));
    console.log(chalk.green(`Minimum amount out (with slippage): ${amountOutMin.toString()}`));

    console.log('Processing Transaction.....');
    console.log(chalk.yellow(`amountIn: ${amountIn}`));
    console.log(chalk.yellow(`amountOutMin: ${amountOutMin}`));
    console.log(chalk.yellow(`tokenIn: ${tokenIn}`));
    console.log(chalk.yellow(`tokenOut: ${tokenOut}`));
    console.log(chalk.yellow(`data.recipient: ${data.recipient}`));
    console.log(chalk.yellow(`data.gasLimit: ${data.gasLimit}`));
    console.log(chalk.yellow(`data.gasPrice: ${ethers.utils.parseUnits(`${data.gasPrice}`, 'gwei')}`));

    // Approve token
    try {
      const approveTx = await wbnb.approve(data.router, amountIn, {
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
        amountIn,
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
    } catch (error) {
      console.error(chalk.red('Swap transaction failed.'));
      console.error(error);
    }
  });
});

const run = async () => {
  console.log(chalk.yellow(`Listening for new pairs on PancakeSwap`));
};

run();

const PORT = 5000;

app.listen(PORT, () => console.log(chalk.yellow(`Listening for Liquidity Addition on port ${PORT}`)));
