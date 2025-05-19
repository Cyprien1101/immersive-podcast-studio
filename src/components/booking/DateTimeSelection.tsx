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

interface DateTimeSelectionProps {
  studio: any;
  onProceed: (bookingDetails: {
    date: Date;
    startTime: string;
    duration: number;
    guests: number;
  }) => void;
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

// Time categories
interface TimeCategory {
  label: string;
  startHour: number;
  endHour: number;
  slots: TimeSlot[];
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({ studio, onProceed }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(1); // Default 1 hour
  const [guests, setGuests] = useState<number>(1); // Default 1 guest
  const [loading, setLoading] = useState<boolean>(false);
  const [timeCategories, setTimeCategories] = useState<TimeCategory[]>([]);
  
  // Fetch availability for the selected date and for the 'losangeles' studio
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      setSelectedStartTime(null); // Reset selection when date changes
      
      try {
        // Convert the date to the format used in the database
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        // First, get the losangeles studio id
        const { data: studioData, error: studioError } = await supabase
          .from('studios')
          .select('id')
          .eq('name', 'losangeles')
          .single();
        
        if (studioError) {
          console.error('Error fetching studio:', studioError);
          throw studioError;
        }
        
        const losAngelesStudioId = studioData?.id;
        
        if (!losAngelesStudioId) {
          console.error('Los Angeles studio not found');
          setLoading(false);
          return;
        }
        
        // Get availability data for the Los Angeles studio
        const { data, error } = await supabase
          .from('studio_availability')
          .select('*')
          .eq('studio_id', losAngelesStudioId)
          .eq('date', formattedDate);
        
        if (error) throw error;
        
        // Generate ALL time slots for the day (00:00 to 23:30, in 30-minute increments)
        const generatedTimeSlots: TimeSlot[] = [];
        for (let hour = 0; hour < 24; hour++) {
          for (let minute of [0, 30]) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // Check if this time slot exists in the data and check its availability status
            const timeSlot = data?.find(slot => slot.start_time === time);
            // If the slot exists in the database and is marked as unavailable, set it as unavailable
            // Otherwise, default to available
            const isAvailable = !timeSlot ? true : timeSlot.is_available;
            
            generatedTimeSlots.push({ time, isAvailable });
          }
        }
        
        setAvailableTimeSlots(generatedTimeSlots);
        
        // Organize slots into categories
        const categories: TimeCategory[] = [
          { label: 'Morning', startHour: 6, endHour: 12, slots: [] },
          { label: 'Afternoon', startHour: 12, endHour: 18, slots: [] },
          { label: 'Evening', startHour: 18, endHour: 23, slots: [] },
          { label: 'Night', startHour: 0, endHour: 6, slots: [] },
        ];
        
        // Fill categories with time slots
        generatedTimeSlots.forEach(slot => {
          const hour = parseInt(slot.time.split(':')[0], 10);
          
          for (const category of categories) {
            if (hour >= category.startHour && hour < category.endHour) {
              category.slots.push(slot);
              break;
            }
          }
        });
        
        // Order categories for display (morning first, night last)
        const orderedCategories = [
          categories[0], // Morning
          categories[1], // Afternoon
          categories[2], // Evening
          categories[3]  // Night
        ];
        
        setTimeCategories(orderedCategories);
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailability();
  }, [date]);
  
  // Check if a time slot can accommodate the selected duration
  const canSelectTimeSlot = (startIndex: number): boolean => {
    // We need 2 consecutive 30-min slots for 1 hour, 4 for 2 hours, etc.
    const slotsNeeded = duration * 2; 
    
    // Check if we have enough consecutive available slots
    for (let i = startIndex; i < startIndex + slotsNeeded; i++) {
      if (!availableTimeSlots[i] || !availableTimeSlots[i].isAvailable) {
        return false;
      }
    }
    
    return true;
  };
  
  // Format the time slot for display
  const formatTimeSlot = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  
  // Handle duration changes
  const handleDurationChange = (increment: boolean) => {
    setDuration(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      // Constraint between 1 and max_booking_duration (or default to 3)
      return Math.min(Math.max(newValue, 1), studio?.max_booking_duration || 3);
    });
    // Reset selected time when duration changes
    setSelectedStartTime(null);
  };
  
  // Handle guests changes
  const handleGuestsChange = (increment: boolean) => {
    setGuests(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      // Constraint between 1 and max_guests
      return Math.min(Math.max(newValue, 1), studio?.max_guests || 10);
    });
  };
  
  // Handle selecting a time slot
  const handleSelectTimeSlot = (time: string) => {
    // Find the slot in availableTimeSlots array
    const slotIndex = availableTimeSlots.findIndex(slot => slot.time === time);
    
    if (slotIndex !== -1 && canSelectTimeSlot(slotIndex)) {
      setSelectedStartTime(time);
    }
  };
  
  // Handle proceeding to next step
  const handleProceed = () => {
    if (date && selectedStartTime) {
      onProceed({
        date,
        startTime: selectedStartTime,
        duration,
        guests
      });
    }
  };

  // Disable past dates
  const disabledDays = (date: Date) => {
    return isAfter(startOfDay(new Date()), startOfDay(date));
  };
  
  return (
    <ScrollAnimationWrapper animation="fade-up">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Calendar */}
        <Card className="bg-podcast-dark border-gray-800 text-white h-fit">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Select Date</h3>
            
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-podcast-dark border-gray-700 hover:bg-gray-800"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-podcast-dark border-gray-700">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    disabled={disabledDays}
                    className="pointer-events-auto"
                    classNames={{
                      day_selected: "bg-black text-white hover:bg-gray-800",
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
                <div key={categoryIndex} className="mb-6">
                  <h4 className="text-lg font-medium mb-2 text-gray-300">{category.label}</h4>
                  <div className="bg-podcast-dark bg-opacity-60 p-4 rounded-md border border-gray-800">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1">
                      {category.slots.map((slot, index) => {
                        // Find the slot index in the overall availableTimeSlots array for checking consecutive availability
                        const slotIndex = availableTimeSlots.findIndex(s => s.time === slot.time);
                        const canSelect = slot.isAvailable && canSelectTimeSlot(slotIndex);
                        const isSelected = selectedStartTime === slot.time;
                        
                        return (
                          <Button
                            key={`${category.label}-${index}`}
                            className={cn(
                              "transition-all border text-xs py-1 px-1 h-7",
                              isSelected 
                                ? "bg-black text-white border-white hover:bg-gray-800" 
                                : canSelect
                                  ? "bg-black text-white border-gray-600 hover:bg-gray-800" 
                                  : "bg-gray-700 text-gray-400 border-gray-700 opacity-60 cursor-not-allowed"
                            )}
                            disabled={!canSelect}
                            onClick={() => handleSelectTimeSlot(slot.time)}
                          >
                            {formatTimeSlot(slot.time)}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
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
    </ScrollAnimationWrapper>
  );
};

export default DateTimeSelection;
