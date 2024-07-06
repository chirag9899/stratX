import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Lock, ListRestart } from 'lucide-react';

const CustomNodeDepositCollateral = ({ id, data }) => {
  const amount = Number(data.amount);

  return (
    <div className="relative w-80">
      <div className="absolute -top-6 right-3">
      <div className="group relative bg-pink-500 p-2 rounded-full shadow-lg transform transition-transform hover:scale-105">
          <ListRestart className="text-white" size={24} />
          <div className="absolute hidden group-hover:flex justify-center items-center w-48 p-2 text-xs text-white bg-gray-600 rounded-lg shadow-md transform -translate-y-10 translate-x-9">
            rewards will be "auto harvested" in users frax balance
          </div>
        </div>
      </div>
      <div className="flex rounded-xl overflow-hidden shadow-xl bg-gradient-to-r from-pink-500 to-pink-700 border border-pink-800">
        <div className="flex items-center justify-center w-16 bg-pink-800">
          <Lock className="text-white" size={32} />
        </div>
        <div className="flex-grow p-4">
          <div className="flex justify-between items-center">
            <strong className="text-white text-lg font-bold">{data.label}</strong>
            {data.isDeletable && (
              <Trash2
                className="cursor-pointer text-white ml-2"
                onClick={(event) => {
                  event.stopPropagation();
                  data.onDeleteClick(id);
                }}
              />
            )}
          </div>
          <div className="mt-2 text-sm text-white">Amount: {amount.toFixed(2)}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-pink-700" />
      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-pink-700" />
    </div>
  );
};

export default CustomNodeDepositCollateral;
