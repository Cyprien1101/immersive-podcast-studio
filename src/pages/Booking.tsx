
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
      end_time: timeSlot.end_time, // This now comes correctly calculated from DateTimeSelection
      number_of_guests: guests,
      created_at: new Date().toISOString()
    };
    
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    
    // Removed toast notification for booking info saved
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
