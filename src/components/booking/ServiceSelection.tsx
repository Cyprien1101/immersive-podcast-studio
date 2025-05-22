import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';
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
  is_popular: boolean;
}

interface HourPackage {
  id: string;
  name: string;
  description: string;
  price_per_hour: number;
  features: string[];
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
        setSubscriptionPlans(plansData || []);
        setHourPackages(packagesData || []);
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
  return <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-podcast-accent mb-8">
          Choisissez votre formule
        </h2>
        
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-center text-white mb-6">Abonnements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center mx-auto">
            {subscriptionPlans.map(plan => (
              <Card 
                key={plan.id} 
                className={`booking-card relative h-full flex flex-col ${plan.is_popular ? 'ring-2 ring-podcast-accent' : ''}`}
              >
                {plan.is_popular && (
                  <div className="absolute top-0 right-0 left-0 bg-podcast-accent text-black px-3 py-1 text-sm font-semibold text-center rounded-t-lg">
                    Populaire
                  </div>
                )}
                <CardHeader className={plan.is_popular ? 'pt-8' : ''}>
                  <CardTitle className="text-podcast-accent">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-300">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-2xl font-bold text-white mb-4">
                    {plan.price}€<span className="text-sm font-normal">/{plan.price_interval}</span>
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-green-500">
                        <span className="mr-2">✓</span>
                        <span className="text-green-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto pt-4">
                  <Button 
                    variant="default" 
                    className="w-full bg-podcast-accent hover:bg-podcast-accent/80 text-black" 
                    onClick={() => handleServiceSelect('subscription', plan)}
                  >
                    Choisir
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-center text-white mb-6">Forfaits à l'heure</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center mx-auto">
            {hourPackages.map(pkg => (
              <Card key={pkg.id} className="booking-card h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-podcast-accent">{pkg.name}</CardTitle>
                  <CardDescription className="text-slate-300">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-2xl font-bold text-white mb-4">
                    {pkg.price_per_hour}€<span className="text-sm font-normal">/heure</span>
                  </p>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-green-500">
                        <span className="mr-2">✓</span>
                        <span className="text-green-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto pt-4">
                  <Button 
                    variant="default" 
                    className="w-full bg-podcast-accent hover:bg-podcast-accent/80 text-black" 
                    onClick={() => handleServiceSelect('hourPackage', pkg)}
                  >
                    Choisir
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        {state.bookingData && (
          <div className="mt-12 p-6 booking-card">
            <h3 className="text-xl font-semibold text-podcast-accent mb-3">Récapitulatif de la réservation</h3>
            <p className="text-gray-300 mb-2 booking-section">Date: {state.bookingData.date}</p>
            <p className="text-gray-300 mb-2 booking-section">Horaire: {state.bookingData.start_time} - {state.bookingData.end_time}</p>
            <p className="text-gray-300">Personnes: {state.bookingData.number_of_guests}</p>
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
    </div>;
};

export default ServiceSelection;
