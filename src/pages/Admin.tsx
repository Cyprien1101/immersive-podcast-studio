
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import BookingHeader from '@/components/booking/BookingHeader';
import AdminCalendar from '@/components/admin/AdminCalendar';

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [calendarConnected, setCalendarConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [refreshingAvailability, setRefreshingAvailability] = useState<boolean>(false);

  // Vérifier si l'utilisateur est administrateur
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        // Vérifier si l'utilisateur a le rôle admin dans la table profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erreur lors de la vérification du statut admin:', error);
          return;
        }

        const userIsAdmin = data?.role === 'admin';
        setIsAdmin(userIsAdmin);

        // Si l'utilisateur n'est pas admin, rediriger vers la page d'accueil
        if (!userIsAdmin) {
          toast.error("Vous n'avez pas l'accès à cette page");
          navigate('/');
        } else {
          // Vérifier si l'admin a déjà connecté son Google Calendar
          const { data: tokenData, error: tokenError } = await supabase
            .from('admin_calendar_tokens')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (tokenError) {
            console.error('Erreur lors de la vérification des tokens:', tokenError);
            return;
          }

          setCalendarConnected(!!tokenData);
        }
      } catch (err) {
        console.error('Erreur:', err);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading, navigate]);

  // Rediriger vers la page d'accueil si non authentifié
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Vous devez être connecté pour accéder à cette page");
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Fonction pour connecter Google Calendar
  const connectGoogleCalendar = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        method: 'POST',
        body: { action: 'getAuthUrl' }
      });

      if (error) {
        throw error;
      }

      if (data?.authUrl) {
        // Rediriger vers l'URL d'authentification Google
        window.location.href = data.authUrl;
      } else {
        throw new Error('URL d\'authentification non fournie');
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion à Google Calendar:', error);
      toast.error(error.message || "Erreur lors de la connexion à Google Calendar");
      setConnecting(false);
    }
  };

  // Fonction pour rafraîchir les disponibilités du studio
  const refreshAvailability = async () => {
    setRefreshingAvailability(true);
    try {
      const { data, error } = await supabase.functions.invoke('refresh-availability', {
        method: 'POST',
        body: { adminId: user?.id }
      });

      if (error) {
        throw error;
      }

      toast.success("Les disponibilités ont été mises à jour avec succès");
    } catch (error: any) {
      console.error('Erreur lors du rafraîchissement des disponibilités:', error);
      toast.error(error.message || "Erreur lors de la mise à jour des disponibilités");
    } finally {
      setRefreshingAvailability(false);
    }
  };

  // Si en cours de chargement ou non admin, ne rien afficher
  if (loading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-podcast-dark text-white">
      <BookingHeader />
      
      <div className="container mx-auto pt-24 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Panneau d'administration</h1>
          
          <Card className="booking-card overflow-hidden mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Google Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${calendarConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>
                    {calendarConnected 
                      ? "Google Calendar est connecté" 
                      : "Google Calendar n'est pas connecté"}
                  </span>
                </div>
                
                <Button
                  onClick={connectGoogleCalendar}
                  disabled={connecting}
                  className="flex items-center gap-2 bg-podcast-accent text-black hover:bg-podcast-accent/80"
                >
                  {connecting ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      {calendarConnected ? 'Reconnecter' : 'Connecter'} Google Calendar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {calendarConnected && (
            <>
              <Card className="booking-card overflow-hidden mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">Gestion des disponibilités</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Vous pouvez rafraîchir manuellement les disponibilités du studio en fonction de votre calendrier Google.
                  </p>
                  <Button
                    onClick={refreshAvailability}
                    disabled={refreshingAvailability}
                    className="flex items-center gap-2 bg-podcast-accent text-black hover:bg-podcast-accent/80"
                  >
                    {refreshingAvailability ? (
                      <>
                        <RotateCw className="h-4 w-4 animate-spin" />
                        Mise à jour en cours...
                      </>
                    ) : (
                      <>
                        <RotateCw className="h-4 w-4" />
                        Mettre à jour les disponibilités
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="mb-8">
                <AdminCalendar />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
