import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Users, Clock, MapPin, CheckCircle, PhoneOutgoing } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import BookingHeader from '@/components/booking/BookingHeader';
import Footer from '@/components/Footer';

interface Booking {
  id: string;
  studio_id: string;
  date: string;
  start_time: string;
  end_time: string;
  number_of_guests: number;
  total_price: number;
  status: string;
  studio: {
    name: string;
    location: string;
  };
}

const BookingConfirmation = () => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarEvent, setCalendarEvent] = useState<boolean>(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchLatestBooking = async () => {
      setLoading(true);
      try {
        // Get the latest booking for the current user
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            studio:studio_id (
              name,
              location
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching booking:', error);
          return;
        }

        setBooking(data);
        
        // Check for calendar event flag in localStorage
        const hasCalendarEvent = localStorage.getItem('calendar_event_created') === 'true';
        setCalendarEvent(hasCalendarEvent);
        
        // Clean up localStorage flag
        localStorage.removeItem('calendar_event_created');
      } catch (error) {
        console.error('Error in booking confirmation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBooking();
  }, [user, navigate]);

  // Helper function to calculate booking duration in hours
  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    // Handle cases where end time is on the next day (e.g., 23:30 - 00:30)
    const totalMinutes = endMinutes >= startMinutes 
      ? endMinutes - startMinutes 
      : (24 * 60 - startMinutes) + endMinutes;
      
    return Math.round(totalMinutes / 60);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-podcast-dark flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-podcast-accent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-podcast-dark pt-20">
        <BookingHeader />
        <div className="container mx-auto px-4 py-12">
          <Card className="bg-[#111112] border border-[#292930]">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Aucune réservation trouvée</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Nous n'avons pas pu trouver votre dernière réservation.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/booking')} className="bg-podcast-accent hover:bg-podcast-accent/80 text-black">
                Créer une réservation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const formattedDate = format(parseISO(booking.date), 'dd MMMM yyyy', { locale: fr });
  const bookingDuration = calculateDuration(booking.start_time, booking.end_time);

  return (
    <div className="min-h-screen bg-podcast-dark pt-20">
      <BookingHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#111112] border border-[#292930] overflow-hidden">
            <div className="bg-gradient-to-r from-podcast-accent to-pink-500 h-2"></div>
            
            <CardHeader>
              <div className="flex items-center justify-center mb-6">
                <CheckCircle className="text-green-500 h-16 w-16" />
              </div>
              <CardTitle className="text-3xl text-center text-white">Réservation confirmée!</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Votre session au studio a été réservée avec succès.
                {calendarEvent && (
                  <span className="block mt-2 text-xs text-podcast-accent">
                    Un événement a été ajouté au calendrier de l'équipe.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-[#1a1a1c] rounded-lg p-6 space-y-4 border border-[#292930]">
                <div className="flex items-start gap-4 border-b border-[#292930] pb-4">
                  <Calendar className="h-5 w-5 text-podcast-accent shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="text-white font-medium">{formattedDate}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 border-b border-[#292930] pb-4">
                  <Clock className="h-5 w-5 text-podcast-accent shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-400">Horaire</p>
                    <p className="text-white font-medium">
                      {booking.start_time} - {booking.end_time} 
                      <span className="text-gray-400 text-sm ml-2">
                        ({bookingDuration} heure{bookingDuration > 1 ? 's' : ''})
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 border-b border-[#292930] pb-4">
                  <MapPin className="h-5 w-5 text-podcast-accent shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-400">Studio</p>
                    <p className="text-white font-medium">{booking.studio?.name}</p>
                    <p className="text-sm text-gray-400">{booking.studio?.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Users className="h-5 w-5 text-podcast-accent shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-400">Nombre de personnes</p>
                    <p className="text-white font-medium">{booking.number_of_guests}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1a1a1c] rounded-lg p-6 border border-[#292930]">
                <div className="flex items-start gap-4">
                  <PhoneOutgoing className="h-5 w-5 text-podcast-accent shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">À votre arrivée sur les lieux</p>
                    <p className="text-gray-400">Merci d'appeler le <span className="text-podcast-accent">07 66 80 50 41</span> pour que nous puissions vous accueillir.</p>
                  </div>
                </div>
              </div>
              
              {booking.total_price > 0 && (
                <div className="border-t border-[#292930] pt-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-bold">{booking.total_price} €</span>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button 
                onClick={() => navigate('/profile#bookings')} 
                className="w-full bg-podcast-accent hover:bg-podcast-accent/80 text-black"
              >
                Voir mes réservations
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="w-full border-[#292930] text-gray-200 hover:bg-gray-800 hover:text-white"
              >
                Retour à l'accueil
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookingConfirmation;
