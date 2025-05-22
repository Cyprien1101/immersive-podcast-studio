
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import StudioSelection from '@/components/booking/StudioSelection';
import StepperProgress from '@/components/booking/StepperProgress';
import BookingHeader from '@/components/booking/BookingHeader';
import Footer from '@/components/Footer';
import { Loader2, Calendar } from 'lucide-react';
import DateTimeSelection from '@/components/booking/DateTimeSelection';

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

  const handleDateTimeSelect = (date, timeSlot) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    setCurrentStep('service');
    // Scroll to top when moving to next step
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <p className="text-white">Cette étape sera disponible prochainement !</p>
            {selectedDate && selectedTimeSlot && (
              <div className="mt-4 p-4 bg-podcast-dark-accent rounded-lg">
                <p className="text-gray-300">Date sélectionnée: {selectedDate?.toLocaleDateString()}</p>
                <p className="text-gray-300">Créneau sélectionné: {selectedTimeSlot?.start_time} - {selectedTimeSlot?.end_time}</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
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
  );
};

export default BookingPage;
