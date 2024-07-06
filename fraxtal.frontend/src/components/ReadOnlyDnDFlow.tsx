import React, { useState, useRef, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
import NodeDrawer from "./NodeDrawer";
import CustomNodeDeposit from "./nodes/CustomNodeDeposit";
import CustomNodeWithdrawFrax from "./nodes/CustomNodeWithdrawFrax";
import CustomNodeDepositCollateral from "./nodes/CustomNodeDepositCollateral";
import CustomNodeTransferFrax from "./nodes/CustomNodeTransferFrax";
import CustomNodeTokenSniper from "./nodes/CustomNodeTokenSniper";
import CustomNodeWithdrawSFrax from "./nodes/CustomNodeWithdrawSFrax";
import CustomNodeTransferSFrax from "./nodes/CustomNodeTransferSFrax";
import { Send } from "lucide-react";
import { useContract } from "../providers/thirdwebHook";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { ethers } from "ethers";

const nodeTypes = {
  customNodeDeposit: CustomNodeDeposit,
  customNodeWithdrawFrax: CustomNodeWithdrawFrax,
  customNodeWithdrawSFrax: CustomNodeWithdrawSFrax,
  customNodeTransferFrax: CustomNodeTransferFrax,
  customNodeTransferSFrax: CustomNodeTransferSFrax,
  customNodeTokenSniper: CustomNodeTokenSniper,
  customNodeDepositCollateral: CustomNodeDepositCollateral,
};

const getNodeType = (functionType) => {
  const nodeTypeMap = {
    Deposit: "customNodeDeposit",
    WithdrawFrax: "customNodeWithdrawFrax",
    WithdrawSfrax: "customNodeWithdrawSFrax",
    TransferFrax: "customNodeTransferFrax",
    TransferSfrax: "customNodeTransferSFrax",
    SniperBot: "customNodeTokenSniper",
    DepositToFraxFi: "customNodeDepositCollateral",
  };
  return nodeTypeMap[functionType];
};

const getLabel = (functionType) => {
  switch (functionType) {
    case "DepositToFraxFi": 
      return "Deposit Collateral";
    case "TransferSfrax":
      return "Transfer Collateral";
    case "WithdrawSfrax":
      return "Withdraw Collateral";
    case "TransferFrax":
      return "Transfer Frax";
    case "WithdrawFrax":
      return "Withdraw Frax";
    case "SniperBot":
      return "Sniper Bot";
    default:
      return functionType;
  }
};

const ReadOnlyDnDFlow = ({ name, details, functionCalls = [], strategyId }) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [currAmount, setCurrAmount] = useState(0);

  const { executeStrategy, setSimulationModaalOpen } = useContract();
  const [executeLoading, setExecuteLoading] = useState(false);

  const execute = async (strategyId, parameters, amount) => {
    try {
      console.log(strategyId, parameters, amount);
      await executeStrategy(strategyId, parameters, amount);
      toast.success("Strategy executed successfully");
    } catch (error) {
      toast.error("Failed to execute strategy");
      console.error("Execution error:", error);
    }
    setExecuteLoading(false);
    setSimulationModaalOpen(false);
  };

  useEffect(() => {
    if (currAmount !== 0) {
      const parameters = nodes.map((node) => {
        const { type, data } = node;
        let params = "";
        const multiplier = ethers.BigNumber.from(10).pow(18);
        let amount;
  
        // Handling decimal amounts
        if (typeof data.amount === "number" || typeof data.amount === "string") {
          const [integerPart, fractionalPart = ""] = data.amount.toString().split(".");
          const integerBigNumber = ethers.BigNumber.from(integerPart);
          const fractionalBigNumber = ethers.BigNumber.from(fractionalPart.padEnd(18, '0'));
          amount = integerBigNumber.mul(multiplier).add(fractionalBigNumber);
        } else {
          throw new Error("Invalid amount type");
        }
  
        switch (type) {
          case "customNodeDeposit":
            params = ethers.utils.defaultAbiCoder.encode(["uint256"], [amount]);
            break;
          case "customNodeDepositCollateral":
            params = ethers.utils.defaultAbiCoder.encode(["uint256"], [amount]);
            break;
          case "customNodeWithdrawFrax":
            params = ethers.utils.defaultAbiCoder.encode(["uint256"], [amount]);
            break;
          case "customNodeTransferFrax":
            params = ethers.utils.defaultAbiCoder.encode(
              ["address", "uint256"],
              [data.address, amount]
            );
            break;
          case "customNodeWithdrawSFrax":
            params = ethers.utils.defaultAbiCoder.encode(["uint256"], [amount]);
            break;
          case "customNodeTransferSFrax":
            params = ethers.utils.defaultAbiCoder.encode(
              ["address", "uint256"],
              [data.address, amount]
            );
            break;
          case "customNodeTokenSniper":
            params = ethers.utils.defaultAbiCoder.encode(["uint256"], [amount]);
            break;
          default:
            throw new Error("Unknown function type");
        }
        console.log(params);
        return params;
      });
      execute(strategyId, parameters, currAmount);
    }
  }, [currAmount]);
  

  const handleExecuteClick = async () => {
    setExecuteLoading(true);
    nodes.forEach((node) => {
      if (node.type === "customNodeDeposit") {
        setCurrAmount(node.data.amount*10**18);
      }
    });
  };

  useEffect(() => {
    if (functionCalls.length > 0) {
      const initialNodes = functionCalls.map((func, index) => {
        const position = { x: 250, y: index * 150 + 50 };
        const nodeType = getNodeType(func.functionType);

        return {
          id: `node_${index}`,
          type: nodeType,
          position,
          data: {
            ...func.parameters,
            label: `${getLabel(func.functionType)} `,
            onEditClick: () =>
              setSelectedNode({ id: `node_${index}`, data: func.parameters }),
          },
        };
      });

      setNodes(initialNodes);

      const initialEdges = functionCalls.slice(1).map((_, index) => ({
        id: `edge_${index}`,
        source: `node_${index}`,
        target: `node_${index + 1}`,
      }));

      setEdges(initialEdges);
    }
  }, [functionCalls, setNodes, setEdges]);

  const handleDrawerClose = () => {
    setSelectedNode(null);
  };

  const handleNodeDataChange = (updatedNode) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    );
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <ReactFlowProvider>
        <div className="absolute bottom-20 right-20 flex flex-col justify-center items-center gap-y-2 z-50">
          <button
            className="h-16 w-16 bg-stratx-accent-cherry hover:bg-stratx-accent-cherry/70 text-white font-bold py-2 px-4 rounded-full flex justify-center items-center"
            onClick={handleExecuteClick}
          >
            {executeLoading ? (
              <ClipLoader color="white" size={20} />
            ) : (
              <Send className="h-10 w-10" />
            )}
          </button>
        </div>
        <div className="flex-grow h-full relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={(event, node) => setSelectedNode(node)}
            nodesDraggable={false}
            nodesConnectable={false}
            fitView
          >
            <Background variant="dots" gap={15} size={1} />
            <Controls />
          </ReactFlow>
        </div>
        {selectedNode && (
          <NodeDrawer
            node={selectedNode}
            onClose={handleDrawerClose}
            onChange={handleNodeDataChange}
          />
        )}
      </ReactFlowProvider>
    </div>
  );
};

export default ReadOnlyDnDFlow;
