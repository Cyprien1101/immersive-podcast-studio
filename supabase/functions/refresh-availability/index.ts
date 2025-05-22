
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

// Configuration pour CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Création du client Supabase
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Pas de token d\'authentification');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Vérifier l'authentification de l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur est un administrateur
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profileData?.role !== 'admin') {
      throw new Error('Accès non autorisé - rôle admin requis');
    }

    // Récupérer le token Google Calendar de l'admin
    const { data: tokenData, error: tokenError } = await supabase
      .from('admin_calendar_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Aucun token Google Calendar trouvé pour cet administrateur');
    }

    // Vérifier si le token est expiré et le rafraîchir si nécessaire
    let accessToken = tokenData.access_token;
    const expiry = new Date(tokenData.expiry_date);
    
    if (expiry < new Date()) {
      // Le token est expiré, il faut le rafraîchir
      if (!tokenData.refresh_token) {
        throw new Error('Aucun refresh_token disponible pour renouveler l\'accès');
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const newTokenData = await tokenResponse.json();
      
      if (newTokenData.error) {
        throw new Error(`Erreur lors du rafraîchissement du token: ${newTokenData.error}`);
      }

      // Mettre à jour le token dans la base de données
      accessToken = newTokenData.access_token;
      const newExpiry = new Date(Date.now() + (newTokenData.expires_in * 1000)).toISOString();
      
      await supabase
        .from('admin_calendar_tokens')
        .update({
          access_token: accessToken,
          expiry_date: newExpiry,
        })
        .eq('user_id', user.id);
    }

    // Récupérer les studios et leurs disponibilités actuelles
    const { data: studiosData, error: studiosError } = await supabase
      .from('studios')
      .select('*');
    
    if (studiosError) {
      throw new Error(`Erreur lors de la récupération des studios: ${studiosError.message}`);
    }

    // Obtenir la date actuelle et les dates pour les 30 prochains jours
    const today = new Date();
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);

    // Formater les dates pour l'API Google Calendar
    const timeMin = today.toISOString();
    const timeMax = thirtyDaysLater.toISOString();

    // Récupérer les événements du calendrier Google
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(tokenData.calendar_id)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const calendarData = await calendarResponse.json();
    
    if (calendarData.error) {
      throw new Error(`Erreur lors de la récupération des événements: ${calendarData.error.message}`);
    }

    // Pour chaque studio, mettre à jour les disponibilités
    for (const studio of studiosData) {
      // Créer un tableau de dates pour les 30 prochains jours
      const dateRange = [];
      const currDate = new Date(today);
      
      while (currDate <= thirtyDaysLater) {
        dateRange.push(new Date(currDate));
        currDate.setDate(currDate.getDate() + 1);
      }

      // Pour chaque date, créer des créneaux horaires standard (par exemple, 9h à 18h par tranches d'une heure)
      const timeSlots = [];
      
      for (const date of dateRange) {
        const dateStr = date.toISOString().split('T')[0];
        
        // Créneaux de 9h à 18h par défaut
        for (let hour = 9; hour < 18; hour++) {
          const startTime = `${hour < 10 ? '0' + hour : hour}:00`;
          const endTime = `${hour + 1 < 10 ? '0' + (hour + 1) : hour + 1}:00`;
          
          // Vérifier si ce créneau est déjà réservé
          const startDateTime = new Date(`${dateStr}T${startTime}:00`);
          const endDateTime = new Date(`${dateStr}T${endTime}:00`);
          
          // Vérifier si le créneau chevauche un événement existant dans le calendrier
          const isOverlapping = calendarData.items.some((event: any) => {
            if (!event.start?.dateTime || !event.end?.dateTime) return false;
            
            const eventStart = new Date(event.start.dateTime);
            const eventEnd = new Date(event.end.dateTime);
            
            return (startDateTime < eventEnd && endDateTime > eventStart);
          });
          
          // Si le créneau ne chevauche pas un événement existant, il est disponible
          timeSlots.push({
            studio_id: studio.id,
            date: dateStr,
            start_time: startTime,
            end_time: endTime,
            is_available: !isOverlapping
          });
        }
      }

      // Mettre à jour les disponibilités dans la base de données
      // D'abord, supprimer les anciennes disponibilités pour ce studio
      await supabase
        .from('studio_availability')
        .delete()
        .eq('studio_id', studio.id)
        .gte('date', today.toISOString().split('T')[0]);
      
      // Ensuite, insérer les nouvelles disponibilités
      if (timeSlots.length > 0) {
        // Insérer par lots de 1000 pour éviter les limitations
        for (let i = 0; i < timeSlots.length; i += 1000) {
          const batch = timeSlots.slice(i, i + 1000);
          
          await supabase
            .from('studio_availability')
            .upsert(batch);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Disponibilités mises à jour avec succès',
        studios: studiosData.length,
        events: calendarData.items.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
