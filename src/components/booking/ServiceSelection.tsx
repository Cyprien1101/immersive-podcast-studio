
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useBooking } from '@/context/BookingContext';

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
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [hourPackages, setHourPackages] = useState<HourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const { state } = useBooking();
  
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Fetch subscription plans
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });
          
        if (plansError) throw plansError;
        
        // Fetch hour packages
        const { data: packagesData, error: packagesError } = await supabase
          .from('hour_packages')
          .select('*')
          .order('price_per_hour', { ascending: true });
          
        if (packagesError) throw packagesError;
        
        setSubscriptionPlans(plansData || []);
        setHourPackages(packagesData || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error("Erreur lors du chargement des services");
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);
  
  const handleSelectSubscription = (plan: SubscriptionPlan) => {
    toast.info(`Abonnement "${plan.name}" sélectionné. Cette fonctionnalité sera disponible prochainement.`);
    // In the future, this will save the selection and move to the next step
  };
  
  const handleSelectHourPackage = (pkg: HourPackage) => {
    toast.info(`Forfait "${pkg.name}" sélectionné. Cette fonctionnalité sera disponible prochainement.`);
    // In the future, this will save the selection and move to the next step
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }
  
  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-podcast-accent mb-8">
          Choisissez votre formule
        </h2>
        
        {state.bookingData && (
          <div className="mb-8 p-6 bg-black border border-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold text-podcast-accent mb-3">Récapitulatif de la réservation</h3>
            <p className="text-gray-300 mb-2">Studio: {state.bookingData.studio_id}</p>
            <p className="text-gray-300 mb-2">Date: {state.bookingData.date}</p>
            <p className="text-gray-300 mb-2">Horaire: {state.bookingData.start_time} - {state.bookingData.end_time}</p>
            <p className="text-gray-300 mb-2">Personnes: {state.bookingData.number_of_guests}</p>
          </div>
        )}
        
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-center text-white mb-6">Abonnements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className={`bg-black border-gray-700 ${plan.is_popular ? 'ring-2 ring-podcast-accent' : ''}`}>
                <CardHeader>
                  {plan.is_popular && (
                    <div className="absolute top-0 right-0 bg-podcast-accent text-black px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                      Populaire
                    </div>
                  )}
                  <CardTitle className="text-podcast-accent">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white mb-4">
                    {plan.price}€<span className="text-sm font-normal">/{plan.price_interval}</span>
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-300">
                        <span className="mr-2 text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="default" 
                    className="w-full bg-podcast-accent hover:bg-podcast-accent/80 text-black"
                    onClick={() => handleSelectSubscription(plan)}
                  >
                    Choisir
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold text-center text-white mb-6">Forfaits à l'heure</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hourPackages.map((pkg) => (
              <Card key={pkg.id} className="bg-black border-gray-700">
                <CardHeader>
                  <CardTitle className="text-podcast-accent">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white mb-4">
                    {pkg.price_per_hour}€<span className="text-sm font-normal">/heure</span>
                  </p>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-300">
                        <span className="mr-2 text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="default" 
                    className="w-full bg-podcast-accent hover:bg-podcast-accent/80 text-black"
                    onClick={() => handleSelectHourPackage(pkg)}
                  >
                    Choisir
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;
