import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, MinusCircle } from 'lucide-react';

const CustomNodeWithdrawFrax = ({ id, data }) => {
  const amount = Number(data.amount);

  return (
    <div className="flex rounded-xl overflow-hidden shadow-xl bg-gradient-to-r from-green-500 to-green-700 border border-green-800 w-80">
      <div className="flex items-center justify-center w-16 bg-green-800">
        <MinusCircle className="text-white" size={32} />
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
      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-green-700" />
    </div>
  );
};

export default CustomNodeWithdrawFrax;
