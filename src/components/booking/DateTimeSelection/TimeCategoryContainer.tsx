
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import TimeCategory from './TimeCategory';

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface TimeCategory {
  label: string;
  startHour: number;
  endHour: number;
  slots: TimeSlot[];
}

interface TimeCategoryContainerProps {
  loading: boolean;
  timeCategories: TimeCategory[];
  selectedStartTime: string | null;
  availableTimeSlots: TimeSlot[];
  handleSelectTimeSlot: (time: string) => void;
  canSelectTimeSlot: (slotIndex: number) => boolean;
  formatTimeSlot: (time: string) => string;
  handleProceed: () => void;
}

const TimeCategoryContainer: React.FC<TimeCategoryContainerProps> = ({
  loading,
  timeCategories,
  selectedStartTime,
  availableTimeSlots,
  handleSelectTimeSlot,
  canSelectTimeSlot,
  formatTimeSlot,
  handleProceed,
}) => {
  return (
    <Card className="mt-8 bg-podcast-dark border-gray-800 text-white">
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Available Time Slots</h3>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : (
          <>
            {timeCategories.map((category, categoryIndex) => (
              <TimeCategory
                key={categoryIndex}
                label={category.label}
                slots={category.slots}
                selectedStartTime={selectedStartTime}
                availableTimeSlots={availableTimeSlots}
                handleSelectTimeSlot={handleSelectTimeSlot}
                canSelectTimeSlot={canSelectTimeSlot}
                formatTimeSlot={formatTimeSlot}
              />
            ))}
            
            {availableTimeSlots.length === 0 && !loading && (
              <p className="text-center text-gray-400 my-6">No time slots found for this date.</p>
            )}
            
            <div className="mt-8 flex justify-center">
              <Button 
                className="px-8 bg-black text-white border border-white hover:bg-gray-800"
                disabled={!selectedStartTime}
                onClick={handleProceed}
              >
                Continue
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeCategoryContainer;
