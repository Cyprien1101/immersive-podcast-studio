
import { useState, useEffect } from 'react';
import { format, isAfter, startOfDay } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";

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

interface BookingDetails {
  date: Date;
  startTime: string;
  duration: number;
  guests: number;
}

interface UseDateTimeLogicProps {
  studio: any;
  onProceed: (bookingDetails: BookingDetails) => void;
}

export const useDateTimeLogic = ({ studio, onProceed }: UseDateTimeLogicProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(1); // Default 1 hour
  const [guests, setGuests] = useState<number>(1); // Default 1 guest
  const [loading, setLoading] = useState<boolean>(false);
  const [timeCategories, setTimeCategories] = useState<TimeCategory[]>([]);
  
  // Fetch availability for the selected date
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
        
        console.log("Availability data from database:", data);
        
        // Generate ALL time slots for the day (00:00 to 23:30, in 30-minute increments)
        const generatedTimeSlots: TimeSlot[] = [];
        for (let hour = 0; hour < 24; hour++) {
          for (let minute of [0, 30]) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // Check if this time slot exists in the data and check its availability status
            const timeSlot = data?.find(slot => slot.start_time === time);
            // If the slot exists in the database, use its availability status
            // If it doesn't exist, assume it's available
            const isAvailable = timeSlot ? timeSlot.is_available : true;
            
            generatedTimeSlots.push({ time, isAvailable });
          }
        }
        
        console.log("Generated time slots:", generatedTimeSlots.length);
        
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
        
        console.log("Time categories:", orderedCategories.map(c => ({ label: c.label, slotCount: c.slots.length })));
        
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

  return {
    date,
    setDate,
    availableTimeSlots,
    selectedStartTime,
    duration,
    guests,
    loading,
    timeCategories,
    canSelectTimeSlot,
    formatTimeSlot,
    handleDurationChange,
    handleGuestsChange,
    handleSelectTimeSlot,
    handleProceed,
    disabledDays
  };
};
