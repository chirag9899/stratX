import { createContext, useContext, useState, useEffect } from "react";

import { ContractOptions, defineChain, simulateTransaction } from "thirdweb";

import {
  createThirdwebClient,
  getContract,
  readContract,
  prepareContractCall,
  // sendAndConfirmTransaction,
  sendTransaction,
  ThirdwebContract,
  PreparedTransaction,
} from "thirdweb";
import {
  useActiveAccount,
  useSendTransaction,
  useActiveWalletChain,
} from "thirdweb/react";
import { toast } from "react-toastify";

import {
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from "reactflow";

import { ethers } from "ethers";

import { fraxContractAbi } from "../abi/fraxContractAbi";
import { strategyContractAbi } from "../abi/strategyContractAbi";
import axios from "axios";
import { Toast } from "react-toastify/dist/components";

interface ContractContextState {
  contractInstance: ThirdwebContract | undefined;
  nodes: any[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: (changes: EdgeChange[]) => void;
  lastNodeId: string | null;
  setLastNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  createStrategy: (
    name: string,
    details: string,
    functionCalls: { functionType: string; parameters: any }[]
  ) => Promise<void>;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  details: string;
  setDetails: React.Dispatch<React.SetStateAction<string>>;
  executeStrategy: (
    strategyId: number,
    parameters: any[],
    amount: number
  ) => Promise<void>;
  fetchedStrategies: any[];
  isStrategyLoading: boolean;
  setIsStrategyLoading: React.Dispatch<React.SetStateAction<boolean>>;
  getFraxBalance: () => Promise<bigint>;
  getDepositCollatral: () => Promise<bigint>;
  getUserInvestedStratergies: () => Promise<any>;
  getUserCreatedStratergies: () => Promise<any>;
  simulationModaalOpen: boolean;
  setSimulationModaalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  withdrawFrax: (amount: number) => Promise<void>;
  fraxBalance: string | undefined;
  depositCollatral: string | undefined;
  userClaimedRewards: string | undefined;
  userSniperRewards: string | undefined;
  userTotalRewards: string | undefined;
  getUserStrategyRewards: (strategyId: bigint) => Promise<string>;
}

const ContractContext = createContext<ContractContextState | undefined>(
  undefined
);

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const strategyContractAddr = "0x4A0383efD4046a22b0C10ba82390579E00bc2C1C";
  const [contractInstance, setContractInstance] = useState<any>();
  const [fraxContract, setFraxContract] = useState<any>();
  const activeChain = useActiveWalletChain();
  const activeAccount = useActiveAccount();
  const client = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [isStrategyLoading, setIsStrategyLoading] = useState(false);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [lastNodeId, setLastNodeId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [fetchedStrategies, setFetchedStrategies] = useState<any[]>([]);
  const [simulationModaalOpen, setSimulationModaalOpen] = useState(false);

  const [fraxBalance, setFraxBalance] = useState<string>();
  const [depositCollatral, setDepositCollatral] = useState<string>();
  const [userClaimedRewards, setUserClaimedRewards] = useState<string>();
  const [userSniperRewards, setUserSniperRewards] = useState<string>();
  const [userTotalRewards, setUserTotalRewards] = useState<string>();

  ////////////////////////////////////////////////////////
  //////    use Effects                           ////////
  ////////////////////////////////////////////////////////

  useEffect(() => {
    const client = createThirdwebClient({
      clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
    });

    // console.log("check", activeChain, "Virtual Fraxtal");

    const initContract = async () => {
      try {
        if (activeChain?.name === "Virtual Fraxtal") {
          console.log(activeChain);
          const fraxContract = getContract({
            address: "0xfc00000000000000000000000000000000000001",
            abi: fraxContractAbi as any,
            client: client,
            chain: activeChain,
          });
          const contract = getContract({
            address: strategyContractAddr,
            abi: strategyContractAbi as any,
            client: client,
            chain: activeChain,
          });
          setContractInstance(contract);
          const fetchStrategies = await getAllStrategies(contract);
          setFetchedStrategies(fetchStrategies);
          setFraxContract(fraxContract);
          await getUserTotalRewards(contract);
          await getUserClaimedRewards(contract);
          await getUserSniperRewards(contract);
        }
      } catch (error) {
        console.log("init contract error", error);
      }
    };
    initContract();
  }, [activeChain]);

  ////////////////////////////////////////////////////////
  //////     Function to create a new strategy    ////////
  ////////////////////////////////////////////////////////
  const createStrategy = async (
    name: string,
    details: string,
    functionCalls: { functionType: string; parameters: any }[]
  ): Promise<void> => {
    try {
      if (!activeAccount) {
        throw new Error("Active account is undefined");
      }

      if (!contractInstance) {
        throw new Error("Contract instance is undefined");
      }

      const filteredData: [number, `0x${string}`][] = functionCalls.map(
        (call) => {
          let parameters: string;
          let functionType: number;

          switch (call.functionType) {
            case "Deposit":
              functionType = 0;
              parameters = ethers.utils.defaultAbiCoder.encode(
                ["uint256"],
                [call.parameters.amount]
              );
              break;
            case "DepositToFraxFi":
              functionType = 1;
              parameters = ethers.utils.defaultAbiCoder.encode(
                ["uint256"],
                [call.parameters.amount]
              );
              break;
            case "WithdrawFrax":
              functionType = 2;
              parameters = ethers.utils.defaultAbiCoder.encode(
                ["uint256"],
                [call.parameters.amount]
              );
              break;
            case "TransferFrax":
              functionType = 3;
              if (!ethers.utils.isAddress(call.parameters.address)) {
                throw new Error(`Invalid address: ${call.parameters.address}`);
              }
              parameters = ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256"],
                [call.parameters.address, call.parameters.amount]
              );
              break;
            case "WithdrawSfrax":
              functionType = 4;
              parameters = ethers.utils.defaultAbiCoder.encode(
                ["uint256"],
                [call.parameters.amount]
              );
              break;
            case "TransferSfrax":
              functionType = 5;
              parameters = ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256"],
                [call.parameters.address, call.parameters.amount]
              );
              break;
            case "SniperBot":
              functionType = 6;
              parameters = ethers.utils.defaultAbiCoder.encode(
                ["uint256"],
                [call.parameters.amount]
              );
              break;
            default:
              throw new Error(`Unknown function type: ${call.functionType}`);
          }
          console.log({ functionType, parameters });
          return [functionType, parameters as `0x${string}`];
        }
      );
      console.log("Filtered Data for Strategy:", {
        filteredData,
      });

      const transaction = prepareContractCall({
        contract: contractInstance,
        method:
          "function createStrategy(string memory name, string memory description,(uint8, bytes)[] memory functionCalls, bool isActive) public",
        params: [name, details, filteredData, true],
        // method:"function createStrategy(string name,string description,(uint8, bytes)[] memory functionCalls, bool isActive) public",
        // params: [name, details, filteredData, true],
        value: BigInt(0),
      });

      console.log(transaction);

      console.log(name, details, filteredData);
      const result =
        activeAccount &&
        (await sendTransaction({
          transaction: transaction,
          account: activeAccount,
        }));

      const newStrategies = await getAllStrategies(contractInstance);
      setFetchedStrategies(newStrategies);
      console.log(result);
    } catch (error) {
      throw new Error(`Error creating strategy: ${error}`);
    }
  };

  ////////////////////////////////////////////////////////
  //////    Function to retrieve all strategies   ////////
  ////////////////////////////////////////////////////////

  const getAllStrategies = async (contract: any): Promise<any> => {
    setIsStrategyLoading(true);
    try {
      const strategies = await readContract({
        contract: contract,
        method:
          "function getAllStrategies() public view returns ((uint256, string , string , (uint256, bytes)[], uint256, address , bool , address[] )[] memory)",
        params: [],
      });
      setIsStrategyLoading(false);
      return strategies;
    } catch (error) {
      throw error;
    }
  };

  ////////////////////////////////////////////////////////
  //////    Function to execute a strategy        ////////
  ////////////////////////////////////////////////////////

  const executeStrategy = async (
    strategyId: number,
    parameters: any[],
    amount: number
  ) => {
    try {
      if (!contractInstance || !activeAccount)
        throw new Error("No active account");

      console.log("parameters", parameters);

      const formattedParameters = parameters.map((param) => param);

      // Define the multiplier for wei (10^18)
      // const WEI_PER_ETH = BigInt("1000000000000000000"); // 10^18 wei
      // const amountInWei = BigInt(Math.floor(amount * Number(WEI_PER_ETH)));

      // await approveFrax(contractInstance.address, Number(amountInWei));
      await approveFrax(contractInstance.address, Number(amount));

      // return;

      const transaction = prepareContractCall({
        contract: contractInstance,
        method:
          "function executeStrategy(uint256 strategyId, bytes[] parameters) public",
        params: [BigInt(strategyId), formattedParameters],
        value: BigInt(0),
      });

      const result = await sendTransaction({
        transaction: transaction,
        account: activeAccount,
      });

      console.log(result);
    } catch (error) {
      console.log(error);
      throw new Error(`Error executing strategy: ${error}`);
    }
  };

  ////////////////////////////////////////////////////////
  //////    Function to get frax balance          ////////
  ////////////////////////////////////////////////////////

  const getFraxBalance = async () => {
    try {
      if (!contractInstance) throw new Error("No contract instance");

      const balance = await readContract({
        contract: contractInstance,
        method: "function userBalances(address) view returns (uint256)",
        params: [activeAccount?.address?.toString() || ""],
      });
      const balanceInEther = Number(balance) / 1e18; // Convert balance to ether
      const formattedBalance = balanceInEther.toFixed(2);
      setFraxBalance(formattedBalance);
      console.log(balance);
      return balance;
    } catch (error) {
      throw new Error(`Error getting frax balance: ${error}`);
    }
  };

  ////////////////////////////////////////////////////////
  //////    Function to get deposit collatral     ////////
  ////////////////////////////////////////////////////////
  const getDepositCollatral = async () => {
    try {
      if (!contractInstance) throw new Error("No contract instance");

      const collatral = await readContract({
        contract: contractInstance,
        method: "function userDepoistFraxFin(address) view returns (uint256)",
        params: [activeAccount?.address?.toString() || ""],
      });
      const collatralInEther = (Number(collatral) * 0.94) / 1e18; // Convert balance to ether
      const formattedCollatral = collatralInEther.toFixed(2);
      setDepositCollatral(formattedCollatral);
      return collatral;
    } catch (error) {
      throw new Error(`Error getting deposit collatral: ${error}`);
    }
  };

  const getUserTotalRewards = async (contract: any) => {
    try {
      if (!contract) throw new Error("No contract instance");

      const userTotalRewards = await readContract({
        contract: contract,
        method:
          "function getUserRewards(address) public view returns (uint256)",
        params: [activeAccount?.address?.toString() || ""],
      });

      const rewardsInEther = Number(userTotalRewards) / 1e18; // Convert balance to ether
      const formattedRewards = rewardsInEther.toFixed(2);
      setUserTotalRewards(formattedRewards);
      console.log(userTotalRewards);
      return userTotalRewards;
    } catch (error) {
      throw new Error(`Error getting userTotalRewards: ${error}`);
    }
  };

  const getUserStrategyRewards = async (strategyId: bigint) => {
    try {
      if (!contractInstance) throw new Error("No contract instance");

      const userStrategyRewards = await readContract({
        contract: contractInstance,
        method:
          "function getUserStrategyRewards(address,uint256) public view returns (uint256)",
        params: [activeAccount?.address?.toString() || "", strategyId],
      });
      const rewardsInEther = Number(userStrategyRewards) / 1e18; // Convert balance to ether
      const formattedRewards = rewardsInEther.toFixed(2);
      return formattedRewards;
    } catch (error) {
      throw new Error(`Error getting userStrategyRewards: ${error}`);
    }
  };

  const getUserSniperRewards = async (contract: any) => {
    try {
      if (!contract) throw new Error("No contract instance");

      const address = activeAccount?.address?.toString();
      if (!address) throw new Error("Invalid address");

      const userSniperRewards = await readContract({
        contract: contract,
        method: "function getUserSniperReward() public view returns (uint256)",
      });

      console.log("userSniperRewards", userSniperRewards);
      const rewardsInEther = Number(userSniperRewards) / 1e18; // Convert balance to ether
      const formattedRewards = rewardsInEther.toFixed(2);
      console.log("sniperReward", userTotalRewards);
      setUserSniperRewards(formattedRewards);
      return userSniperRewards;
    } catch (error) {
      setUserSniperRewards("0.00");
      return 0;
    }
  };

  const getUserClaimedRewards = async (contract: any) => {
    try {
      if (!contract) throw new Error("No contract instance");

      const address = activeAccount?.address?.toString();
      if (!address) throw new Error("Invalid address");

      const userClaimedRewards = await readContract({
        contract: contract,
        method:
          "function rewardsClaimed(address) public view returns (uint256)",
        params: [activeAccount?.address?.toString() || ""],
      });

      const rewardsInEther = Number(userClaimedRewards) / 1e18; // Convert balance to ether
      const formattedRewards = rewardsInEther.toFixed(2);
      setUserClaimedRewards(formattedRewards);
      return formattedRewards;
    } catch (error) {
      console.log(error);
    }
  };

  const getHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/strategies/${activeAccount?.address}`,
        {
          maxBodyLength: Infinity,
        }
      );
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  ////////////////////////////////////////////////////////
  ////// Function to get user invested strategies ////////
  ////////////////////////////////////////////////////////
  const getUserInvestedStratergies = async () => {
    try {
      if (!contractInstance) throw new Error("No contract instance");

      const investedStrategyIds = await readContract({
        contract: contractInstance,
        method:
          "function getUserInvestedStrategyIds(address) view returns ((uint256, string, string, (uint8, bytes)[], uint256, address, bool, address[])[])",
        params: [activeAccount?.address?.toString() || ""],
      });

      console.log("investedStrategyIds", investedStrategyIds);

      const strategies = investedStrategyIds.map((strategy) => ({
        id: strategy[0],
        name: strategy[1],
        description: strategy[2],
        functionCalls: strategy[3].map((call) => ({
          functionId: call[0],
          data: call[1],
        })),
        totalInvested: strategy[4],
        creator: strategy[5],
        isActive: strategy[6],
        participants: strategy[7],
      }));

      const balances = await getHistory();
      const combinedStrategies = strategies.map((strategy, index) => ({
        ...strategy,
        initialDepositBalance:
          balances?.data[index]?.initialDepositBalance || 0,
        finalDepositBalance: balances?.data[index]?.finalDepositBalance || 0,
        initialDepositCollateral:
          balances?.data[index]?.initialDepositCollatral || 0,
        finalDepositCollateral:
          balances?.data[index]?.finalDepositCollatral || 0,
      }));

      console.log("combinedInvestedStrategies", combinedStrategies);
      return combinedStrategies;
    } catch (error) {
      console.log(error);
      throw new Error("Error getting user invested strategies: " + error);
    }
  };

  ////////////////////////////////////////////////////////
  ////// Function to get user created strategies   ///////
  ////////////////////////////////////////////////////////

  const getUserCreatedStratergies = async () => {
    try {
      if (!contractInstance) throw new Error("No contract instance");

      const createStrategyIds = await readContract({
        contract: contractInstance,
        method:
          "function getUserStrategies(address) view returns ((uint256, string, string, (uint8, bytes)[], uint256, address, bool, address[])[])",
        params: [activeAccount?.address?.toString() || ""],
      });

      const strategies = createStrategyIds.map((strategy) => ({
        id: strategy[0],
        name: strategy[1],
        description: strategy[2],
        functionCalls: strategy[3].map((call) => ({
          functionId: call[0],
          data: call[1],
        })),
        totalInvested: strategy[4],
        creator: strategy[5],
        isActive: strategy[6],
        participants: strategy[7],
      }));

      console.log("createdStrategies", strategies);
      return strategies;
    } catch (error) {
      console.log(error);
      throw new Error("Error getting user created strategies: " + error);
    }
  };

  const withdrawFrax = async (amount: number) => {
    try {
      const fraxBalance = await getFraxBalance();

      if (!activeAccount?.address) {
        throw new Error("Invalid address");
      }

      if (amount <= fraxBalance) {
        throw new Error("Insufficient amount ");
      }

      const transaction = prepareContractCall({
        contract: contractInstance,
        method: "function withdrawFrax(uint256 amount) public",
        params: [BigInt(amount)],
        value: BigInt(0),
      });

      activeAccount &&
        (await sendTransaction({
          transaction: transaction,
          account: activeAccount,
        }));

      await getFraxBalance();
      await getDepositCollatral();
    } catch (error) {
      toast.error("error while withdrawing ");
      throw new Error("Error withdrawing frax: " + error);
    }
  };
  ////////////////////////////////////////////////////////
  //////    Function to approve frax              ////////
  ////////////////////////////////////////////////////////
  const approveFrax = async (spender: string, amount: number) => {
    try {
      if (!activeAccount?.address || !spender) {
        throw new Error("Invalid owner or spender address");
      }

      if (amount <= 0) {
        throw new Error("Insufficient amount to approve");
      }
      const allowance = await readContract({
        contract: fraxContract,
        method: "function allowance(address,address) view returns (uint256)",
        params: [activeAccount?.address?.toString() || "", spender],
      });

      if (allowance < amount) {
        const transaction = prepareContractCall({
          contract: fraxContract,
          method:
            "function approve(address spender,uint256 value) public returns (bool)",
          params: [strategyContractAddr, BigInt(amount)],
          value: BigInt(0),
        });

        activeAccount &&
          (await sendTransaction({
            transaction: transaction,
            account: activeAccount,
          }));
      }
    } catch (error) {
      console.log(error);
      throw new Error(`Error approving: ${error}`);
    }
  };

  return (
    <ContractContext.Provider
      value={{
        contractInstance,
        nodes,
        setNodes,
        onNodesChange,
        edges,
        setEdges,
        onEdgesChange,
        lastNodeId,
        setLastNodeId,
        createStrategy,
        name,
        setName,
        details,
        setDetails,
        executeStrategy,
        fetchedStrategies,
        isStrategyLoading,
        setIsStrategyLoading,
        getFraxBalance,
        getDepositCollatral,
        getUserInvestedStratergies,
        getUserCreatedStratergies,
        simulationModaalOpen,
        setSimulationModaalOpen,
        withdrawFrax,
        fraxBalance,
        depositCollatral,
        userTotalRewards,
        userSniperRewards,
        userClaimedRewards,
        getUserStrategyRewards
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
};
