
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBooking } from '@/context/BookingContext';
import AuthDialog from './AuthDialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  price_interval: string;
  features: string[];
  missing_features?: string[];
  after_session_features?: string[];
  after_session_missing_features?: string[];
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
  after_session_missing_features?: string[];
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
        
        // Mise à jour des abonnements avec les nouvelles fonctionnalités et noms
        const enhancedPlansData = plansData?.map(plan => {
          if (plan.name === "Abonnement Standard") {
            return {
              ...plan,
              features: [
                "1h de studio par jour",
                "Tout l'équipement inclus",
                "Opérateur sur place",
                "Tournage libre (Podcast, Youtube...)"
              ],
              missing_features: [
                "Montage",
                "Mixage"
              ],
              after_session_features: [
                "Fichier vidéo avec Mix live (changement de plans) et audio",
                "Accès aux fichiers pendant 7 jours"
              ],
              after_session_missing_features: [
                "Intro teaser percutante",
                "Épisode monté et mixé",
                "5 shorts/reels sous-titrés",
                "2 révisions incluses"
              ]
            };
          } else {
            return {
              ...plan,
              features: [
                "1h de studio par jour",
                "Tout l'équipement inclus",
                "Opérateur sur place",
                "Tournage libre (Podcast, Youtube...)",
                "Montage et mixage de chaque session"
              ],
              missing_features: [],
              after_session_features: [
                "Fichier vidéo avec Mix live (changement de plans) et audio",
                "Intro teaser percutante",
                "Épisode monté et mixé",
                "Accès aux fichiers pendant 7 jours",
                "5 shorts/reels sous-titrés",
                "2 révisions incluses"
              ],
              after_session_missing_features: []
            };
          }
        });
        
        // Mise à jour des forfaits horaires avec les nouveaux noms et fonctionnalités
        const enhancedPackagesData = packagesData?.map(pkg => {
          if (pkg.name === "1h Standard") {
            return {
              ...pkg,
              features: [
                "Tout l'équipement inclus",
                "Opérateur sur place",
                "Tournage libre (Podcast, Youtube...)"
              ],
              missing_features: [
                "Montage",
                "Mixage"
              ],
              after_session_features: [
                "Fichier vidéo avec Mix live (changement de plans) et audio",
                "Accès aux fichiers pendant 7 jours"
              ],
              after_session_missing_features: [
                "Intro teaser percutante",
                "Épisode monté et mixé",
                "5 shorts/reels sous-titrés",
                "2 révisions incluses"
              ]
            };
          } else {
            return {
              ...pkg,
              features: [
                "Tout l'équipement inclus",
                "Opérateur sur place",
                "Tournage libre (Podcast, Youtube...)",
                "Montage et mixage de chaque session"
              ],
              missing_features: [],
              after_session_features: [
                "Fichier vidéo avec Mix live (changement de plans) et audio",
                "Intro teaser percutante",
                "Épisode monté et mixé",
                "Accès aux fichiers pendant 7 jours",
                "5 shorts/reels sous-titrés",
                "2 révisions incluses"
              ],
              after_session_missing_features: []
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

  const updateAvailabilitySlots = async (studioId: string, date: string, startTime: string, endTime: string) => {
    try {
      // Convert times to hours and minutes
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      // Calculate total minutes for start and end times
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      // Generate an array of 30-minute time slots between start and end time
      const timeSlots = [];
      for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += 30) {
        const slotHour = Math.floor(minutes / 60);
        const slotMinute = minutes % 60;
        
        const formattedHour = slotHour < 10 ? `0${slotHour}` : `${slotHour}`;
        const formattedMinute = slotMinute < 10 ? `0${slotMinute}` : `${slotMinute}`;
        const startSlotTime = `${formattedHour}:${formattedMinute}`;
        
        const endMinutes = minutes + 30;
        const endSlotHour = Math.floor(endMinutes / 60);
        const endSlotMinute = endMinutes % 60;
        
        const formattedEndHour = endSlotHour < 10 ? `0${endSlotHour}` : `${endSlotHour}`;
        const formattedEndMinute = endSlotMinute < 10 ? `0${endSlotMinute}` : `${endSlotMinute}`;
        const endSlotTime = `${formattedEndHour}:${formattedEndMinute}`;
        
        timeSlots.push({ startTime: startSlotTime, endTime: endSlotTime });
      }
      
      // Update each time slot in the database
      for (const slot of timeSlots) {
        // Check if the slot exists and update it
        const { data, error } = await supabase
          .from('studio_availability')
          .select('id')
          .eq('studio_id', studioId)
          .eq('date', date)
          .eq('start_time', slot.startTime)
          .eq('end_time', slot.endTime)
          .maybeSingle();
          
        if (error) {
          console.error('Error checking studio availability:', error);
          continue;
        }
        
        if (data) {
          // Update existing slot
          const { error: updateError } = await supabase
            .from('studio_availability')
            .update({ is_available: false })
            .eq('id', data.id);
            
          if (updateError) {
            console.error('Error updating availability slot:', updateError);
          }
        } else {
          // Create new slot if it doesn't exist
          const { error: insertError } = await supabase
            .from('studio_availability')
            .insert({
              studio_id: studioId,
              date: date,
              start_time: slot.startTime,
              end_time: slot.endTime,
              is_available: false
            });
            
          if (insertError) {
            console.error('Error creating availability slot:', insertError);
          }
        }
      }
      
      console.log('All availability slots updated successfully');
    } catch (error) {
      console.error('Error updating availability slots:', error);
    }
  };

  const createBooking = async (service: SubscriptionPlan | HourPackage, serviceType: 'subscription' | 'hourPackage', userId: string) => {
    if (state.bookingData) {
      try {
        const servicePrice = serviceType === 'subscription' ? (service as SubscriptionPlan).price : (service as HourPackage).price_per_hour;
        
        // Create the booking
        const {
          data: bookingData,
          error: bookingError
        } = await supabase.from('bookings').insert({
          user_id: userId,
          studio_id: state.bookingData.studio_id,
          date: state.bookingData.date,
          start_time: state.bookingData.start_time,
          end_time: state.bookingData.end_time,
          number_of_guests: state.bookingData.number_of_guests,
          total_price: servicePrice,
          status: 'upcoming'
        }).select('*, studio:studio_id (name, location)').single();
        
        if (bookingError) throw bookingError;

        // If the service type is a subscription, also create a subscription record
        if (serviceType === 'subscription') {
          const subscriptionPlan = service as SubscriptionPlan;
          const {
            error: subscriptionError
          } = await supabase.from('subscriptions').insert({
            user_id: userId,
            plan_id: subscriptionPlan.id,
            plan_name: subscriptionPlan.name,
            price: subscriptionPlan.price,
            price_interval: subscriptionPlan.price_interval,
            status: 'active',
            // By default, start_date is set to now() in the database
          });
          
          if (subscriptionError) {
            console.error('Error creating subscription:', subscriptionError);
            toast.error("Réservation créée mais l'abonnement n'a pas pu être enregistré.");
          } else {
            toast.success("Abonnement créé avec succès !");
          }
        }

        // Update studio availability slots
        await updateAvailabilitySlots(
          state.bookingData.studio_id,
          state.bookingData.date,
          state.bookingData.start_time,
          state.bookingData.end_time
        );

        // Redirect to the booking confirmation page
        navigate('/booking-confirmation');
      } catch (error) {
        console.error('Error saving booking:', error);
        toast.error("Une erreur s'est produite lors de la création de votre réservation.");
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
                <p className="text-3xl font-bold text-white mb-4">
                  {plan.price}€<span className="text-lg font-normal">/{plan.price_interval === 'month' ? 'mois' : plan.price_interval}</span>
                </p>
                
                {/* Button moved below price with separator lines */}
                <div className="my-4">
                  <div className="border-t border-gray-700 my-3"></div>
                  <Button 
                    variant="default" 
                    className="w-full bg-podcast-accent hover:bg-podcast-accent/80 text-black py-6 text-lg"
                    onClick={() => handleServiceSelect('subscription', plan)}
                  >
                    Choisir
                  </Button>
                  <div className="border-b border-gray-700 my-3"></div>
                </div>
                
                <div className="mb-6">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#eee]">
                        <span className="mr-2 text-green-500">
                          <Check size={16} className="stroke-2" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    
                    {/* Missing features with red X */}
                    {plan.missing_features && plan.missing_features.length > 0 && plan.missing_features.map((feature, index) => (
                      <li key={`missing-${index}`} className="flex items-center text-[#eee]">
                        <span className="mr-2 text-red-500">
                          <X size={16} className="stroke-2" />
                        </span>
                        <span className="text-[#9b9b9b]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">Après la session:</h4>
                  <ul className="space-y-2">
                    {plan.after_session_features && plan.after_session_features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#eee]">
                        <span className="mr-2 text-green-500">
                          <Check size={16} className="stroke-2" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    
                    {/* Missing after-session features with red X */}
                    {plan.after_session_missing_features && plan.after_session_missing_features.length > 0 && 
                      plan.after_session_missing_features.map((feature, index) => (
                        <li key={`after-missing-${index}`} className="flex items-center text-[#eee]">
                          <span className="mr-2 text-red-500">
                            <X size={16} className="stroke-2" />
                          </span>
                          <span className="text-[#9b9b9b]">{feature}</span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </CardContent>
              {/* Removed button from footer */}
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
                <p className="text-3xl font-bold text-white mb-4">
                  {pkg.price_per_hour}€<span className="text-lg font-normal">/heure</span>
                </p>
                
                {/* Button moved below price with separator lines */}
                <div className="my-4">
                  <div className="border-t border-gray-700 my-3"></div>
                  <Button 
                    variant="default"
                    className="w-full bg-podcast-accent hover:bg-podcast-accent/80 text-black py-6 text-lg"
                    onClick={() => handleServiceSelect('hourPackage', pkg)}
                  >
                    Choisir
                  </Button>
                  <div className="border-b border-gray-700 my-3"></div>
                </div>
                
                <div className="mb-6">
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#eee]">
                        <span className="mr-2 text-green-500">
                          <Check size={16} className="stroke-2" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    
                    {/* Missing features with red X */}
                    {pkg.missing_features && pkg.missing_features.length > 0 && pkg.missing_features.map((feature, index) => (
                      <li key={`missing-${index}`} className="flex items-center text-[#eee]">
                        <span className="mr-2 text-red-500">
                          <X size={16} className="stroke-2" />
                        </span>
                        <span className="text-[#9b9b9b]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">Après la session:</h4>
                  <ul className="space-y-2">
                    {pkg.after_session_features && pkg.after_session_features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#eee]">
                        <span className="mr-2 text-green-500">
                          <Check size={16} className="stroke-2" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    
                    {/* Missing after-session features with red X */}
                    {pkg.after_session_missing_features && pkg.after_session_missing_features.length > 0 && 
                      pkg.after_session_missing_features.map((feature, index) => (
                        <li key={`after-missing-${index}`} className="flex items-center text-[#eee]">
                          <span className="mr-2 text-red-500">
                            <X size={16} className="stroke-2" />
                          </span>
                          <span className="text-[#9b9b9b]">{feature}</span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </CardContent>
              {/* Removed button from footer */}
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
