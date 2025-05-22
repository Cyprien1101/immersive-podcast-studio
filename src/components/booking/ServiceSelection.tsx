
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBooking } from '@/context/BookingContext';
import AuthDialog from './AuthDialog';
import { useAuth } from '@/context/AuthContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  price_interval: string;
  features: string[];
  missing_features?: string[];
  after_session_features?: string[];
  is_popular: boolean;
}

interface HourPackage {
  id: string;
  name: string;
  description: string;
  price_per_hour: number;
  features: string[];
  missing_features?: string[];
  after_session_features?: string[];
}

const ServiceSelection = () => {
  const navigate = useNavigate();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [hourPackages, setHourPackages] = useState<HourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{
    id: string;
    name: string;
    type: 'subscription' | 'hourPackage';
  } | null>(null);
  
  const {
    state,
    setServiceInfo
  } = useBooking();
  
  const {
    user
  } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);

        // Fetch subscription plans
        const {
          data: plansData,
          error: plansError
        } = await supabase.from('subscription_plans').select('*').order('price', {
          ascending: true
        });
        if (plansError) throw plansError;

        // Fetch hour packages
        const {
          data: packagesData,
          error: packagesError
        } = await supabase.from('hour_packages').select('*').order('price_per_hour', {
          ascending: true
        });
        if (packagesError) throw packagesError;
        
        // Enhanced plans with missing features for standard plan
        const enhancedPlansData = plansData?.map(plan => {
          if (plan.name === "Standard") {
            return {
              ...plan,
              missing_features: ["Montage", "Mixage"],
              after_session_features: [
                "Fichiers vidéo avec mix en live"
                "Accès à vos fichiers pendant 7 jours",
                "Support technique par email/téléphone"
              ]
            };
          } else {
            return {
              ...plan,
              missing_features: [],
              after_session_features: [
                "Fichiers vidéo avec mix en live"
                "Accès à vos fichiers pendant 7 jours",
                "Support technique par email/téléphone",
              ]
            };
          }
        });
        
        // Enhanced packages with missing features for basic studio time
        const enhancedPackagesData = packagesData?.map(pkg => {
          if (pkg.name === "Basic Studio Time") {
            return {
              ...pkg,
              missing_features: ["Montage", "Mixage"],
              after_session_features: [
                "Fichiers audio bruts",
                "Notes de session"
              ]
            };
          } else {
            return {
              ...pkg,
              missing_features: [],
              after_session_features: [
                "Fichiers audio bruts",
                "Notes de session",
                "Ingénieur du son dédié",
                "Édition post-production"
              ]
            };
          }
        });
        
        setSubscriptionPlans(enhancedPlansData || []);
        setHourPackages(enhancedPackagesData || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleServiceSelect = async (serviceType: 'subscription' | 'hourPackage', service: SubscriptionPlan | HourPackage) => {
    setSelectedService({
      id: service.id,
      name: service.name,
      type: serviceType
    });

    // Save the service info in context
    setServiceInfo({
      id: service.id,
      name: service.name,
      type: serviceType
    });

    // If user is already logged in, create booking directly and redirect
    if (user) {
      await createBooking(service, serviceType, user.id);
    } else {
      // Open auth dialog if not logged in
      setAuthDialogOpen(true);
    }
  };

  const createBooking = async (service: SubscriptionPlan | HourPackage, serviceType: 'subscription' | 'hourPackage', userId: string) => {
    if (state.bookingData) {
      try {
        const servicePrice = serviceType === 'subscription' ? (service as SubscriptionPlan).price : (service as HourPackage).price_per_hour;
        const {
          error
        } = await supabase.from('bookings').insert({
          user_id: userId,
          studio_id: state.bookingData.studio_id,
          date: state.bookingData.date,
          start_time: state.bookingData.start_time,
          end_time: state.bookingData.end_time,
          number_of_guests: state.bookingData.number_of_guests,
          total_price: servicePrice,
          status: 'upcoming'
        });
        if (error) throw error;

        // Redirect to the booking confirmation page
        navigate('/booking-confirmation');
      } catch (error) {
        console.error('Error saving booking:', error);
      }
    }
  };

  const handleAuthSuccess = async (userId: string) => {
    if (selectedService) {
      // Get the selected service details
      const service = selectedService.type === 'subscription' ? subscriptionPlans.find(p => p.id === selectedService.id) : hourPackages.find(p => p.id === selectedService.id);
      if (service) {
        await createBooking(service, selectedService.type, userId);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>;
  }

  return (
    <div className="py-8 px-4">
      <div className="w-full mx-auto">
        <h2 className="text-3xl font-bold text-center text-podcast-accent mb-8">
          Choisissez votre formule
        </h2>
        
        {/* Updated grid layout with more spacing between cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 w-full max-w-[1400px] mx-auto">
          {/* Left side - Subscription Plans */}
          {subscriptionPlans.map(plan => (
            <Card 
              key={plan.id} 
              className="bg-[#1a1a1a] border border-podcast-border-gray rounded-xl flex flex-col min-w-[280px]"
            >
              <CardHeader>
                <CardTitle className="text-2xl text-podcast-accent">{plan.name}</CardTitle>
                <CardDescription className="text-[#eee]">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow text-[15px]">
                <p className="text-3xl font-bold text-white mb-6">
                  {plan.price}€<span className="text-lg font-normal">/{plan.price_interval}</span>
                </p>
                
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-white mb-4">Ce qui est inclus:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#eee]">
                        <span className="mr-2 text-green-500">
                          <Check size={18} className="stroke-2" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    
                    {/* Missing features with red X */}
                    {plan.missing_features && plan.missing_features.length > 0 && plan.missing_features.map((feature, index) => (
                      <li key={`missing-${index}`} className="flex items-center text-[#eee]">
                        <span className="mr-2 text-red-500">
                          <X size={18} className="stroke-2" />
                        </span>
                        <span className="text-[#9b9b9b]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Ce que vous obtenez après la session:</h4>
                  <ul className="space-y-3">
                    {plan.after_session_features && plan.after_session_features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#eee]">
                        <span className="mr-2 text-green-500">
                          <Check size={18} className="stroke-2" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-6">
                <Button 
                  variant="default" 
                  className="w-full bg-podcast-accent hover:bg-podcast-accent/80 text-black py-6 text-lg"
                  onClick={() => handleServiceSelect('subscription', plan)}
                >
                  Choisir
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {/* Right side - Hour Packages */}
          {hourPackages.map(pkg => (
            <Card 
              key={pkg.id} 
              className="bg-[#1a1a1a] border border-podcast-border-gray rounded-xl flex flex-col min-w-[280px]"
            >
              <CardHeader>
                <CardTitle className="text-2xl text-podcast-accent">{pkg.name}</CardTitle>
                <CardDescription className="text-[#eee]">{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow text-[15px]">
                <p className="text-3xl font-bold text-white mb-6">
                  {pkg.price_per_hour}€<span className="text-lg font-normal">/heure</span>
                </p>
                
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-white mb-4">Ce qui est inclus:</h4>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#eee]">
                        <span className="mr-2 text-green-500">
                          <Check size={18} className="stroke-2" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    
                    {/* Missing features with red X */}
                    {pkg.missing_features && pkg.missing_features.length > 0 && pkg.missing_features.map((feature, index) => (
                      <li key={`missing-${index}`} className="flex items-center text-[#eee]">
                        <span className="mr-2 text-red-500">
                          <X size={18} className="stroke-2" />
                        </span>
                        <span className="text-[#9b9b9b]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Ce que vous obtenez après la session:</h4>
                  <ul className="space-y-3">
                    {pkg.after_session_features && pkg.after_session_features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#eee]">
                        <span className="mr-2 text-green-500">
                          <Check size={18} className="stroke-2" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-6">
                <Button 
                  variant="default"
                  className="w-full bg-podcast-accent hover:bg-podcast-accent/80 text-black py-6 text-lg"
                  onClick={() => handleServiceSelect('hourPackage', pkg)}
                >
                  Choisir
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {state.bookingData && (
          <div className="mt-12 p-6 bg-[#1a1a1a] border border-podcast-border-gray rounded-xl max-w-[1400px] mx-auto">
            <h3 className="text-xl font-semibold text-podcast-accent mb-3">Récapitulatif de la réservation</h3>
            <p className="text-[#eee] mb-2 border-b border-podcast-border-gray pb-4">Date: {state.bookingData.date}</p>
            <p className="text-[#eee] mb-2 border-b border-podcast-border-gray pb-4">Horaire: {state.bookingData.start_time} - {state.bookingData.end_time}</p>
            <p className="text-[#eee]">Personnes: {state.bookingData.number_of_guests}</p>
          </div>
        )}
      </div>
      
      {selectedService && !user && (
        <AuthDialog 
          isOpen={authDialogOpen} 
          onClose={() => setAuthDialogOpen(false)} 
          onAuthSuccess={handleAuthSuccess} 
          serviceName={selectedService.name} 
          serviceType={selectedService.type} 
          serviceId={selectedService.id} 
        />
      )}
    </div>
  );
};

export default ServiceSelection;
