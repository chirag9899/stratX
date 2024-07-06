import React, { useRef, useEffect, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ethers } from "ethers";

import CustomNodeDeposit from './nodes/CustomNodeDeposit';
import CustomNodeWithdrawFrax from './nodes/CustomNodeWithdrawFrax';
import CustomNodeDepositCollateral from './nodes/CustomNodeDepositCollateral';
import CustomNodeTransferFrax from './nodes/CustomNodeTransferFrax';
import CustomNodeTokenSniper from './nodes/CustomNodeTokenSniper';
import CustomNodeWithdrawSFrax from './nodes/CustomNodeWithdrawSFrax';
import CustomNodeTransferSFrax from './nodes/CustomNodeTransferSFrax';


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
    Deposit: 'customNodeDeposit',
    WithdrawFrax: 'customNodeWithdrawFrax',
    WithdrawSfrax: 'customNodeWithdrawSFrax',
    TransferFrax: 'customNodeTransferFrax',
    TransferSfrax: 'customNodeTransferSFrax',
    SniperBot: 'customNodeTokenSniper',
    DepositToFraxFi: 'customNodeDepositCollateral',
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

const ViewOnlyFlow = ({ functionCalls = [] }) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  useEffect(() => {
    if (functionCalls.length > 0) {
      const initialNodes = functionCalls.map((func, index) => {
        const position = { x: 250, y: index * 150 + 50 };
        const nodeType = getNodeType(func.functionType);

        console.log(func.parameters);

        const adjustedParameters = { ...func.parameters };
        if (adjustedParameters.amount) {
          adjustedParameters.amount = parseFloat(
            ethers.utils.formatUnits(adjustedParameters.amount, 18)
          ).toFixed(2);
        }

        console.log(adjustedParameters);

        return {
          id: `node_${index}`,
          type: nodeType,
          position,
          data: { ...adjustedParameters, label: `${getLabel(func.functionType)}` },
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
  }, []);

  return (
    <div className="flex flex-col h-full bg-transparent">
      <ReactFlowProvider>
        <div className="flex-grow h-full relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            edgesUpdatable={false}
            fitView
          >
            <Background variant="dots" gap={15} size={1} />
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default ViewOnlyFlow;
