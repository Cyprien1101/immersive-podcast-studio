
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Phone, Check } from 'lucide-react';
import Footer from '@/components/Footer';
import { useBooking } from '@/context/BookingContext';

const BookingConfirmation = () => {
  const { state } = useBooking();
  const navigate = useNavigate();
  
  // Rediriger vers la page de réservation si aucune réservation n'est en cours
  useEffect(() => {
    if (!state.bookingData || !state.isComplete) {
      navigate('/booking');
    }
  }, [state.bookingData, state.isComplete, navigate]);

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (!state.bookingData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-podcast-dark pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-black rounded-2xl border border-gray-800 p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="rounded-full bg-green-500/20 p-3">
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-podcast-accent mb-6">
            Réservation Confirmée !
          </h1>
          
          <div className="space-y-6">
            <div className="p-4 bg-gray-900 rounded-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Récapitulatif</h2>
              
              <div className="space-y-4">
                {state.selectedService && (
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <Check className="h-5 w-5 text-podcast-accent" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Formule sélectionnée</p>
                      <p className="text-gray-400">{state.selectedService.name}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <Calendar className="h-5 w-5 text-podcast-accent" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Date</p>
                    <p className="text-gray-400">{formatDate(state.bookingData.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <Clock className="h-5 w-5 text-podcast-accent" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Horaire</p>
                    <p className="text-gray-400">
                      {state.bookingData.start_time} - {state.bookingData.end_time}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    <Users className="h-5 w-5 text-podcast-accent" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Nombre de personnes</p>
                    <p className="text-gray-400">{state.bookingData.number_of_guests}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900 rounded-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Adresse du studio</h2>
              
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <MapPin className="h-5 w-5 text-podcast-accent" />
                </div>
                <div>
                  <p className="text-white font-medium">Studio Lyon</p>
                  <p className="text-gray-400">280 Rue Vendôme, Lyon</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900 rounded-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Instructions d'arrivée</h2>
              
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Phone className="h-5 w-5 text-podcast-accent" />
                </div>
                <div>
                  <p className="text-white">Merci d'appeler le <span className="text-podcast-accent font-semibold">07 66 80 50 41</span> à votre arrivée pour que l'on puisse vous accueillir.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-podcast-accent text-black font-semibold rounded-lg hover:bg-podcast-accent/80 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingConfirmation;
