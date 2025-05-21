
import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeSlotProps {
  time: string;
  isAvailable: boolean;
  isSelected: boolean;
  canSelect: boolean;
  onSelect: () => void;
  formatTimeSlot: (time: string) => string;
}

const TimeSlot: React.FC<TimeSlotProps> = ({
  time,
  isAvailable,
  isSelected,
  canSelect,
  onSelect,
  formatTimeSlot,
}) => {
  return (
    <Button
      className={cn(
        "transition-all border text-xs py-1 px-1 h-7",
        isSelected 
          ? "bg-black text-white border-white hover:bg-gray-800" 
          : canSelect
            ? "bg-black text-white border-gray-600 hover:bg-gray-800" 
            : "bg-gray-700 text-gray-400 border-gray-700 opacity-60 cursor-not-allowed"
      )}
      disabled={!canSelect}
      onClick={onSelect}
    >
      {formatTimeSlot(time)}
    </Button>
  );
};

export default TimeSlot;
