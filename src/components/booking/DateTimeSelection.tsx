import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calendar as CalendarIcon, Plus, Minus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  studio_id: string;
  date: string;
}

interface DateTimeSelectionProps {
  studio: any;
  onDateTimeSelect: (date: Date | null, timeSlot: TimeSlot | null) => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({ studio, onDateTimeSelect }) => {
  const [date, setDate] = useState<Date | null>(null);
  const [allTimeSlots, setAllTimeSlots] = useState<TimeSlot[]>([]);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [duration, setDuration] = useState(1); // Default duration is 1 hour
  const [guestCount, setGuestCount] = useState(1); // Default guest count is 1
  
  // Calculate max duration and guests based on studio data
  const maxDuration = studio?.max_booking_duration || 3;
  const maxGuests = studio?.max_guests || 10;

  // Fetch available time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!date || !studio) return;
      
      setLoading(true);
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        console.log(`Fetching time slots for studio ID: ${studio.id} and date: ${formattedDate}`);
        
        const { data, error } = await supabase
          .from('studio_availability')
          .select('*')
          .eq('studio_id', studio.id)
          .eq('date', formattedDate);
        
        if (error) {
          throw error;
        }
        
        console.log(`Found ${data?.length || 0} time slots:`, data);
        setAllTimeSlots(data || []);
        
        if (data?.length === 0) {
          toast.info("Aucun créneau disponible pour cette date");
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        toast.error('Erreur lors de la récupération des créneaux disponibles');
      } finally {
        setLoading(false);
      }
    };

