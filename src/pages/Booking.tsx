
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
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';

// Define booking steps with the datetime step
const STEPS = [
  { id: 'studio', label: 'Studio' },
  { id: 'datetime', label: 'Date & Heure' },
  { id: 'service', label: 'Service' },
  { id: 'additional', label: 'Services Additionnels' },
];

const Booking = () => {
  const [currentStep, setCurrentStep] = useState('studio');
  const [studios, setStudios] = useState([]);
  const [studioImages, setStudioImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const navigate = useNavigate();
  const { setStudioInfo } = useBooking();
  const { user } = useAuth();

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
        
        // Set the Studio Lyon as selected by default (using the specific studio ID)
        const lyonStudio = studioData?.find(studio => studio.id === "d9c24a0a-d94a-4cbc-b489-fa5cfe73ce08");
        if (lyonStudio) {
          console.log("Found Studio Lyon:", lyonStudio);
          setSelectedStudio(lyonStudio);
          setStudioInfo({ studio_id: lyonStudio.id });
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
    setStudioInfo({ studio_id: studio.id });
    setCurrentStep('datetime');
    // Scroll to top when moving to next step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction qui garantit que la date est correctement formatée sans décalage de timezone
  const formatDateToISOString = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleDateTimeSelect = (date, timeSlot, duration, guests) => {
    // Formatage de la date en utilisant la méthode fiable sans décalage de timezone
    const formattedDate = formatDateToISOString(date);
    console.log("Date sélectionnée (handleDateTimeSelect):", formattedDate, "Date brute:", date);
    
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (!user) {
      // Modifié pour utiliser le composant AuthModal plutôt que showAuthDialog
      navigate('/login');
      return;
    }
    
    // Passer à l'étape suivante
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
  );
};

export default Booking;
