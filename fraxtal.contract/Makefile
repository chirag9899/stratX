.PHONY: Add

Add:
	@echo "Building target Add"
	@bash -c 'source /home/gitpod/.bashrc && echo ".bashrc sourced"'

fork:
	anvil --fork-url https://rpc.frax.com

# anvil --fork-url https://rpc.ankr.com/eth

# Define the variable with a default value
TEST_NAME ?= test_deposit

run:
	forge test --fork-url http://127.0.0.1:8545 --mt $(TEST_NAME) -vvv


RPC_URL = https://virtual.fraxtal.rpc.tenderly.co/b29a0eff-d8a6-4949-afe6-bc146f3f7c3e
VERIFIER_URL = https://api.tenderly.co/api/v1/account/sam0264/project/project/etherscan/verify/network/252
ETHERSCAN_API_KEY = 'C9I4Q45QCG5S4YP1SPVGU13HSTHXFDUE9J'
PRIVATE_KEY = e62fd5eafc74f599dab28b51ec9718134fe61c35b1b076c07eec832b52d8f547
CONSTRUCTOR_ARGS = 0xfc00000000000000000000000000000000000008
CONTRACT_PATH = src/SnippingBot.sol:SniperBot

deploy:
	forge create $(CONTRACT_PATH) \
	    --rpc-url $(RPC_URL) \
	    --verify \
	    --verifier-url $(VERIFIER_URL) \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
	    --private-key $(PRIVATE_KEY) \
	    --constructor-args $(CONSTRUCTOR_ARGS)

# Phony target to prevent conflicts with files named 'deploy'
.PHONY: deploy


# forge create src/SnippingBot.sol:SniperBot --chain-id 252 --rpc-url https://virtual.fraxtal.rpc.tenderly.co/b29a0eff-d8a6-4949-afe6-bc146f3f7c3e --etherscan-api-key ji-fkuzUcHUVWuc1Rpd5HbyV8vlM429e --verify --verifier-url https://virtual.fraxtal.rpc.tenderly.co/b29a0eff-d8a6-4949-afe6-bc146f3f7c3e/verify/etherscan  --private-key e62fd5eafc74f599dab28b51ec9718134fe61c35b1b076c07eec832b52d8f547 --constructor-args 0xfc00000000000000000000000000000000000008

# forge create src/FraxtalContract.sol:StrategyContract --chain-id 252 --rpc-url https://virtual.fraxtal.rpc.tenderly.co/b29a0eff-d8a6-4949-afe6-bc146f3f7c3e --etherscan-api-key ji-fkuzUcHUVWuc1Rpd5HbyV8vlM429e --verify --verifier-url https://virtual.fraxtal.rpc.tenderly.co/b29a0eff-d8a6-4949-afe6-bc146f3f7c3e/verify/etherscan  --private-key b0104cc3ae940f18c66addbb6076c5f98d1c0f350cc2fe0c1b585e66b7ec498b --constructor-args 0xE2db7ef93684d06BbF47137000065cF26E878B2e 0xFc00000000000000000000000000000000000001
