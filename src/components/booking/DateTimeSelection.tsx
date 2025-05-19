
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  studio_id: string;
  date: string;
}

interface DateTimeSelectionProps {
  studioId: string;
  onSelectDateTime: (date: Date, startTime: string, endTime: string) => void;
  selectedDuration: number;
  selectedGuests: number;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  studioId,
  onSelectDateTime,
  selectedDuration,
  selectedGuests,
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (date && studioId) {
      fetchAvailability();
    }
  }, [date, studioId, selectedDuration]);

  const fetchAvailability = async () => {
    if (!date) return;
    
    setLoading(true);
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    try {
      // Fetch availability from Supabase
      const { data, error } = await supabase
        .from('studio_availability')
        .select('*')
        .eq('studio_id', studioId)
        .eq('date', formattedDate);
      
      if (error) throw error;
      
      // If no data for this date, generate time slots (all available by default)
      if (!data || data.length === 0) {
        generateDefaultTimeSlots(formattedDate);
      } else {
        // Process the available time slots
        processTimeSlots(data, formattedDate);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultTimeSlots = (formattedDate: string) => {
    // Generate time slots from 9 AM to 10 PM
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hourFormatted = hour.toString().padStart(2, '0');
        const minuteFormatted = minute.toString().padStart(2, '0');
        const time = `${hourFormatted}:${minuteFormatted}`;
        
        slots.push({
          id: `${formattedDate}-${time}`,
          time,
          available: true,
          studio_id: studioId,
          date: formattedDate
        });
      }
    }
    setTimeSlots(slots);
  };

  const processTimeSlots = (data: any[], formattedDate: string) => {
    // Create a map of start times to availability status
    const availabilityMap = new Map();
    
    data.forEach(slot => {
      availabilityMap.set(slot.start_time, slot.is_available);
    });
    
    // Generate all possible time slots
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hourFormatted = hour.toString().padStart(2, '0');
        const minuteFormatted = minute.toString().padStart(2, '0');
        const time = `${hourFormatted}:${minuteFormatted}`;
        
        // Check if this time exists in the availability data
        const available = availabilityMap.has(time) ? availabilityMap.get(time) : true;
        
        slots.push({
          id: `${formattedDate}-${time}`,
          time,
          available,
          studio_id: studioId,
          date: formattedDate
        });
      }
    }
    
    setTimeSlots(slots);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    
    if (date) {
      // Calculate end time based on selected duration (in hours)
      const [hours, minutes] = time.split(':').map(Number);
      const startTime = time;
      
      const endHour = hours + selectedDuration;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      onSelectDateTime(date, startTime, endTime);
    }
  };

  // Check if a time slot can be selected based on duration
  const isSlotSelectable = (index: number) => {
    // For the selected duration, check if the required consecutive slots are available
    const requiredSlots = selectedDuration * 2; // 2 slots per hour (30 min each)
    
    if (index + requiredSlots > timeSlots.length) return false;
    
    for (let i = 0; i < requiredSlots; i++) {
      if (!timeSlots[index + i].available) return false;
    }
    
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={{ before: new Date() }}
          className="rounded-md border"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium text-white",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4 text-podcast-accent" />,
            IconRight: () => <ChevronRight className="h-4 w-4 text-podcast-accent" />,
          }}
        />
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Available Times</h3>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-podcast-accent"></div>
          </div>
        ) : timeSlots.length === 0 ? (
          <p className="text-center text-gray-400">No times available for the selected date.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {timeSlots.map((slot, index) => {
              const isSelectable = isSlotSelectable(index);
              // Only show slots at full hour intervals and that have enough consecutive availability
              if (slot.time.endsWith(':00') && isSelectable) {
                return (
                  <Button
                    key={slot.id}
                    onClick={() => isSelectable && handleTimeSelect(slot.time)}
                    className={`
                      h-auto py-2 px-3 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-podcast-accent focus:ring-opacity-50 
                      transition-colors duration-200
                      ${selectedTime === slot.time 
                        ? 'bg-white text-black border border-gray-300' 
                        : 'bg-black text-white border border-gray-600'
                      }
                      ${!isSelectable ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={!isSelectable}
                  >
                    {slot.time}
                  </Button>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimeSelection;
