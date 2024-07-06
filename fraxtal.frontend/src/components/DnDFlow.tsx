///////////////////////////////////////////
//          react flow config            //
///////////////////////////////////////////

import { useState, useRef, useCallback, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";

import { Plus, Send } from "lucide-react";

import NodeDrawer from "./NodeDrawer";
import NodeModal from "./NodeModal";

import CustomNodeDeposit from "./nodes/CustomNodeDeposit";
import CustomNodeWithdrawFrax from "./nodes/CustomNodeWithdrawFrax";
import CustomNodeDepositCollateral from "./nodes/CustomNodeDepositCollateral";
import CustomNodeTransferFrax from "./nodes/CustomNodeTransferFrax";
import CustomNodeTokenSniper from "./nodes/CustomNodeTokenSniper";
import CustomNodeWithdrawSFrax from "./nodes/CustomNodeWithdrawSFrax";
import CustomNodeTransferSFrax from "./nodes/CustomNodeTransferSFrax";
import { toast, ToastContainer } from "react-toastify";

import { useContract } from "../providers/thirdwebHook";
import { ClipLoader } from "react-spinners";

///////////////////////////////////////////
//       node types definition           //
///////////////////////////////////////////

const nodeTypes = {
  customNodeDeposit: CustomNodeDeposit,
  customNodeWithdraw_Frax: CustomNodeWithdrawFrax,
  customNodeWithdraw_sFrax: CustomNodeWithdrawSFrax,
  customNodeTransfer_Frax: CustomNodeTransferFrax,
  customNodeTransfer_sFrax: CustomNodeTransferSFrax,
  customNodeToken_sniper: CustomNodeTokenSniper,
  customNodeDeposit_collateral: CustomNodeDepositCollateral,
};

const getId = (() => {
  let id = 0;
  return () => `dndnode_${id++}`;
})();

///////////////////////////////////////////
//         initial node data            //
///////////////////////////////////////////

const nodeData = {
  deposit: { label: "Deposit ", amount: 0 },
  withdraw_sFrax: { label: "Withdraw Collateral ", amount: 0 },
  withdraw_Frax: { label: "Withdraw Frax ", amount: 0 },
  transfer_Frax: {
    label: "Transfer Frax ",
    amount: 0,
    address: "0x0000000000000000000000000000000000000000",
  },
  transfer_sFrax: {
    label: "Transfer collateral ",
    amount: 0,
    address: "0x0000000000000000000000000000000000000000",
  },
  token_sniper: { label: "Token Sniper ", amount: 0 },
  deposit_collateral: { label: "Deposit Collateral ", amount: 0 },
};

///////////////////////////////////////////
//         hooks for contract            //
///////////////////////////////////////////

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    lastNodeId,
    setLastNodeId,
    name,
    setName,
    details,
    setDetails,
    createStrategy,
  } = useContract();

  ///////////////////////////////////////////
  //       hooks for react flow            //
  ///////////////////////////////////////////

  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [availableNodes, setAvailableNodes] = useState([]);
  const [createStrategyLoading, setCreateStrategyLoading] = useState(false);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  ///////////////////////////////////////////
  //       handle create strartegy         //
  ///////////////////////////////////////////

  const handleCreateStrategy = async () => {
    setCreateStrategyLoading(true);
    try {
      try {
        // const lastNode = nodes[nodes.length - 1];
        // const validEndNodes = [
        //   "customNodeWithdraw_Frax",
        //   "customNodeTransfer_Frax",
        //   "customNodeWithdraw_sFrax",
        //   "customNodeTransfer_sFrax",
        // ];
        // if (!validEndNodes.includes(lastNode?.type)) {
        //   toast.error("Please select a valid end node.");
        //   setCreateStrategyLoading(false);
        //   return;
        if(!name) {
          toast.error("Please enter name.");
          setCreateStrategyLoading(false);
          return;
        } else if (!details) {
          toast.error("Please enter details.");
          setCreateStrategyLoading(false);
          return;
        } else if (nodes.length < 1) {
          toast.error("Please add at least 1 node.");
          setCreateStrategyLoading(false);
          return;
        }
      } catch (error) {
        console.log(error);
      }
      const filteredData = nodes.map((node) => {
        const { type, data } = node;
        let functionType;
        let parameters = {};

        switch (type) {
          case "customNodeDeposit":
            functionType = "Deposit";
            parameters.amount = data.amount;
            break;
          case "customNodeDeposit_collateral":
            functionType = "DepositToFraxFi";
            parameters.amount = data.amount;
            break;
          case "customNodeWithdraw_Frax":
            functionType = "WithdrawFrax";
            parameters.amount = data.amount;
            break;
          case "customNodeTransfer_Frax":
            functionType = "TransferFrax";
            parameters = { amount: data.amount, address: data.address };
            break;
          case "customNodeWithdraw_sFrax":
            functionType = "WithdrawSfrax";
            parameters.amount = data.amount;
            break;
          case "customNodeTransfer_sFrax":
            functionType = "TransferSfrax";
            parameters = { amount: data.amount, address: data.address };
            break;
          case "customNodeToken_sniper":
            functionType = "SniperBot";
            parameters.amount = data.amount;
            break;
          default:
            functionType = "Unknown";
            break;
        }

        return {
          functionType,
          parameters,
        };
      });

      console.log("Filtered Data for Strategy:", {
        name,
        details,
        filteredData,
      });
      await createStrategy(name, details, filteredData);
      toast.success("Created Strategy Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Creating Strategy Failed");
    }  
      setCreateStrategyLoading(false);
      setNodes([]);
      setEdges([]);
      setLastNodeId(null);
      setName("");
      setDetails("");
    
  };

  ///////////////////////////////////////////
  //       handle node click               //
  ///////////////////////////////////////////

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  ///////////////////////////////////////////
  //       handle delete node              //
  ///////////////////////////////////////////

  const deleteNode = (nodeId) => {
    setNodes((nds) => {
      const updatedNodes = nds.filter((node) => node.id !== nodeId);
      if (updatedNodes.length > 0) {
        setLastNodeId(updatedNodes[updatedNodes.length - 1].id);
      } else {
        setLastNodeId(null);
      }
      return updatedNodes;
    });
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
    toast.success("Node deleted successfully");
  };

  ///////////////////////////////////////////
  //       handle drawer close             //
  ///////////////////////////////////////////
  const handleDrawerClose = () => {
    setSelectedNode(null);
  };

  ///////////////////////////////////////////
  //       handle node data change         //
  ///////////////////////////////////////////

  const handleNodeDataChange = (updatedNode) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    );
  };

  ///////////////////////////////////////////
  //       handle add node click           //
  ///////////////////////////////////////////
  const handleAddNodeClick = () => {
    setShowNodeModal(true);
  };

  ///////////////////////////////////////////
  //       handle node select              //
  ///////////////////////////////////////////

  const handleNodeSelect = (type) => {
    const lastNode = nodes.find((node) => node.id === lastNodeId);
    const position = lastNode
      ? {
          x: lastNode.position.x,
          y: lastNode.position.y + 150,
        }
      : { x: 250, y: 250 };
    const nodeType = `customNode${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const newNode = {
      id: getId(),
      type: nodeType,
      position,
      data: {
        ...nodeData[type],
        onEditClick: onNodeClick,
        onDeleteClick: deleteNode,
        isDeletable: true,
      },
    };
    setNodes((nds) => {
      const updatedNodes = nds.concat(newNode);
      if (lastNodeId) {
        setEdges((eds) =>
          addEdge({ id: getId(), source: lastNodeId, target: newNode.id }, eds)
        );
      }
      setLastNodeId(newNode.id);
      console.log("Updated Nodes:", updatedNodes);
      return updatedNodes;
    });

    console.log(name, details);
    setShowNodeModal(false);
  };

  ///////////////////////////////////////////
  //          useEffect hooks              //
  ///////////////////////////////////////////

  useEffect(() => {
    const lastNode = nodes.find((node) => node.id === lastNodeId);
    let newAvailableNodes = [];

    if (!lastNode) {
      newAvailableNodes = [{ type: "deposit", label: "Deposit Node" }];
    } else {
      switch (lastNode.type) {
        case "customNodeDeposit":
          newAvailableNodes = [
            { type: "deposit_collateral", label: "Deposit Collateral Node" },
            { type: "withdraw_Frax", label: "Withdraw Frax Node" },
            { type: "transfer_Frax", label: "Transfer Frax Node" },
          ];
          break;
        case "customNodeDeposit_collateral":
          newAvailableNodes = [
            { type: "token_sniper", label: "Token Sniper Node" },
            { type: "withdraw_sFrax", label: "Withdraw collateral Node" },
            { type: "transfer_sFrax", label: "Transfer collateral Node" },
          ];
          break;
        case "customNodeToken_sniper":
          newAvailableNodes = [
            { type: "withdraw_sFrax", label: "Withdraw collateral Node" },
            { type: "transfer_sFrax", label: "Transfer collateral Node" },
          ];
          break;
        default:
          newAvailableNodes = [];
      }
    }
    setAvailableNodes(newAvailableNodes);
  }, [lastNodeId, nodes]);

  useEffect(() => {
    if (nodes.length === 0) {
      setAvailableNodes([{ type: "deposit", label: "Deposit Node" }]);
      setLastNodeId(null);
    }
  }, [nodes]);

  //////////////////////////////////////////
  //          render layout               //
  //////////////////////////////////////////

  return (
    <div className="flex flex-col h-full bg-transparent">
      <ReactFlowProvider>
        <div className="flex-grow h-full relative " ref={reactFlowWrapper}>
          <div className="absolute flex-col space-y-4 top-10 left-10 flex  z-50">
            <div className="flex space-x-2 items-center">
              <span className="text-white text-2xl">Name:</span>
              <input
                type="text"
                placeholder="Name"
                onChange={(e) => setName(e.target.value)}
                className="text-black rounded-sm pl-2 py-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-stratx-accent-cherry/50"
              />
            </div>
            <div className="flex space-x-2 items-center">
              <span className="text-white text-2xl">Description:</span>
              <input
                type="text"
                placeholder="Description"
                onChange={(e) => setDetails(e.target.value)}
                className="text-black rounded-sm pl-2 py-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-stratx-accent-cherry/50"
              />
            </div>
          </div>
          <div className="absolute bottom-20 right-20 flex flex-col justify-center items-center gap-y-2 z-50">
            <button
              className="h-16 w-16 bg-stratx-accent-blue hover:bg-stratx-accent-blue/70 text-black font-bold py-2 px-4 rounded-full flex justify-center items-center"
              onClick={handleAddNodeClick}
              disabled={availableNodes.length === 0}
            >
              <Plus className="h-10 w-10" />
            </button>
            <button
              className="h-16 w-16 bg-stratx-accent-cherry hover:bg-stratx-accent-cherry/70 text-white font-bold py-2 px-4 rounded-full flex justify-center items-center"
              onClick={handleCreateStrategy}
            >
              {createStrategyLoading ? (
                <ClipLoader color="white" size={20} />
              ) : (
                <Send className="h-10 w-10" />
              )}
            </button>
          </div>
          {showNodeModal && (
            <NodeModal
              show={showNodeModal}
              onClose={() => setShowNodeModal(false)}
              onSelectNode={handleNodeSelect}
              availableNodes={availableNodes}
            />
          )}
          <ReactFlow
            nodes={nodes.map((node, index) => ({
              ...node,
              data: {
                ...node.data,
                onDeleteClick: deleteNode,
                isDeletable: index === nodes.length - 1,
              },
            }))}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            // onNodeClick={onNodeClick}
            nodesDraggable={false}
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

export default DnDFlow;
