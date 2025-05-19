
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import StudioSelection from '@/components/booking/StudioSelection';
import StepperProgress from '@/components/booking/StepperProgress';
import BookingHeader from '@/components/booking/BookingHeader';
import Footer from '@/components/Footer';
import DateTimeSelection from '@/components/booking/DateTimeSelection';
import BookingDuration from '@/components/booking/BookingDuration';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define booking steps
const STEPS = [
  { id: 'studio', label: 'Studio' },
  { id: 'datetime', label: 'Date & Time' },
  { id: 'service', label: 'Service' },
  { id: 'additional', label: 'Additional Services' },
];

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState('studio');
  const [studios, setStudios] = useState([]);
  const [studioImages, setStudioImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [duration, setDuration] = useState(1); // Default duration: 1 hour
  const [guestCount, setGuestCount] = useState(1); // Default guests: 1 person
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
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
    // Reset other selections when a new studio is selected
    setSelectedDate(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setDuration(1);
    setGuestCount(1);
    
    // Scroll to top to see the next step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDateTimeSelect = (date, startTime, endTime) => {
    setSelectedDate(date);
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
  };

  const handleNextStep = () => {
    // Move to the service step (this would be implemented in the next phase)
    setCurrentStep('service');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackStep = () => {
    if (currentStep === 'datetime') {
      setCurrentStep('studio');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDateTimeStepComplete = !!selectedDate && !!selectedStartTime && !!selectedEndTime;

  return (
    <div className="min-h-screen bg-podcast-dark pt-20">
      {/* Added BookingHeader component */}
      <BookingHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Step Progress Indicator */}
        <StepperProgress steps={STEPS} currentStep={currentStep} />
        
        <h1 className="text-4xl md:text-5xl font-bold text-center my-6">
          <span className="text-gradient">Book Your Studio</span>
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-podcast-accent" />
          </div>
        ) : (
          <>
            {currentStep === 'studio' && (
              <StudioSelection 
                studios={studios} 
                studioImages={studioImages} 
                onSelectStudio={handleStudioSelect} 
              />
            )}

            {currentStep === 'datetime' && selectedStudio && (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-6">
                  <Button 
                    onClick={handleBackStep} 
                    variant="outline"
                    className="bg-podcast-muted text-white border-gray-600 hover:bg-podcast-dark"
                  >
                    Back
                  </Button>
                  <h2 className="text-2xl font-semibold text-white">
                    {selectedStudio.name} - Select Date & Time
                  </h2>
                </div>
                
                <BookingDuration 
                  duration={duration}
                  setDuration={setDuration}
                  guestCount={guestCount}
                  setGuestCount={setGuestCount}
                  maxGuests={selectedStudio.max_guests}
                />
                
                <DateTimeSelection 
                  studioId={selectedStudio.id}
                  onSelectDateTime={handleDateTimeSelect}
                  selectedDuration={duration}
                  selectedGuests={guestCount}
                />
                
                {isDateTimeStepComplete && (
                  <div className="flex justify-center mt-8">
                    <Button 
                      onClick={handleNextStep}
                      className="px-8 py-2"
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;
