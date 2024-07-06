import React, { useState, useEffect } from "react";
import SimpleCard from "../components/SimpleCard";
import SimulationModal from "../components/SimulationModal";
import { useContract } from "../providers/thirdwebHook";
import { ethers } from "ethers";
import { ClipLoader } from "react-spinners";
import { useActiveWalletChain } from "thirdweb/react";

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

const Popular = () => {
  ////////////////////////////////////////////////////////
  //    react hooks to manage state of strategies       //
  ////////////////////////////////////////////////////////

  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState(null);

  const { fetchedStrategies, isStrategyLoading, setSimulationModaalOpen, simulationModaalOpen } = useContract();

  ////////////////////////////////////////////////////////
  //    Function to handle button click                 //
  ////////////////////////////////////////////////////////
  const handleButtonClick = (strategy, strategyId) => {
    // Modify this line
    setSelectedStrategy(strategy);
    setSelectedStrategyId(strategyId + 1); // Add this line
    setSimulationModaalOpen(true);
  };


  const formattedStrategies = fetchedStrategies.map((strategy) => {
    const functionCalls = strategy[3].map((call) => {
      const functionType = decodeFunctionType(call[0]);
      const parameters = decodeParameters(Number(call[0]), call[1]);
      return {
        functionType,
        parameters,
      };
    });

    return {
      id: strategy[0],
      name: strategy[1],
      details: strategy[2],
      functionCalls,
      totaInvested: strategy[4],
      participants: strategy[7],
    };
  });

  ////////////////////////////////////////////////////////
  //    render layout                                   //
  ////////////////////////////////////////////////////////

  return (
    <div className="flex flex-col ml-24 m-5 w-full ">
      <div className="text-5xl ml-10 pt-10 ">All Strategies</div>
      <div className="flex w-full item-center justify-center">
        {isStrategyLoading ? (
          <div className="w-full h-[70vh] flex  items-center justify-center">
            <ClipLoader color="white" size={100} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-6 pb-10">
            {formattedStrategies.map((strategy, index) => (
              <SimpleCard
                key={index}
                title={strategy.name}
                description={strategy.details}
                buttonText="Explore"
                onButtonClick={() => handleButtonClick(strategy, index)}
              />
            ))}
          </div>
        )}
      </div>
      {simulationModaalOpen && (
        <SimulationModal
          isOpen={simulationModaalOpen}
          onClose={() => setSimulationModaalOpen(false)}
          strategy={selectedStrategy}
          strategyId={selectedStrategyId}
        />
      )}
    </div>
  );
};

export default Popular;
