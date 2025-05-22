
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
  onDateTimeSelect: (date: Date | null, timeSlot: TimeSlot | null, duration: number, guests: number) => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({ studio, onDateTimeSelect }) => {
  const [date, setDate] = useState<Date | null>(new Date());
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

    // Fixed version of areConsecutiveSlotsAvailable function
    const areConsecutiveSlotsAvailable = (startIndex: number, requiredSlots: number): boolean => {
      const slots = [...allTimeSlots].sort((a, b) => a.start_time.localeCompare(b.start_time));
      
      // Make sure we have enough slots
      if (startIndex + requiredSlots > slots.length) return false;
      
      // Get the start slot time
      const startTime = slots[startIndex].start_time;
      const startHour = parseInt(startTime.split(':')[0]);
      const startMinute = parseInt(startTime.split(':')[1]);
      
      // Check each slot to make sure they are consecutive and available
      for (let i = 0; i < requiredSlots; i++) {
        // The slot we're checking
        const currentSlot = slots[startIndex + i];
        
        // If the slot is not available, the consecutive slots are not available
        if (!currentSlot.is_available) return false;
        
        // Calculate expected time for this slot position
        const expectedHour = startHour + Math.floor((startMinute + i * 30) / 60);
        const expectedMinute = (startMinute + i * 30) % 60;
        const expectedTime = `${expectedHour.toString().padStart(2, '0')}:${expectedMinute.toString().padStart(2, '0')}`;
        
        // If the slot doesn't match the expected time, they are not consecutive
        if (currentSlot.start_time !== expectedTime) return false;
      }
      
      return true;
    };

    // Get valid starting slots for the selected duration
    const validStartingSlots = [];
    const sortedSlots = [...allTimeSlots].sort((a, b) => a.start_time.localeCompare(b.start_time));
    
    // Each hour needs 2 slots (30 min each)
    const requiredSlots = duration * 2;
    
    for (let i = 0; i < sortedSlots.length; i++) {
      if (areConsecutiveSlotsAvailable(i, requiredSlots)) {
        validStartingSlots.push(sortedSlots[i]);
      }
    }
    
    console.log(`Found ${validStartingSlots.length} valid slots for duration: ${duration} hours`);
    setFilteredTimeSlots(validStartingSlots);
    
    // Reset selected time slot if it's no longer valid
    if (selectedTimeSlot && !validStartingSlots.find(slot => slot.id === selectedTimeSlot.id)) {
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
      onDateTimeSelect(date, selectedTimeSlot, duration, guestCount);
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
      
      {/* Duration and Guest Count Selectors - Updated UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-black rounded-2xl p-6 border border-gray-800">
          <h3 className="text-xl font-medium text-podcast-accent mb-4">Durée de la Session</h3>
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementDuration}
              disabled={duration <= 1}
              className="h-10 w-10 rounded-full bg-white border-gray-300"
            >
              <Minus className="h-5 w-5 text-black" />
            </Button>
            <div className="w-20 flex justify-center">
              <span className="text-3xl font-bold text-white">{duration}<span className="text-sm ml-1">h</span></span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={incrementDuration}
              disabled={duration >= maxDuration}
              className="h-10 w-10 rounded-full bg-white border-gray-300"
            >
              <Plus className="h-5 w-5 text-black" />
            </Button>
          </div>
        </div>
        
        <div className="bg-black rounded-2xl p-6 border border-gray-800">
          <h3 className="text-xl font-medium text-podcast-accent mb-4">Nombre de Personnes</h3>
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementGuests}
              disabled={guestCount <= 1}
              className="h-10 w-10 rounded-full bg-white border-gray-300"
            >
              <Minus className="h-5 w-5 text-black" />
            </Button>
            <div className="w-20 flex justify-center">
              <span className="text-3xl font-bold text-white">{guestCount}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={incrementGuests}
              disabled={guestCount >= maxGuests}
              className="h-10 w-10 rounded-full bg-white border-gray-300"
            >
              <Plus className="h-5 w-5 text-black" />
            </Button>
          </div>
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
      
      {/* Studio information - Simplified */}
      {studio && (
        <div className="mt-8 p-5 rounded-xl bg-gray-900 border border-gray-800">
          <h3 className="text-lg font-semibold text-podcast-accent mb-2">
            {studio.name}
          </h3>
          <p className="text-gray-300">{studio.description}</p>
        </div>
      )}
    </div>
  );
};

export default DateTimeSelection;
