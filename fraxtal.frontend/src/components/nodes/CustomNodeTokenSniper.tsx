import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Crosshair, ListRestart } from 'lucide-react';

const CustomNodeTokenSniper = ({ id, data }) => {
  const amount = Number(data.amount);

  return (
    <div>
    <div className="absolute -top-6 right-3">
    <div className="group relative bg-yellow-500 p-2 rounded-full shadow-lg transform transition-transform hover:scale-105">
        <ListRestart className="text-black" size={24} />
        <div className="absolute hidden group-hover:flex justify-center items-center w-48 p-2 text-xs text-white bg-gray-600 rounded-lg shadow-md transform -translate-y-10 translate-x-9">
          rewards will be "auto added" in users frax balance
        </div>
      </div>
    </div>
    <div className="flex rounded-xl overflow-hidden shadow-xl bg-gradient-to-r from-yellow-500 to-yellow-700 border border-yellow-800 w-80">
      <div className="flex items-center justify-center w-16 bg-yellow-800">
        <Crosshair className="text-black" size={32} />
      </div>
      <div className="flex-grow p-4">
        <div className="flex justify-between items-center">
          <strong className="text-black text-lg font-bold">{data.label}</strong>
          {data.isDeletable && (
            <Trash2
              className="cursor-pointer text-black ml-2"
              onClick={(event) => {
                event.stopPropagation();
                data.onDeleteClick(id);
              }}
            />
          )}
        </div>
        <div className="mt-2 text-sm text-black">Amount: {amount.toFixed(2)}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-yellow-700" />
      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-yellow-700" />
    </div>
    </div>
  );
};

export default CustomNodeTokenSniper;
