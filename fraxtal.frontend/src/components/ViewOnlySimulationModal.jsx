import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogHeader,
  DialogFooter,
} from "@material-tailwind/react";
import { X } from "lucide-react";
import ViewOnlyFlow from "./ViewOnlyFlow";
import axios from "axios";
import { useActiveAccount } from "thirdweb/react";
import { useContract } from "../providers/thirdwebHook";
import { ClipLoader } from "react-spinners";

// const axios = require('axios');

const ViewOnlySimulationModal = ({ isOpen, onClose, strategy, isCreated }) => {
  console.log("strategy", strategy);
  if (!strategy) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [rewards, setRewards] = useState(0);

  console.log("strategy", strategy);

  const { getUserStrategyRewards } = useContract();

  useEffect(() => {
    console.log("use effect was ran");
    const strategyRewards = async () => {
      setIsLoading(true);
      try {
        const x = await getUserStrategyRewards(strategy.id);
        console.log("rewards", x);
        setRewards(x);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    strategyRewards();
  }, []);

  return isCreated ? (
    <Dialog
      open={isOpen}
      handler={onClose}
      size="l"
      className="bg-stratx-main-bg/70 border-stratx-card-bg border-2"
    >
      <DialogHeader className="flex justify-between items-center">
        <span className="text-white">{strategy.name}</span>
        <X className="cursor-pointer text-white" onClick={onClose} />
      </DialogHeader>
      <DialogBody className="p-4 h-full flex">
        <div className=" h-[500px] w-full ">
          <ViewOnlyFlow functionCalls={strategy.functionCalls} />
        </div>
      </DialogBody>
      <DialogFooter className="flex justify-between items-center">
        <span className="text-white ">{strategy.details}</span>
      </DialogFooter>
    </Dialog>
  ) : (
    <Dialog
      open={isOpen}
      handler={onClose}
      size="xl"
      className="bg-stratx-main-bg/70 border-stratx-card-bg border-2"
    >
      <DialogHeader className="flex justify-between items-center">
        <span className="text-white">{strategy.name}</span>
        <X className="cursor-pointer text-white" onClick={onClose} />
      </DialogHeader>
      <DialogBody className="p-6 h-full flex">
        <div className="h-[500px] w-1/2 pr-4">
          <ViewOnlyFlow functionCalls={strategy.functionCalls} />
        </div>
        <div className="text-white w-1/2 p-6  rounded-lg shadow-md">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <ClipLoader color="white" size={40} />
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div className="border-b border-gray-700 pb-4">
                  <div className=" flex items-center justify-start space-x-10">
                    <div className="text-l text-stratx-accent-blue uppercase tracking-wide">
                      User Initial FRAX Balance
                    </div>
                    <div className="text-xl font-bold ">
                      {Number(strategy.initialDepositBalance).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="border-b border-gray-700 pb-4">
                  <div className=" flex items-center justify-start space-x-10">
                    <div className="text-l text-stratx-accent-blue uppercase tracking-wide">
                      User Final FRAX Balance
                    </div>
                    <div className="text-xl font-bold mt-1">
                      {Number(strategy.finalDepositBalance).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="border-b border-gray-700 pb-4">
                  <div className=" flex items-center justify-start space-x-10">
                    <div className="text-l text-stratx-accent-blue uppercase tracking-wide">
                      User Initial sFRAX Collateral
                    </div>
                    <div className="text-xl font-bold mt-1">
                      {Number(strategy.initialDepositCollateral).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="border-b border-gray-700 pb-4">
                    <div className=" flex items-center justify-start space-x-10">
                      <div className="text-l text-stratx-accent-blue uppercase tracking-wide">
                        User Final sFRAX Collateral
                      </div>
                      <div className="text-xl font-bold mt-1">
                        {Number(strategy.finalDepositCollateral).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className=" flex items-center justify-start space-x-10">
                    <div className="text-l text-stratx-accent-blue uppercase tracking-wide">
                      User Invested Strategy Rewards
                    </div>
                    <div className="text-xl font-bold mt-1">{rewards}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-between items-center">
        <span className="text-white ">{strategy.details}</span>
      </DialogFooter>
    </Dialog>
  );
};

export default ViewOnlySimulationModal;
