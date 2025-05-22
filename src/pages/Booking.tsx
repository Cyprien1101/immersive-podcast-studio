
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import StudioSelection from '@/components/booking/StudioSelection';
import StepperProgress from '@/components/booking/StepperProgress';
import BookingHeader from '@/components/booking/BookingHeader';
import Footer from '@/components/Footer';
import { Loader2, Calendar } from 'lucide-react';
import DateTimeSelection from '@/components/booking/DateTimeSelection';
import { BookingProvider } from '@/context/BookingContext';
import { toast } from 'sonner';

// Define booking steps with the datetime step
const STEPS = [
  { id: 'studio', label: 'Studio' },
  { id: 'datetime', label: 'Date & Heure' },
  { id: 'service', label: 'Service' },
  { id: 'additional', label: 'Services Additionnels' },
];

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState('studio');
  const [studios, setStudios] = useState([]);
  const [studioImages, setStudioImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [bookingDuration, setBookingDuration] = useState(1);
  const [guestCount, setGuestCount] = useState(1);
  const navigate = useNavigate();

  // Fetch studios and their images from Supabase
  useEffect(() => {
    const fetchStudios = async () => {
      try {
        setLoading(true);
        
        // Fetch studios
        const { data: studioData, error: studioError } = await supabase
          .from('studios')
          .select('*');
        
        if (studioError) throw studioError;
        
        // Fetch studio images
        const { data: imageData, error: imageError } = await supabase
          .from('studio_images')
          .select('*');
        
        if (imageError) throw imageError;
        
        // Set the Studio Lyon as selected by default
        const lyonStudio = studioData?.find(studio => studio.name === 'Studio Lyon');
        if (lyonStudio) {
          console.log("Found Studio Lyon:", lyonStudio);
          setSelectedStudio(lyonStudio);
          // Skip the studio selection step
          setCurrentStep('datetime');
        } else {
          console.log("Studio Lyon not found in:", studioData);
        }
        
        setStudios(studioData || []);
        setStudioImages(imageData || []);
      } catch (error) {
        console.error('Error fetching studios:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudios();
    
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleStudioSelect = (studio) => {
    setSelectedStudio(studio);
    setCurrentStep('datetime');
    // Scroll to top when moving to next step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDateTimeSelect = (date, timeSlot, duration, guests) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    setBookingDuration(duration);
    setGuestCount(guests);
    
    // Store the booking data in localStorage for persistence
    const bookingData = {
      studio_id: selectedStudio.id,
      date: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
      start_time: timeSlot.start_time,
      end_time: calculateEndTime(timeSlot.start_time, duration),
      number_of_guests: guests,
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    
    toast.success("Informations de réservation enregistrées");
    setCurrentStep('service');
    
    // Scroll to top when moving to next step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Helper function to calculate end time based on start time and duration
  const calculateEndTime = (startTime, durationInHours) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationInHours * 60;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'studio':
        return (
          <StudioSelection 
            studios={studios} 
            studioImages={studioImages} 
            onSelectStudio={handleStudioSelect} 
          />
        );
      case 'datetime':
        return (
          <DateTimeSelection 
            studio={selectedStudio}
            onDateTimeSelect={handleDateTimeSelect}
          />
        );
      case 'service':
        // This would be the next step implementation
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-podcast-accent mb-4">Sélection du Service</h2>
            <p className="text-white mb-4">Cette étape sera disponible prochainement !</p>
            {selectedDate && selectedTimeSlot && (
              <div className="mt-4 p-6 bg-black border border-gray-800 rounded-lg max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-podcast-accent mb-3">Récapitulatif de la réservation</h3>
                <p className="text-gray-300 mb-2">Studio: {selectedStudio?.name}</p>
                <p className="text-gray-300 mb-2">Date: {selectedDate?.toLocaleDateString('fr-FR')}</p>
                <p className="text-gray-300 mb-2">Horaire: {selectedTimeSlot?.start_time} - {calculateEndTime(selectedTimeSlot?.start_time, bookingDuration)}</p>
                <p className="text-gray-300 mb-2">Durée: {bookingDuration}h</p>
                <p className="text-gray-300 mb-2">Personnes: {guestCount}</p>
                <p className="text-gray-300 mt-4 text-sm">Les informations de réservation sont enregistrées localement. Elles seront envoyées à la base de données lorsque vous créerez un compte.</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <BookingProvider>
      <div className="min-h-screen bg-podcast-dark pt-20">
        {/* Added BookingHeader component */}
        <BookingHeader />
        
        <div className="container mx-auto px-4 py-8 relative">
          {/* Step Progress Indicator */}
          <StepperProgress steps={STEPS} currentStep={currentStep} />
          
          <h1 className="text-4xl md:text-5xl font-bold text-center my-6 text-white">
            Réservez Votre Studio
          </h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
          ) : (
            <>
              {renderCurrentStep()}
            </>
          )}
        </div>
        <Footer />
      </div>
    </BookingProvider>
  );
};

export default BookingPage;
