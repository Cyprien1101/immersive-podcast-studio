import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
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
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

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
        setTimeSlots(data || []);
        
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
      setTimeSlots([]);
    }
  }, [date, studio]);

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

  return (
    <div className="py-8">
      <h2 className="text-2xl font-semibold text-center text-white mb-8">
        <CalendarIcon className="inline-block mr-2 mb-1" /> Sélectionnez une Date et une Heure
      </h2>
      
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
          ) : timeSlots.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Aucun créneau disponible pour cette date
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-2">
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => handleTimeSlotSelect(slot)}
                  className={cn(
                    "py-2 px-3 rounded-xl text-center cursor-pointer transition-all text-sm whitespace-nowrap",
                    slot.is_available 
                      ? selectedTimeSlot?.id === slot.id
                        ? "bg-podcast-accent text-white shadow-lg"
                        : "bg-gray-800 text-white hover:bg-gray-700" 
                      : "bg-gray-900 text-gray-500 cursor-not-allowed opacity-60"
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
            <span className="mr-4">Max {studio.max_guests} personnes</span>
            <span>Durée max: {studio.max_booking_duration}h</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeSelection;
