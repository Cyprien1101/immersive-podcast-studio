import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useBooking } from '@/context/BookingContext';
import { Slider } from "@/components/ui/slider";

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
  
  useEffect(() => {
    if (selectedDate && studio) {
      fetchTimeSlots();
    }
  }, [selectedDate, studio]);
  
  const fetchTimeSlots = async () => {
    if (!selectedDate || !studio) return;
    
    setLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
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
      // Removed toast notification
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };
  
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };
  
  const handleContinue = () => {
    if (selectedDate && selectedTimeSlot) {
      // Set the date and time info in the booking context
      setDateTimeInfo({
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        duration: bookingDuration,
        guests: guestCount
      });
      
      // Call the onDateTimeSelect callback
      onDateTimeSelect(
        selectedDate,
        selectedTimeSlot,
        bookingDuration,
        guestCount
      );
    }
  };
  
  // Disable dates before today
  const disabledDates = {
    before: new Date(),
    after: addDays(new Date(), 30), // Only allow bookings 30 days in advance
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
              selected={selectedDate}
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
              {timeSlots.map((slot) => (
                <div
                  key={slot.start_time}
                  onClick={() => handleTimeSlotSelect(slot)}
                  className={cn(
                    "py-2 px-1 rounded-lg text-center cursor-pointer transition-all text-sm",
                    selectedTimeSlot?.start_time === slot.start_time
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
              onClick={handleContinue}
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
