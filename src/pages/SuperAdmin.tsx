import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCcw, Settings, Users, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import BookingHeader from '@/components/booking/BookingHeader';
import AdminCalendar from '@/components/admin/AdminCalendar';

const SuperAdmin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    activeSubscriptions: 0
  });

  // Vérifier si l'utilisateur est le super admin spécifique
  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      if (!user) return;

      try {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error('Erreur lors de la vérification du statut super admin:', userError);
          return;
        }

        // Vérifier si l'email est celui spécifié
        const userIsSpecificAdmin = userData?.email === 'cyprien.baudouin4@gmail.com';
        setIsSuperAdmin(userIsSpecificAdmin);

        if (!userIsSpecificAdmin) {
          toast.error("Vous n'avez pas l'accès à cette page");
          navigate('/');
        } else {
          // Charger les statistiques si c'est le super admin
          loadStatistics();
        }
      } catch (err) {
        console.error('Erreur:', err);
      }
    };

    if (!loading) {
      checkSuperAdminStatus();
    }
  }, [user, loading, navigate]);

  // Rediriger vers la page d'accueil si non authentifié
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Vous devez être connecté pour accéder à cette page");
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Charger les statistiques
  const loadStatistics = async () => {
    setLoadingStats(true);
    try {
      // Compter le nombre d'utilisateurs
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Compter le nombre de réservations
      const { count: bookingCount, error: bookingError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      // Compter le nombre d'abonnements actifs
      const { count: subscriptionCount, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (userError || bookingError || subscriptionError) {
        console.error('Erreur lors du chargement des statistiques:', userError || bookingError || subscriptionError);
        return;
      }

      setStats({
        totalUsers: userCount || 0,
        totalBookings: bookingCount || 0,
        activeSubscriptions: subscriptionCount || 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadStatistics();
      toast.success("Les données ont été rafraîchies avec succès");
    } catch (error: any) {
      console.error('Erreur lors du rafraîchissement des données:', error);
      toast.error(error.message || "Erreur lors du rafraîchissement des données");
    } finally {
      setRefreshing(false);
    }
  };

  // Si en cours de chargement ou non super admin, ne rien afficher
  if (loading || !isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <BookingHeader />
      
      <div className="container mx-auto pt-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <Shield className="mr-2 text-podcast-accent" /> 
              Super Administration
            </h1>
            
            <Button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2 bg-podcast-accent text-black hover:bg-podcast-accent/80"
            >
              {refreshing ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Rafraîchir les données
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="booking-card overflow-hidden">
              <CardHeader className="bg-black/20">
                <CardTitle className="text-xl flex items-center">
                  <Users className="mr-2 h-5 w-5 text-podcast-accent" />
                  Utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-4xl font-bold">
                  {loadingStats ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.totalUsers
                  )}
                </p>
                <p className="text-sm text-gray-400 mt-1">utilisateurs enregistrés</p>
              </CardContent>
            </Card>
            
            <Card className="booking-card overflow-hidden">
              <CardHeader className="bg-black/20">
                <CardTitle className="text-xl flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-podcast-accent" />
                  Réservations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-4xl font-bold">
                  {loadingStats ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.totalBookings
                  )}
                </p>
                <p className="text-sm text-gray-400 mt-1">réservations effectuées</p>
              </CardContent>
            </Card>
            
            <Card className="booking-card overflow-hidden">
              <CardHeader className="bg-black/20">
                <CardTitle className="text-xl flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-podcast-accent" />
                  Abonnements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-4xl font-bold">
                  {loadingStats ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.activeSubscriptions
                  )}
                </p>
                <p className="text-sm text-gray-400 mt-1">abonnements actifs</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Ajout du composant AdminCalendar */}
          <div className="mb-8">
            <AdminCalendar />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="booking-card overflow-hidden">
              <CardHeader className="bg-black/20">
                <CardTitle className="text-xl">Liens Rapides</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <Button 
                    variant="outline" 
                    className="flex justify-start items-center gap-2 border-gray-700 hover:bg-gray-800 text-white"
                    onClick={() => navigate('/admin')}
                  >
                    <Calendar className="h-5 w-5 text-podcast-accent" />
                    Administration du Calendrier
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex justify-start items-center gap-2 border-gray-700 hover:bg-gray-800 text-white"
                    onClick={() => window.open("https://supabase.com/dashboard/project/zqnejedmmwcumpqihupt/auth/users", "_blank")}
                  >
                    <Users className="h-5 w-5 text-podcast-accent" />
                    Gestion des Utilisateurs (Supabase)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex justify-start items-center gap-2 border-gray-700 hover:bg-gray-800 text-white"
                    onClick={() => window.open("https://supabase.com/dashboard/project/zqnejedmmwcumpqihupt/editor", "_blank")}
                  >
                    <Settings className="h-5 w-5 text-podcast-accent" />
                    Éditeur SQL (Supabase)
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="booking-card overflow-hidden">
              <CardHeader className="bg-black/20">
                <CardTitle className="text-xl">Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <Button 
                    className="w-full bg-podcast-accent text-black hover:bg-podcast-accent/80"
                    onClick={() => navigate('/admin')}
                  >
                    Gérer le Calendrier
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-700 hover:bg-gray-800 text-white"
                    onClick={() => toast.info("Fonctionnalité en développement")}
                  >
                    Gérer les Réservations
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-700 hover:bg-gray-800 text-white"
                    onClick={() => toast.info("Fonctionnalité en développement")}
                  >
                    Gérer les Abonnements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
