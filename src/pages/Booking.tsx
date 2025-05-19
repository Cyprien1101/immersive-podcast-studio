
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import StudioSelection from '@/components/booking/StudioSelection';
import DateTimeSelection from '@/components/booking/DateTimeSelection';
import StepperProgress from '@/components/booking/StepperProgress';
import BookingHeader from '@/components/booking/BookingHeader';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';

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
  const [bookingDetails, setBookingDetails] = useState({
    date: null,
    startTime: null,
    duration: 1,
    guests: 1
  });
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
    // Scroll to top when moving to next step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDateTimeSelect = (details) => {
    setBookingDetails({
      ...bookingDetails,
      date: details.date,
      startTime: details.startTime,
      duration: details.duration,
      guests: details.guests
    });
    
    // Move to the next step
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
            onProceed={handleDateTimeSelect}
          />
        );
      case 'service':
        // This would be the next step implementation
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-podcast-accent mb-4">Service Selection</h2>
            <p className="text-white">This step is coming soon!</p>
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
            {renderCurrentStep()}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;
