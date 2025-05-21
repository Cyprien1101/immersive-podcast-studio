
import React from 'react';
import TimeSlot from './TimeSlot';

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface TimeCategoryProps {
  label: string;
  slots: TimeSlot[];
  selectedStartTime: string | null;
  availableTimeSlots: TimeSlot[];
  handleSelectTimeSlot: (time: string) => void;
  canSelectTimeSlot: (slotIndex: number) => boolean;
  formatTimeSlot: (time: string) => string;
}

const TimeCategory: React.FC<TimeCategoryProps> = ({
  label,
  slots,
  selectedStartTime,
  availableTimeSlots,
  handleSelectTimeSlot,
  canSelectTimeSlot,
  formatTimeSlot,
}) => {
  // Ne pas afficher la catégorie si elle ne contient pas de créneaux
  if (slots.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-lg font-medium mb-2 text-gray-300">{label}</h4>
      <div className="bg-podcast-dark bg-opacity-60 p-4 rounded-md border border-gray-800">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1">
          {slots.map((slot, index) => {
            // Trouver l'index du créneau dans l'array global pour vérifier la disponibilité consécutive
            const slotIndex = availableTimeSlots.findIndex(s => s.time === slot.time);
            const canSelect = slot.isAvailable && canSelectTimeSlot(slotIndex);
            const isSelected = selectedStartTime === slot.time;
            
            return (
              <TimeSlot
                key={`${label}-${slot.time}`}
                time={slot.time}
                isAvailable={slot.isAvailable}
                isSelected={isSelected}
                canSelect={canSelect}
                onSelect={() => handleSelectTimeSlot(slot.time)}
                formatTimeSlot={formatTimeSlot}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeCategory;
