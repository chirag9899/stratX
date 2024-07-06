import React, { useEffect, useState } from "react";
import InvestedCard from "../components/InvestedCard";
import ViewOnlySimulationModal from "../components/ViewOnlySimulationModal";
import { useContract } from "../providers/thirdwebHook";
import { ethers } from "ethers";
import { ClipLoader } from "react-spinners";

////////////////////////////////////////////////////////
//    Function to decode parameters of a function     //
////////////////////////////////////////////////////////
const decodeParameters = (functionType, parameters) => {
  try {
    switch (functionType) {
      case 0:
        return {
          amount: ethers.utils.defaultAbiCoder
            .decode(["uint256"], parameters)[0]
            .toString(),
        };
      case 1:
        return {
          amount: ethers.utils.defaultAbiCoder
            .decode(["uint256"], parameters)[0]
            .toString(),
        };
      case 2:
        return {
          amount: ethers.utils.defaultAbiCoder
            .decode(["uint256"], parameters)[0]
            .toString(),
        };
      case 3:
        const [address, amount] = ethers.utils.defaultAbiCoder.decode(
          ["address", "uint256"],
          parameters
        );
        return { address, amount: amount.toString() };
      case 4:
        return {
          amount: ethers.utils.defaultAbiCoder
            .decode(["uint256"], parameters)[0]
            .toString(),
        };
      case 5:
        const [addr, amt] = ethers.utils.defaultAbiCoder.decode(
          ["address", "uint256"],
          parameters
        );
        return { address: addr, amount: amt.toString() };
      case 6:
        return {
          amount:
            parameters.length >= 32
              ? ethers?.utils?.defaultAbiCoder
                  .decode(["uint256"], parameters)[0]
                  ?.toString()
              : "0",
        };
      default:
        throw new Error(`Unknown function type: ${functionType}`);
    }
  } catch (error) {
    console.error(
      `Error decoding parameters for function type ${functionType}:`,
      error
    );
    throw error;
  }
};

////////////////////////////////////////////////////////
//    Function to decode function type of a call      //
////////////////////////////////////////////////////////

const decodeFunctionType = (functionType) => {
  const type = Number(functionType); // Convert BigInt to number
  switch (type) {
    case 0:
      return "Deposit";
    case 1:
      return "DepositToFraxFi";
    case 2:
      return "WithdrawFrax";
    case 3:
      return "TransferFrax";
    case 4:
      return "WithdrawSfrax";
    case 5:
      return "TransferSfrax";
    case 6:
      return "SniperBot";
    default:
      throw new Error(`Unknown function type: ${type}`);
  }
};

