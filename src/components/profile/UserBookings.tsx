
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface BookingType {
  id: string;
  created_at: string;
  date: string;
  start_time: string;
  end_time: string;
  studio_id: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  total_price: number;
  number_of_guests: number;
}

interface UserBookingsProps {
  userId: string;
}

const UserBookings = ({ userId }: UserBookingsProps) => {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [userId]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'upcoming':
        return <Badge className="bg-green-500 hover:bg-green-600">À venir</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Terminée</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement de vos réservations...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-800 rounded-xl p-10">
        <h3 className="text-xl font-medium text-white mb-2">Aucune réservation</h3>
        <p className="text-gray-400">
          Vous n'avez pas encore effectué de réservation. 
          <br />
          Réservez dès maintenant votre session de studio !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">Historique des réservations</h3>
      
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <Table>
          <TableCaption>Liste de vos réservations</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-800 hover:bg-gray-800">
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Horaire</TableHead>
              <TableHead className="text-white">Invités</TableHead>
              <TableHead className="text-white">Prix</TableHead>
              <TableHead className="text-white">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id} className="bg-gray-900 hover:bg-gray-800 border-b border-gray-800">
                <TableCell className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-podcast-accent" />
                  {format(new Date(booking.date), 'dd MMMM yyyy', { locale: fr })}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-podcast-accent" />
                  {booking.start_time} - {booking.end_time}
                </TableCell>
                <TableCell>{booking.number_of_guests}</TableCell>
                <TableCell>{booking.total_price}€</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-gray-400 text-sm">
          Pour toute modification ou annulation de réservation, veuillez nous contacter au 07 66 80 50 41 
          au moins 48h à l'avance.
        </p>
      </div>
    </div>
  );
};

export default UserBookings;
