
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import BookingHeader from '@/components/booking/BookingHeader';

const BookingConfirmation = () => {
  const { resetBooking } = useBooking();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
  const [serviceType, setServiceType] = useState<'subscription' | 'hourPackage' | null>(null);
  
  useEffect(() => {
    // Extract session_id from URL parameters
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id');
    
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      // If no session ID, assume we're coming from a direct booking
      setPaymentStatus('success');
      setLoading(false);
    }
    
    // Reset the booking context data
    resetBooking();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);
  
  const verifyPayment = async (sessionId: string) => {
    try {
      setLoading(true);
      
      // Call the verify-payment edge function
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });
      
      if (error) {
        console.error('Payment verification error:', error);
        setError('Une erreur est survenue lors de la vérification du paiement.');
        setPaymentStatus('failed');
      } else if (data?.success) {
        setPaymentStatus('success');
        setServiceType(data.service_type);
      } else {
        setError(data?.message || 'La vérification du paiement a échoué.');
        setPaymentStatus('failed');
      }
    } catch (err) {
      console.error('Error during payment verification:', err);
      setError('Une erreur technique est survenue. Veuillez contacter le support.');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-podcast-dark">
      <BookingHeader />
      
      <div className="container mx-auto pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1a1a1a] border border-podcast-border-gray rounded-xl p-8 text-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-16 w-16 animate-spin text-podcast-accent mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Vérification du paiement...</h2>
                <p className="text-gray-300">Veuillez patienter pendant que nous confirmons votre paiement.</p>
              </div>
            ) : paymentStatus === 'success' ? (
              <div className="flex flex-col items-center py-10">
                <CheckCircle2 className="h-24 w-24 text-green-500 mb-6" />
                <h1 className="text-3xl font-bold text-white mb-6">Merci pour votre réservation !</h1>
                
                {serviceType === 'subscription' ? (
                  <div className="text-gray-200 mb-8">
                    <p className="mb-4">Votre abonnement a été activé avec succès.</p>
                    <p>Vous pouvez maintenant réserver des créneaux dans votre espace membre.</p>
                  </div>
                ) : (
                  <div className="text-gray-200 mb-8">
                    <p className="mb-4">Votre réservation a été confirmée avec succès.</p>
                    <p>Vous recevrez bientôt un email avec tous les détails.</p>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button 
                    className="bg-podcast-accent hover:bg-podcast-accent/80 text-black px-6 py-2" 
                    onClick={() => navigate('/')}
                  >
                    Retour à l'accueil
                  </Button>
                  
                  {user && (
                    <Button 
                      variant="outline" 
                      className="border-podcast-accent text-podcast-accent hover:bg-podcast-accent/10" 
                      onClick={() => navigate('/profile')}
                    >
                      Voir mes réservations
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-10">
                <XCircle className="h-24 w-24 text-red-500 mb-6" />
                <h1 className="text-3xl font-bold text-white mb-6">Un problème est survenu</h1>
                
                <div className="text-gray-200 mb-8">
                  <p className="mb-4">{error || "Votre paiement n'a pas pu être traité."}</p>
                  <p>Veuillez réessayer ou contacter notre service client pour obtenir de l'aide.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button 
                    className="bg-podcast-accent hover:bg-podcast-accent/80 text-black px-6 py-2" 
                    onClick={() => navigate('/booking')}
                  >
                    Réessayer
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-podcast-accent text-podcast-accent hover:bg-podcast-accent/10" 
                    onClick={() => navigate('/')}
                  >
                    Retour à l'accueil
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