    if (date) {
      fetchTimeSlots();
    } else {
      setAllTimeSlots([]);
    }
  }, [date, studio]);

  // Filter time slots based on selected duration
  useEffect(() => {
    // Only process if we have time slots to work with
    if (allTimeSlots.length === 0) {
      setFilteredTimeSlots([]);
      return;
    }

    console.log(`Filtering time slots for duration: ${duration} hours`);

    // Helper function to check if a set of consecutive slots are all available
    const areConsecutiveSlotsAvailable = (startSlot: TimeSlot, requiredSlots: number) => {
      // Parse the start time
      const [startHourStr, startMinuteStr] = startSlot.start_time.split(':');
      const startHour = parseInt(startHourStr, 10);
      const startMinute = parseInt(startMinuteStr, 10);
      
      // If we only need one slot, just check if it's available
      if (requiredSlots <= 1) {
        return startSlot.is_available;
      }
      
      // We need to check additional slots
      let isValid = startSlot.is_available; // Start with the first slot
      
      // For debugging
      console.log(`Checking consecutive slots for ${startSlot.start_time}, need ${requiredSlots} slots`);
      
      // Loop through all needed consecutive time slots
      for (let i = 1; i < requiredSlots && isValid; i++) {
        // Calculate the next time slot (each slot is 30 minutes)
        let nextHour = startHour;
        let nextMinute = startMinute + (i * 30);
        
        // Handle minute overflow
        while (nextMinute >= 60) {
          nextHour += 1;
          nextMinute -= 60;
        }
        
        // Format the time for comparison
        const nextTimeStr = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;
        
        // Find the corresponding slot
        const nextSlot = allTimeSlots.find(
          slot => slot.start_time === nextTimeStr
        );
        
        // For debugging
        console.log(`Looking for slot at ${nextTimeStr}, found: ${nextSlot ? 'Yes' : 'No'}, available: ${nextSlot?.is_available}`);
        
        // If we can't find the slot or it's not available, this sequence isn't valid
        if (!nextSlot || !nextSlot.is_available) {
          isValid = false;
        }
      }
      
      return isValid;
    };

    // Filter slots to those that are valid for the selected duration
    const validSlots = allTimeSlots.filter(slot => {
      // Each hour needs 2 slots (30 min each)
      const requiredSlots = duration * 2;
      return areConsecutiveSlotsAvailable(slot, requiredSlots);
    });
    
    console.log(`Found ${validSlots.length} valid slots for duration: ${duration} hours`);
    setFilteredTimeSlots(validSlots);
    
    // Reset selected time slot if it's no longer valid
    if (selectedTimeSlot && !validSlots.find(slot => slot.id === selectedTimeSlot.id)) {
      setSelectedTimeSlot(null);
    }
  }, [allTimeSlots, duration]);

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
    setSelectedTimeSlot(null); // Reset selected time slot when date changes
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (!timeSlot.is_available) return; // Don't allow selecting unavailable slots
    setSelectedTimeSlot(timeSlot);
  };

  const handleProceed = () => {
    if (date && selectedTimeSlot) {
      onDateTimeSelect(date, selectedTimeSlot);
    }
  };

  const incrementDuration = () => {
    if (duration < maxDuration) {
      setDuration(prev => prev + 1);
    }
  };

  const decrementDuration = () => {
    if (duration > 1) {
      setDuration(prev => prev - 1);
    }
  };

  const incrementGuests = () => {
    if (guestCount < maxGuests) {
      setGuestCount(prev => prev + 1);
    }
  };

  const decrementGuests = () => {
    if (guestCount > 1) {
      setGuestCount(prev => prev - 1);
    }
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-semibold text-center text-white mb-8">
        <CalendarIcon className="inline-block mr-2 mb-1" /> Sélectionnez une Date et une Heure
      </h2>
      
      {/* Duration and Guest Count Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-black rounded-2xl p-6 border border-gray-800">
          <h3 className="text-xl font-medium text-podcast-accent mb-4">Durée de la Session</h3>
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementDuration}
              disabled={duration <= 1}
              className="h-10 w-10 rounded-full border-gray-700"
            >
              <Minus className="h-5 w-5 text-gray-300" />
            </Button>
            <div className="w-24 text-center">
              <span className="text-3xl font-bold text-white">{duration}</span>
              <span className="ml-2 text-gray-400">heure{duration > 1 ? 's' : ''}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={incrementDuration}
              disabled={duration >= maxDuration}
              className="h-10 w-10 rounded-full border-gray-700"
            >
              <Plus className="h-5 w-5 text-gray-300" />
            </Button>
          </div>
          <p className="text-gray-400 text-center mt-2 text-sm">
            Maximum: {maxDuration} heures
          </p>
        </div>
        
        <div className="bg-black rounded-2xl p-6 border border-gray-800">
          <h3 className="text-xl font-medium text-podcast-accent mb-4">Nombre de Personnes</h3>
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementGuests}
              disabled={guestCount <= 1}
              className="h-10 w-10 rounded-full border-gray-700"
            >
              <Minus className="h-5 w-5 text-gray-300" />
            </Button>
            <div className="w-24 text-center">
              <span className="text-3xl font-bold text-white">{guestCount}</span>
              <span className="ml-2 text-gray-400">personne{guestCount > 1 ? 's' : ''}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={incrementGuests}
              disabled={guestCount >= maxGuests}
              className="h-10 w-10 rounded-full border-gray-700"
            >
              <Plus className="h-5 w-5 text-gray-300" />
            </Button>
          </div>
          <p className="text-gray-400 text-center mt-2 text-sm">
            Maximum: {maxGuests} personnes
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar section */}
        <div className="bg-black rounded-2xl p-6 border border-gray-800">
          <h3 className="text-xl font-medium text-podcast-accent mb-4">Date</h3>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              className="bg-black text-white"
              locale={fr}
              disabled={(date) => {
                // Disable past dates
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
            />
          </div>
        </div>
        
        {/* Time slots section */}
        <div className="bg-black rounded-2xl p-6 border border-gray-800">
          <h3 className="text-xl font-medium text-podcast-accent mb-4">Horaires Disponibles</h3>
          
          {!date ? (
            <p className="text-gray-400 text-center py-8">
              Veuillez d'abord sélectionner une date
            </p>
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-podcast-accent" />
            </div>
          ) : filteredTimeSlots.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Aucun créneau disponible pour cette date et cette durée
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-2">
              {filteredTimeSlots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => handleTimeSlotSelect(slot)}
                  className={cn(
                    "py-2 px-1 rounded-lg text-center cursor-pointer transition-all text-sm",
                    selectedTimeSlot?.id === slot.id
                      ? "bg-podcast-accent text-white shadow-lg"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  )}
                >
                  {slot.start_time}
                </div>
              ))}
            </div>
          )}
          
          {/* Continue button */}
          <div className="mt-8 flex justify-center">
            <Button
              className="bg-gradient-to-r from-podcast-accent to-pink-500 text-white px-8 py-2 rounded-full disabled:opacity-50"
              disabled={!selectedTimeSlot}
              onClick={handleProceed}
            >
              Continuer
            </Button>
          </div>
        </div>
      </div>
      
      {/* Studio information */}
      {studio && (
        <div className="mt-8 p-5 rounded-xl bg-gray-900 border border-gray-800">
          <h3 className="text-lg font-semibold text-podcast-accent mb-2">
            Studio sélectionné : {studio.name}
          </h3>
          <p className="text-gray-300 mb-2">{studio.description}</p>
          <div className="flex items-center text-gray-400">
            <Users className="h-4 w-4 mr-1" />
            <span className="mr-4">Max {studio.max_guests} personnes</span>
            <span>Durée max: {studio.max_booking_duration}h</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeSelection;
