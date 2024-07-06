export const strategyContractAbi = [
	{
		"type": "constructor",
		"inputs": [
			{
				"name": "_nodeAddress",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "_fraxToken",
				"type": "address",
				"internalType": "address"
			}
		],
		"stateMutability": "nonpayable"
	},
	{
		"type": "fallback",
		"stateMutability": "payable"
	},
	{
		"type": "receive",
		"stateMutability": "payable"
	},
	{
		"type": "function",
		"name": "BRIDGE_FEE_PER_UNIT",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "createStrategy",
		"inputs": [
			{
				"name": "name",
				"type": "string",
				"internalType": "string"
			},
			{
				"name": "description",
				"type": "string",
				"internalType": "string"
			},
			{
				"name": "functionCalls",
				"type": "tuple[]",
				"internalType": "struct StrategyContract.FunctionCall[]",
				"components": [
					{
						"name": "functionType",
						"type": "uint8",
						"internalType": "enum StrategyContract.FunctionType"
					},
					{
						"name": "parameters",
						"type": "bytes",
						"internalType": "bytes"
					}
				]
			},
			{
				"name": "isActive",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "deposit",
		"inputs": [
			{
				"name": "amount",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [],
		"stateMutability": "payable"
	},
	{
		"type": "function",
		"name": "depositToFraxFi",
		"inputs": [
			{
				"name": "amount",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "executeStrategy",
		"inputs": [
			{
				"name": "strategyId",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "parameters",
				"type": "bytes[]",
				"internalType": "bytes[]"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "fraxToken",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "contract IFrax"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "getAllStrategies",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "tuple[]",
				"internalType": "struct StrategyContract.Strategy[]",
				"components": [
					{
						"name": "id",
						"type": "uint256",
						"internalType": "uint256"
					},
					{
						"name": "name",
						"type": "string",
						"internalType": "string"
					},
					{
						"name": "description",
						"type": "string",
						"internalType": "string"
					},
					{
						"name": "functionCalls",
						"type": "tuple[]",
						"internalType": "struct StrategyContract.FunctionCall[]",
						"components": [
							{
								"name": "functionType",
								"type": "uint8",
								"internalType": "enum StrategyContract.FunctionType"
							},
							{
								"name": "parameters",
								"type": "bytes",
								"internalType": "bytes"
							}
						]
					},
					{
						"name": "totalInvested",
						"type": "uint256",
						"internalType": "uint256"
					},
					{
						"name": "creator",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "isActive",
						"type": "bool",
						"internalType": "bool"
					},
					{
						"name": "participants",
						"type": "address[]",
						"internalType": "address[]"
					}
				]
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "getAllUsers",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address[]",
				"internalType": "address[]"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "getTotalDepositedCollateral",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "getUserInvestedStrategyIds",
		"inputs": [
			{
				"name": "user",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "tuple[]",
				"internalType": "struct StrategyContract.Strategy[]",
				"components": [
					{
						"name": "id",
						"type": "uint256",
						"internalType": "uint256"
					},
					{
						"name": "name",
						"type": "string",
						"internalType": "string"
					},
					{
						"name": "description",
						"type": "string",
						"internalType": "string"
					},
					{
						"name": "functionCalls",
						"type": "tuple[]",
						"internalType": "struct StrategyContract.FunctionCall[]",
						"components": [
							{
								"name": "functionType",
								"type": "uint8",
								"internalType": "enum StrategyContract.FunctionType"
							},
							{
								"name": "parameters",
								"type": "bytes",
								"internalType": "bytes"
							}
						]
					},
					{
						"name": "totalInvested",
						"type": "uint256",
						"internalType": "uint256"
					},
					{
						"name": "creator",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "isActive",
						"type": "bool",
						"internalType": "bool"
					},
					{
						"name": "participants",
						"type": "address[]",
						"internalType": "address[]"
					}
				]
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "getUserRewards",
		"inputs": [
			{
				"name": "user",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "getUserSniperReward",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "getUserStrategies",
		"inputs": [
			{
				"name": "user",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "tuple[]",
				"internalType": "struct StrategyContract.Strategy[]",
				"components": [
					{
						"name": "id",
						"type": "uint256",
						"internalType": "uint256"
					},
					{
						"name": "name",
						"type": "string",
						"internalType": "string"
					},
					{
						"name": "description",
						"type": "string",
						"internalType": "string"
					},
					{
						"name": "functionCalls",
						"type": "tuple[]",
						"internalType": "struct StrategyContract.FunctionCall[]",
						"components": [
							{
								"name": "functionType",
								"type": "uint8",
								"internalType": "enum StrategyContract.FunctionType"
							},
							{
								"name": "parameters",
								"type": "bytes",
								"internalType": "bytes"
							}
						]
					},
					{
						"name": "totalInvested",
						"type": "uint256",
						"internalType": "uint256"
					},
					{
						"name": "creator",
						"type": "address",
						"internalType": "address"
					},
					{
						"name": "isActive",
						"type": "bool",
						"internalType": "bool"
					},
					{
						"name": "participants",
						"type": "address[]",
						"internalType": "address[]"
					}
				]
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "getUserStrategyRewards",
		"inputs": [
			{
				"name": "user",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "strategyId",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "nodeAddress",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "reportSniperBotProfits",
		"inputs": [
			{
				"name": "totalProfits",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "rewardsClaimed",
		"inputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "sendRewardsToSniperBot",
		"inputs": [
			{
				"name": "rewards",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "sniperBotShares",
		"inputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "strategies",
		"inputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "id",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "name",
				"type": "string",
				"internalType": "string"
			},
			{
				"name": "description",
				"type": "string",
				"internalType": "string"
			},
			{
				"name": "totalInvested",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "creator",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "isActive",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "strategyCounter",
		"inputs": [],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "strategyTotalDepositedCollateral",
		"inputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "transferFrax",
		"inputs": [
			{
				"name": "recipient",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "amount",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "transferSFrax",
		"inputs": [
			{
				"name": "recipient",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "amount",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "updateDepositedWithYield",
		"inputs": [
			{
				"name": "newTotalWithYield",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "userBalances",
		"inputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "userDepoistFraxFin",
		"inputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "userInvestedStrategies",
		"inputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "id",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "name",
				"type": "string",
				"internalType": "string"
			},
			{
				"name": "description",
				"type": "string",
				"internalType": "string"
			},
			{
				"name": "totalInvested",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "creator",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "isActive",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "userStrategies",
		"inputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "id",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "name",
				"type": "string",
				"internalType": "string"
			},
			{
				"name": "description",
				"type": "string",
				"internalType": "string"
			},
			{
				"name": "totalInvested",
				"type": "uint256",
				"internalType": "uint256"
			},
			{
				"name": "creator",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "isActive",
				"type": "bool",
				"internalType": "bool"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "userStrategyDeposits",
		"inputs": [
			{
				"name": "",
				"type": "address",
				"internalType": "address"
			},
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [
			{
				"name": "",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"stateMutability": "view"
	},
	{
		"type": "function",
		"name": "withdrawFrax",
		"inputs": [
			{
				"name": "amount",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "withdrawSFrax",
		"inputs": [
			{
				"name": "amount",
				"type": "uint256",
				"internalType": "uint256"
			}
		],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "function",
		"name": "withdrawSniperBotProfits",
		"inputs": [],
		"outputs": [],
		"stateMutability": "nonpayable"
	},
	{
		"type": "event",
		"name": "DepositSFraxRequested",
		"inputs": [
			{
				"name": "user",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "amount",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "ProfitsUpdated",
		"inputs": [
			{
				"name": "user",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "profits",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "SniperBotCollateralAdded",
		"inputs": [
			{
				"name": "user",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "amount",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "StrategyCreated",
		"inputs": [
			{
				"name": "creator",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "strategyId",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "StrategyExecuted",
		"inputs": [
			{
				"name": "user",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "strategyId",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "initialDepositBalance",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "initialDepositCollatral",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "finalDepositBalance",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			},
			{
				"name": "finalDepositCollatral",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "TransferSFraxRequested",
		"inputs": [
			{
				"name": "from",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "to",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "amount",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "WithdrawReward",
		"inputs": [
			{
				"name": "user",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "amount",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	},
	{
		"type": "event",
		"name": "WithdrawSFraxRequested",
		"inputs": [
			{
				"name": "user",
				"type": "address",
				"indexed": true,
				"internalType": "address"
			},
			{
				"name": "amount",
				"type": "uint256",
				"indexed": false,
				"internalType": "uint256"
			}
		],
		"anonymous": false
	}
]