import React, { useState, useEffect } from 'react';
import { format, addDays, isAfter, startOfDay } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Minus, Plus, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';

// ... keep existing code (interfaces and type definitions)

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({ studio, onProceed }) => {
  // ... keep existing code (state declarations and functions)
  
  return (
    <ScrollAnimationWrapper animation="fade-up">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Calendar */}
        <Card className="bg-black border-gray-800 text-white h-fit">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Select Date</h3>
            
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-gray-900 border-gray-700 hover:bg-gray-800"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    disabled={disabledDays}
                    className="pointer-events-auto"
                    classNames={{
                      day_selected: "bg-white text-black hover:bg-gray-200",
                      day_today: "bg-gray-700 text-white",
                      day: "text-white hover:bg-gray-800 focus:bg-gray-800",
                      caption_label: "text-white",
                      head_cell: "text-gray-400"
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
        
        {/* Right Column - Session Details */}
        <Card className="bg-black border-gray-800 text-white h-fit">
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
                  className="bg-gray-900 border-gray-700 hover:bg-gray-800"
                  onClick={() => handleDurationChange(false)}
                  disabled={duration <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 mx-2 bg-gray-900 rounded-md min-w-[60px] text-center">
                  {duration} {duration === 1 ? 'hour' : 'hours'}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-gray-900 border-gray-700 hover:bg-gray-800"
                  onClick={() => handleDurationChange(true)}
                  disabled={duration >= (studio?.max_booking_duration || 3)}
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
                  className="bg-gray-900 border-gray-700 hover:bg-gray-800"
                  onClick={() => handleGuestsChange(false)}
                  disabled={guests <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 mx-2 bg-gray-900 rounded-md min-w-[60px] text-center">
                  {guests} {guests === 1 ? 'guest' : 'guests'}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-gray-900 border-gray-700 hover:bg-gray-800"
                  onClick={() => handleGuestsChange(true)}
                  disabled={guests >= (studio?.max_guests || 10)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Time Slots Section */}
      <Card className="mt-8 bg-black border-gray-800 text-white">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Available Time Slots</h3>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {availableTimeSlots.map((slot, index) => {
                  const canSelect = canSelectTimeSlot(index);
                  // const isSelected = selectedStartTime === slot.time; // plus besoin si tout est noir/blanc
                  
                  return (
                    <Button
                      key={slot.time}
                      size="sm"
                      className={cn(
                        "transition-all text-xs py-1 px-2 rounded-full h-8",
                        canSelect && slot.isAvailable
                          ? "bg-black hover:bg-black text-white border border-gray-700"
                          : "bg-gray-900 text-gray-500 opacity-50 cursor-not-allowed"
                      )}
                      disabled={!canSelect || !slot.isAvailable}
                      onClick={() => handleSelectTimeSlot(slot.time, index)}
                    >
                      {formatTimeSlot(slot.time)}
                    </Button>
                  );
                })}
              </div>
              
              {availableTimeSlots.length === 0 && !loading && (
                <p className="text-center text-gray-400 my-6">No available time slots for this date.</p>
              )}
              
              <div className="mt-8 flex justify-center">
                <Button 
                  className="px-8 bg-white text-black hover:bg-gray-200"
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
    </ScrollAnimationWrapper>
  );
};

export default DateTimeSelection
