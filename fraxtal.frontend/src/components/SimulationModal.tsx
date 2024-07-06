// SimulationModal.tsx
import React from 'react';
import { Dialog, DialogBody, DialogHeader, DialogFooter } from '@material-tailwind/react';
import { X } from 'lucide-react';
import ReadOnlyDnDFlow from './ReadOnlyDnDFlow';

const SimulationModal = ({ isOpen, onClose, strategy, strategyId }) => {
  if (!strategy) return null;

  return (
    <Dialog open={isOpen} handler={onClose} size="lg" className="bg-stratx-main-bg/70 border-stratx-card-bg border-2">
      <DialogHeader className="flex justify-between items-center">
        <span className="text-white capitalize"><span>Strategy Name : {"  "}</span>{strategy.name}</span>
        <X className="cursor-pointer text-white" onClick={onClose} />
      </DialogHeader>
      <DialogBody className="p-4">
        <div className="w-full h-[600px]">
          <ReadOnlyDnDFlow name={strategy.name} details={strategy.details} functionCalls={strategy.functionCalls} strategyId={strategyId} />
        </div>
      </DialogBody>
      <DialogFooter className="flex justify-between items-center">
        <span className="text-white capitalize"><span>Strategy Details : {"  "}</span>{strategy.details}</span>
      </DialogFooter>
    </Dialog>
  );
};

export default SimulationModal;
