import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Define proper type for bookings with a string literal type for status
type BookingType = {
  id: string;
  user_id: string;
  studio_id: string;
  date: string;
  start_time: string;
  end_time: string;
  number_of_guests: number;
  created_at: string;
  updated_at: string;
  total_price: number;
  status: "upcoming" | "completed" | "cancelled";
};

const UserBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [studios, setStudios] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user's bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        
        if (bookingsError) throw bookingsError;
        
        if (bookingsData) {
          // Convert the status string to the appropriate enum value
          const typedBookings = bookingsData.map(booking => {
            // Ensure status is one of the allowed values
            let typedStatus: "upcoming" | "completed" | "cancelled" = "upcoming"; // Default
            
            // Map the string status to our enum
            if (booking.status === "completed") typedStatus = "completed";
            else if (booking.status === "cancelled") typedStatus = "cancelled";
            
            return {
              ...booking,
              status: typedStatus
            } as BookingType;
          });
          
          setBookings(typedBookings);
          
          // Get unique studio IDs
          const studioIds = [...new Set(bookingsData.map(booking => booking.studio_id))];
          
          // Fetch studio details for all studios
          if (studioIds.length > 0) {
            const { data: studiosData } = await supabase
              .from('studios')
              .select('id, name, location')
              .in('id', studioIds);
            
            // Create a lookup map for studio details
            const studioMap: Record<string, any> = {};
            studiosData?.forEach(studio => {
              studioMap[studio.id] = studio;
            });
            
            setStudios(studioMap);
          }
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user]);

  // Calculate booking duration in hours
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

  // Function to get the status badge color
  const getStatusColor = (status: BookingType['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-500 hover:bg-green-600';
      case 'completed':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Function to translate status
  const translateStatus = (status: BookingType['status']) => {
    switch (status) {
      case 'upcoming':
        return 'À venir';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Alert>
        <AlertTitle>Aucune réservation</AlertTitle>
        <AlertDescription>
          Vous n'avez pas encore de réservation. Réservez un studio pour commencer.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Mes réservations</h2>
      
      {bookings.map((booking) => {
        const studio = studios[booking.studio_id] || { name: 'Studio inconnu', location: '?' };
        const bookingDate = parseISO(booking.date);
        const duration = calculateDuration(booking.start_time, booking.end_time);
        
        return (
          <Card key={booking.id} className="bg-[#111112] border border-[#292930]">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">
                    {studio.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {studio.location} • {format(bookingDate, 'EEEE dd MMMM yyyy', { locale: fr })}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(booking.status)}`}>
                  {translateStatus(booking.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Horaires</p>
                  <p className="text-white font-medium">
                    {booking.start_time} - {booking.end_time}
                    <span className="text-gray-400 text-sm ml-2">
                      ({duration} heure{duration > 1 ? 's' : ''})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Personnes</p>
                  <p className="text-white font-medium">{booking.number_of_guests}</p>
                </div>
                <div>
                  <p className="text-gray-400">Prix total</p>
                  <p className="text-white font-medium">{booking.total_price}€</p>
                </div>
                <div>
                  <p className="text-gray-400">Réservé le</p>
                  <p className="text-white font-medium">
                    {format(parseISO(booking.created_at), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default UserBookings;
