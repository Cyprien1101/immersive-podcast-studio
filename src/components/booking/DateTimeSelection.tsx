import React, { useState, useEffect, useNavigate } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar as CalendarIcon, Minus, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isBefore, addDays, parseISO, addHours, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useBooking } from '@/context/BookingContext';
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface DateTimeSelectionProps {
  studio: {
    id: string;
    name: string;
    max_booking_duration: number;
    max_guests: number;
    description?: string;
  } | null;
  onDateTimeSelect: (date: Date, timeSlot: TimeSlot, duration: number, guests: number) => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({ studio, onDateTimeSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingDuration, setBookingDuration] = useState(1);
  const [guestCount, setGuestCount] = useState(1);
  
  const { setDateTimeInfo } = useBooking();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (selectedDate && studio) {
      fetchTimeSlots();
    }
  }, [selectedDate, studio]);
  
  const fetchTimeSlots = async () => {
    if (!selectedDate || !studio) return;
    
    setLoading(true);
    try {
      // Formatage de la date pour la requête en utilisant une méthode qui ne souffre pas des problèmes de timezone
      const formattedDate = formatDateToISOString(selectedDate);
      
      const { data, error } = await supabase
        .from('studio_availability')
        .select('*')
        .eq('studio_id', studio.id)
        .eq('date', formattedDate)
        .eq('is_available', true)
        .order('start_time');
      
      if (error) throw error;
      
      setTimeSlots(data || []);
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction qui garantit que la date est correctement formatée sans décalage de timezone
  const formatDateToISOString = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };
  
  // Check if a slot can accommodate the selected duration
  const canSelectTimeSlot = (slotIndex: number): boolean => {
    if (!timeSlots || timeSlots.length === 0 || bookingDuration <= 0) return false;
    
    // For multi-hour bookings, check consecutive slots
    const hoursNeeded = bookingDuration;
    const slotsNeeded = hoursNeeded * 2; // Assuming 30-minute slots
    
    // Check if we have enough slots after the selected one
    if (slotIndex + slotsNeeded - 1 >= timeSlots.length) return false;
    
    // Check if all needed slots are available
    for (let i = 0; i < slotsNeeded; i++) {
      const slot = timeSlots[slotIndex + i];
      if (!slot || !slot.is_available) return false;
      
      // For slots other than the first one, ensure they are consecutive
      if (i > 0) {
        const prevSlot = timeSlots[slotIndex + i - 1];
        // Check if this slot starts right after the previous one ends
        const prevEndTime = prevSlot.end_time;
        const currStartTime = slot.start_time;
        if (prevEndTime !== currStartTime) return false;
      }
    }
    
    // Check if the booking would end after the closing time (19:30)
    const startSlot = timeSlots[slotIndex];
    const [startHour, startMinute] = startSlot.start_time.split(':').map(Number);
    
    const endHour = startHour + Math.floor((startMinute + bookingDuration * 60) / 60);
    const endMinute = (startMinute + bookingDuration * 60) % 60;
    
    const formattedEndHour = endHour.toString().padStart(2, '0');
    const formattedEndMinute = endMinute.toString().padStart(2, '0');
    const calculatedEndTime = `${formattedEndHour}:${formattedEndMinute}`;
    
    // Check if the calculated end time is after closing time (19:30)
    if (calculatedEndTime > '19:30') return false;
    
    return true;
  };
  
  const handleTimeSlotSelect = (timeSlot: TimeSlot, index: number) => {
    if (!canSelectTimeSlot(index)) {
      console.log("Cannot select this slot for the current duration");
      return;
    }
    
    setSelectedTimeSlot(timeSlot);
  };
  
  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, durationInHours: number): string => {
    // Convert start time to Date object for calculation
    if (!selectedDate) return startTime;
    
    const [hours, minutes] = startTime.split(':').map(Number);
    let baseDate = new Date(selectedDate);
    baseDate.setHours(hours, minutes, 0, 0);
    
    // Add the duration
    const endDate = addHours(baseDate, durationInHours);
    
    // Format back to HH:MM
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };
  
  const handleContinue = () => {
    if (selectedDate && selectedTimeSlot) {
      // Calculate the proper end time based on duration
      const endTime = calculateEndTime(selectedTimeSlot.start_time, bookingDuration);
      
      // Formatage de la date en utilisant la méthode fiable sans décalage de timezone
      const formattedDate = formatDateToISOString(selectedDate);
      
      console.log("Date sélectionnée (handleContinue):", formattedDate, "Date brute:", selectedDate);
      
      // Set the date and time info in the booking context
      setDateTimeInfo({
        date: formattedDate,
        start_time: selectedTimeSlot.start_time,
        end_time: endTime,
        number_of_guests: guestCount
      });
      
      // Create a new timeSlot object with the calculated end time
      const updatedTimeSlot = {
        ...selectedTimeSlot,
        end_time: endTime
      };
      
      // First call the parent component's onDateTimeSelect for state updates
      onDateTimeSelect(
        selectedDate,
        updatedTimeSlot,
        bookingDuration,
        guestCount
      );
      
      // Then navigate directly to the booking-confirmation page
      navigate('/booking-confirmation');
    }
  };

  // Functions to increment/decrement values
  const incrementDuration = () => {
    if (studio && bookingDuration < studio.max_booking_duration) {
      setBookingDuration(prev => prev + 1);
      // When duration changes, reset selected time slot since availability may change
      setSelectedTimeSlot(null);
    }
  };

  const decrementDuration = () => {
    if (bookingDuration > 1) {
      setBookingDuration(prev => prev - 1);
      // When duration changes, reset selected time slot since availability may change
      setSelectedTimeSlot(null);
    }
  };

  const incrementGuests = () => {
    if (studio && guestCount < studio.max_guests) {
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
        <div className="bg-[#111112] border border-[#292930] rounded-xl p-6">
          <h3 className="text-xl font-medium text-podcast-accent mb-4">Durée de la Session</h3>
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementDuration}
              disabled={bookingDuration <= 1}
              className="h-10 w-10 rounded-full bg-white border-gray-300"
            >
              <Minus className="h-5 w-5 text-black" />
            </Button>
            <div className="w-20 flex justify-center">
              <span className="text-3xl font-bold text-white">{bookingDuration}<span className="text-sm ml-1">h</span></span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={incrementDuration}
              disabled={studio && bookingDuration >= studio.max_booking_duration}
              className="h-10 w-10 rounded-full bg-white border-gray-300"
            >
              <Plus className="h-5 w-5 text-black" />
            </Button>
          </div>
        </div>
        
        <div className="bg-[#111112] border border-[#292930] rounded-xl p-6">
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
              disabled={studio && guestCount >= studio.max_guests}
              className="h-10 w-10 rounded-full bg-white border-gray-300"
            >
              <Plus className="h-5 w-5 text-black" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar section */}
        <div className="bg-[#111112] border border-[#292930] rounded-xl p-6">
          <h3 className="text-xl font-medium text-podcast-accent mb-4">Date</h3>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              className="bg-[#111112] text-white"
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
        <div className="bg-[#111112] border border-[#292930] rounded-xl p-6">
          <h3 className="text-xl font-medium text-podcast-accent mb-4">Horaires Disponibles</h3>
          
          {!selectedDate ? (
            <p className="text-gray-400 text-center py-8">
              Veuillez d'abord sélectionner une date
            </p>
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-podcast-accent" />
            </div>
          ) : timeSlots.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Aucun créneau disponible pour cette date et cette durée
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-2">
              {timeSlots.map((slot, index) => {
                const isSelectable = canSelectTimeSlot(index);
                const calculatedEndTime = calculateEndTime(slot.start_time, bookingDuration);
                
                return (
                  <div
                    key={`${slot.start_time}-${index}`}
                    onClick={() => isSelectable && handleTimeSlotSelect(slot, index)}
                    className={cn(
                      "py-2 px-1 rounded-lg text-center cursor-pointer transition-all text-sm",
                      selectedTimeSlot?.start_time === slot.start_time
                        ? "bg-podcast-accent text-white shadow-lg"
                        : isSelectable 
                          ? "bg-[#111112] border border-[#292930] text-white hover:bg-gray-800"
                          : "bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed"
                    )}
                  >
                    {slot.start_time}
                    {bookingDuration > 1 && isSelectable && selectedTimeSlot?.start_time === slot.start_time && (
                      <div className="text-xs mt-1">→ {calculatedEndTime}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Continue button - moved up and removed the selected time text */}
          <div className="mt-8 flex justify-center">
            <Button
              className="bg-podcast-accent text-white px-8 py-2 rounded-full disabled:opacity-50"
              disabled={!selectedTimeSlot}
              onClick={handleContinue}
            >
              Continuer
            </Button>
          </div>
        </div>
      </div>
      
      {/* Studio information - Simplified */}
      {studio && (
        <div className="mt-8 p-5 rounded-xl bg-[#111112] border border-[#292930]">
          <h3 className="text-lg font-semibold text-podcast-accent mb-2">
            {studio.name}
          </h3>
          <p className="text-gray-300">{studio.description || ''}</p>
        </div>
      )}
    </div>
  );
};

export default DateTimeSelection;
