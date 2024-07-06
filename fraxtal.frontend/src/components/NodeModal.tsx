import React from 'react';
import { toast } from 'react-toastify';

const NodeModal = ({ show, onClose, onSelectNode, availableNodes }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-stratx-main-bg text-white p-6 rounded-lg shadow-lg max-w-xs w-full ">
        <h2 className="text-lg font-bold mb-4 text-stratx-accent-white">Select a Node</h2>
        <ul className="space-y-2">
          {availableNodes.map((node) => (
            <li
              key={node.type}
              className="cursor-pointer hover:bg-stratx-accent-blue/50 p-2 rounded border border-gray-600"
              onClick={() => {onSelectNode(node.type), toast.success('Node Added Successfully!')}}
            >
              {node.label}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 bg-stratx-accent-cherry hover:bg-stratx-accent-cherry/80 text-white py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NodeModal;
