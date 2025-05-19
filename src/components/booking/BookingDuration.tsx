
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingDurationProps {
  duration: number;
  setDuration: (duration: number) => void;
  guestCount: number;
  setGuestCount: (count: number) => void;
  maxGuests: number;
}

const BookingDuration: React.FC<BookingDurationProps> = ({
  duration,
  setDuration,
  guestCount,
  setGuestCount,
  maxGuests
}) => {
  const handleDecreaseDuration = () => {
    if (duration > 1) {
      setDuration(duration - 1);
    }
  };

  const handleIncreaseDuration = () => {
    if (duration < 3) {
      setDuration(duration + 1);
    }
  };

  const handleDecreaseGuests = () => {
    if (guestCount > 1) {
      setGuestCount(guestCount - 1);
    }
  };

  const handleIncreaseGuests = () => {
    if (guestCount < maxGuests) {
      setGuestCount(guestCount + 1);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Duration Selector */}
      <div className="bg-podcast-muted p-5 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-3">Session Duration</h3>
        <div className="flex items-center justify-between">
          <Button 
            onClick={handleDecreaseDuration}
            disabled={duration <= 1}
            className="bg-black text-white border border-gray-600 hover:bg-gray-900 p-2 h-10 w-10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center px-4 py-2 bg-black text-white border border-gray-600 rounded-md">
            <span className="text-xl font-semibold">{duration}</span>
            <span className="ml-2 text-gray-300">hour{duration !== 1 ? 's' : ''}</span>
          </div>
          
          <Button 
            onClick={handleIncreaseDuration}
            disabled={duration >= 3}
            className="bg-black text-white border border-gray-600 hover:bg-gray-900 p-2 h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-2">Choose between 1-3 hours</p>
      </div>
      
      {/* Guest Count Selector */}
      <div className="bg-podcast-muted p-5 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-3">How many people will be recording?</h3>
        <div className="flex items-center justify-between">
          <Button 
            onClick={handleDecreaseGuests}
            disabled={guestCount <= 1}
            className="bg-black text-white border border-gray-600 hover:bg-gray-900 p-2 h-10 w-10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center px-4 py-2 bg-black text-white border border-gray-600 rounded-md">
            <span className="text-xl font-semibold">{guestCount}</span>
            <span className="ml-2 text-gray-300">guest{guestCount !== 1 ? 's' : ''}</span>
          </div>
          
          <Button 
            onClick={handleIncreaseGuests}
            disabled={guestCount >= maxGuests}
            className="bg-black text-white border border-gray-600 hover:bg-gray-900 p-2 h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-2">Max {maxGuests} guests for this studio</p>
      </div>
    </div>
  );
};

export default BookingDuration;
