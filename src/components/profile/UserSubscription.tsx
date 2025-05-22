
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Check, X } from 'lucide-react';

interface Subscription {
  id: string;
  plan_name: string;
  price: number;
  price_interval: string;
  status: string;
  start_date: string;
}

const UserSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, plan_name, price, price_interval, status, start_date')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('start_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération de l\'abonnement:', error);
        toast.error('Impossible de charger les informations d\'abonnement');
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled', end_date: new Date().toISOString() })
        .eq('id', subscription.id);
      
      if (error) {
        console.error('Erreur lors de l\'annulation:', error);
        toast.error('Impossible d\'annuler l\'abonnement');
      } else {
        toast.success('Abonnement annulé avec succès');
        setSubscription(null);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="booking-card mb-6">
        <CardHeader>
          <CardTitle className="text-white">Mon abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="booking-card mb-6">
        <CardHeader>
          <CardTitle className="text-white">Mon abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Vous n'avez pas d'abonnement actif.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="booking-card mb-6">
        <CardHeader>
          <CardTitle className="text-white">Mon abonnement</CardTitle>
          <CardDescription className="text-gray-400">
            Détails de votre abonnement actuel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="booking-section">
            <h3 className="text-sm font-medium text-gray-400">Formule</h3>
            <p className="text-white">{subscription.plan_name}</p>
          </div>
          
          <div className="booking-section">
            <h3 className="text-sm font-medium text-gray-400">Prix</h3>
            <p className="text-white">{subscription.price} € / {subscription.price_interval}</p>
          </div>
          
          <div className="booking-section">
            <h3 className="text-sm font-medium text-gray-400">Date de début</h3>
            <p className="text-white">{formatDate(subscription.start_date)}</p>
          </div>
          
          <div className="booking-section">
            <h3 className="text-sm font-medium text-gray-400">Status</h3>
            <div className="flex items-center space-x-2">
              {subscription.status === 'active' ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Actif</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Inactif</span>
                </>
              )}
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              variant="destructive" 
              onClick={() => setIsDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              Annuler mon abonnement
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-podcast-soft-black border border-podcast-border-gray text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Cette action ne peut pas être annulée. Votre abonnement sera résilié immédiatement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-podcast-border-gray text-white hover:bg-gray-800">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={cancelSubscription}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserSubscription;
