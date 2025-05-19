
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Clock, Users } from "lucide-react";

interface SessionDetailsProps {
  duration: number;
  guests: number;
  handleDurationChange: (increment: boolean) => void;
  handleGuestsChange: (increment: boolean) => void;
  maxBookingDuration: number;
  maxGuests: number;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({
  duration,
  guests,
  handleDurationChange,
  handleGuestsChange,
  maxBookingDuration,
  maxGuests,
}) => {
  return (
    <Card className="bg-podcast-dark border-gray-800 text-white h-fit">
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Session Details</h3>
        
        {/* Duration Selector */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" /> Duration
          </label>
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-podcast-dark border-gray-700 hover:bg-gray-800"
              onClick={() => handleDurationChange(false)}
              disabled={duration <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 mx-2 bg-podcast-dark rounded-md min-w-[60px] text-center">
              {duration} {duration === 1 ? 'hour' : 'hours'}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-podcast-dark border-gray-700 hover:bg-gray-800"
              onClick={() => handleDurationChange(true)}
              disabled={duration >= maxBookingDuration}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Guests Selector */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2" /> How many people will be recording?
          </label>
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-podcast-dark border-gray-700 hover:bg-gray-800"
              onClick={() => handleGuestsChange(false)}
              disabled={guests <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 mx-2 bg-podcast-dark rounded-md min-w-[60px] text-center">
              {guests} {guests === 1 ? 'guest' : 'guests'}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-podcast-dark border-gray-700 hover:bg-gray-800"
              onClick={() => handleGuestsChange(true)}
              disabled={guests >= maxGuests}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionDetails;