const Dashboard = () => {
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [investedStrategies, setInvestedStrategies] = useState<any[]>([]);
  const [userCreatedStratergies, setUserCreatedStratergies] = useState<any[]>(
    []
  );
  const [harvestingRewards, setHarvestingRewards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreated, setIscreated] = useState(false);
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    async function getFrax() {
      try {
        await getFraxBalance();
        await getDepositCollatral();
        const investedStrategies = await getUserInvestedStratergies();
        const userCreatedStrategies = await getUserCreatedStratergies();
        setHarvestingRewards(harvestingRewards);
        setInvestedStrategies(investedStrategies);
        setUserCreatedStratergies(userCreatedStrategies);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
    getFrax();
  }, []);

  const {
    getFraxBalance,
    getDepositCollatral,
    getUserInvestedStratergies,
    getUserCreatedStratergies,
    withdrawFrax,
    fraxBalance,
    depositCollatral,
    userTotalRewards,
    userSniperRewards,
    userClaimedRewards,
  } = useContract();

  const handleCreatedClick = (strategy, index) => {
    setSelectedStrategy({ ...strategy });
    setIsModalOpen(true);
    setIscreated(true);
  };

  const handleInvestedClick = (strategy, index) => {
    setSelectedStrategy({ ...strategy });
    setIsModalOpen(true);
    setIscreated(false);
  };

  console.log("investedStrategies", investedStrategies);
  const formattedInvestedStrategies = investedStrategies.map(
    (strategy, index) => {
      const functionCalls = strategy.functionCalls.map((call) => {
        const functionType = decodeFunctionType(call.functionId);
        const parameters = decodeParameters(Number(call.functionId), call.data);
        return {
          functionType,
          parameters,
        };
      });
      return {
        id: strategy.id,
        name: strategy.name,
        details: strategy.description,
        functionCalls,
        totalInvested: Number(strategy.totalInvested) / 1e18,
        initialDepositBalance: Number(
          strategy.initialDepositBalance / 1e18
        ).toFixed(18),
        initialDepositCollateral: strategy.initialDepositCollateral / 1e18,
        finalDepositCollateral: strategy.finalDepositCollateral / 1e18,
        finalDepositBalance: strategy.finalDepositBalance / 1e18,
      };
    }
  );
  // const balanceInEther = Number(balance) / 1e18; // Convert balance to ether
  // const formattedBalance = balanceInEther.toFixed(18);

  const formattedCreatedStrategies = userCreatedStratergies.map(
    (strategy, index) => {
      const functionCalls = strategy.functionCalls.map((call) => {
        const functionType = decodeFunctionType(call.functionId);
        const parameters = decodeParameters(Number(call.functionId), call.data);
        return {
          functionType,
          parameters,
        };
      });
      return {
        name: strategy.name,
        details: strategy.description,
        functionCalls,
        totalInvested: Number(strategy.totalInvested) / 1e18, // Convert total invested to ether
      };
    }
  );

  return (
    <div className="flex flex-col ml-24 m-5 w-full text-white">
      <div className=" pt-10 mx-16 pb-4 text-white text-5xl">
        User Dashboard
      </div>
      {isLoading ? (
        <div className="w-full h-[70vh] flex  items-center justify-center">
          <ClipLoader color="white" size={100} />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="bg-black/20 rounded-2xl  w-full pr-10 pt-5 pb-14 mx-6 my-3">
            <div className="text-4xl ml-10 p-5">Balances</div>
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="flex flex-col text-xl mx-16  space-y-2">
                <div className="flex gap-4 justify-between items-center">
                  <div>
                    <span className="text-stratx-accent-cherry">
                      FRAX balance:{" "}
                    </span>
                    <span className="font-bold">{fraxBalance}</span>
                  </div>
                </div>
                <div className="flex gap-4 justify-between">
                  <div>
                    <span className="text-stratx-accent-cherry">
                      Collateral balance:{" "}
                    </span>
                    <span className=" font-bold">{depositCollatral}</span>
                  </div>
                </div>
                </div>

                <div className="flex flex-col text-xl mx-16  space-y-2">
                <div className="flex gap-4 justify-between">
                  <div>
                    <span className="text-stratx-accent-cherry">
                      Total Rewards:{" "}
                    </span>
                    <span className=" font-bold">{userTotalRewards}</span>
                  </div>
                </div>
                <div className="flex gap-4 justify-between">
                  <div>
                    <span className="text-stratx-accent-cherry">
                      Sniper Rewards:{" "}
                    </span>
                    <span className=" font-bold">{userSniperRewards}</span>
                  </div>
                </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Amount"
                  className="text-white bg-transparent rounded-lg pl-2 py-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-stratx-accent-cherry/50"
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button
                  className="bg-stratx-accent-cherry text-white p-2 rounded-md"
                  onClick={async () => {
                    const a = Number(amount) * 1e18;
                    await withdrawFrax(Number(a));
                    setAmount("");
                  }}
                >
                  withdrawFrax
                </button>
              </div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-5xl ml-16 pt-10">Invested Strategies</div>
            <div className="flex w-full item-center justify-center">
              <div className="grid grid-cols-3 gap-x-6 pb-10">
                {formattedInvestedStrategies.map((strategy, index) => (
                  <InvestedCard
                    key={index}
                    title={strategy.name}
                    investedAmount={`${strategy.totalInvested.toFixed(2)}`} // Display the actual invested amount
                    onButtonClick={() => handleInvestedClick(strategy)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="text-5xl ml-16 pt-10">Created Strategies</div>
            <div className="flex w-full item-center justify-center">
              <div className="grid grid-cols-3 gap-x-6 pb-10">
                {formattedCreatedStrategies.map((strategy, index) => (
                  <InvestedCard
                    key={index}
                    title={strategy.name}
                    investedAmount={`${strategy.totalInvested.toFixed(2)}`} // Display the actual invested amount
                    onButtonClick={() => handleCreatedClick(strategy)}
                  />
                ))}
              </div>
            </div>
          </div>
          {isModalOpen && (
            <ViewOnlySimulationModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              strategy={selectedStrategy}
              isCreated={isCreated}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
