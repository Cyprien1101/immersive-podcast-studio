
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import StudioSelection from '@/components/booking/StudioSelection';
import StepperProgress from '@/components/booking/StepperProgress';
import BookingHeader from '@/components/booking/BookingHeader';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import DateTimeSelection from '@/components/booking/DateTimeSelection';
import ServiceSelection from '@/components/booking/ServiceSelection';
import { BookingProvider } from '@/context/BookingContext';

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
        
        setStudios(studioData || []);
        setStudioImages(imageData || []);
        
        // Set the Studio Lyon as selected by default using the fixed studio ID
        // Based on the DateTimeSelection component, we know the studio ID is "d9c24a0a-d94a-4cbc-b489-fa5cfe73ce08"
        const lyonStudioId = "d9c24a0a-d94a-4cbc-b489-fa5cfe73ce08";
        const lyonStudio = studioData?.find(studio => studio.id === lyonStudioId);
        
        if (lyonStudio) {
          console.log("Found Studio Lyon by ID:", lyonStudio);
          setSelectedStudio(lyonStudio);
          // Skip the studio selection step and go directly to datetime
          setCurrentStep('datetime');
        } else {
          console.log("Studio Lyon not found with ID:", lyonStudioId);
          console.log("Available studios:", studioData);
          // If Studio Lyon is not found, stay on studio selection
          setCurrentStep('studio');
        }
      } catch (error) {
        console.error('Error fetching studios:', error);
        // If there's an error, stay on studio selection
        setCurrentStep('studio');
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

  // Fonction qui garantit que la date est correctement formatée sans décalage de timezone
  const formatDateToISOString = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleDateTimeSelect = (date, timeSlot, duration, guests) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    setBookingDuration(duration);
    setGuestCount(guests);
    
    // Formatage de la date en utilisant la méthode fiable sans décalage de timezone
    const formattedDate = formatDateToISOString(date);
    console.log("Date sélectionnée (handleDateTimeSelect):", formattedDate, "Date brute:", date);
    
    // Store the booking data in localStorage for persistence
    const bookingData = {
      studio_id: selectedStudio.id,
      date: formattedDate,
      start_time: timeSlot.start_time,
      end_time: timeSlot.end_time,
      number_of_guests: guests,
      duration: duration, // Add duration to booking data
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    
    setCurrentStep('service');
    
    // Scroll to top when moving to next step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // New handler for stepper navigation
  const handleStepClick = (stepId) => {
    // Only allow going back to previous steps
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    const targetIndex = STEPS.findIndex(step => step.id === stepId);
    
    if (targetIndex <= currentIndex) {
      setCurrentStep(stepId);
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        return <ServiceSelection />;
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
          {/* Step Progress Indicator - now with click handler */}
          <StepperProgress 
            steps={STEPS} 
            currentStep={currentStep} 
            onStepClick={handleStepClick}
          />
          
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
