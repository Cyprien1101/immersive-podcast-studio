
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

    // Récupérer les données de l'événement
    const eventData = await req.json();
    
    // Vérifier les données requises
    if (!eventData.summary || !eventData.start || !eventData.end) {
      throw new Error('Données d\'événement incomplètes');
    }

    // Récupérer les tokens de l'administrateur cyprien.baudouin4@gmail.com 
    // (indépendamment de l'utilisateur qui fait la requête)
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'cyprien.baudouin4@gmail.com')
      .single();
    
    if (adminError || !adminData) {
      throw new Error('Administrateur non trouvé');
    }

    // Récupérer les tokens de l'administrateur
    const { data: tokenData, error: tokenError } = await supabase
      .from('admin_calendar_tokens')
      .select('*')
      .eq('user_id', adminData.id)
      .maybeSingle();

    if (tokenError || !tokenData) {
      throw new Error('Token Google non trouvé. Veuillez connecter votre compte Google');
    }

    // Vérifier si le token a expiré
    const isExpired = new Date(tokenData.expiry_date) <= new Date();
    let accessToken = tokenData.access_token;

    if (isExpired && tokenData.refresh_token) {
      // Rafraîchir le token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();
      
      if (refreshData.error) {
        throw new Error(`Erreur lors du rafraîchissement du token: ${refreshData.error}`);
      }

      // Mettre à jour le token dans la base de données
      const { error: updateError } = await supabase
        .from('admin_calendar_tokens')
        .update({
          access_token: refreshData.access_token,
          expiry_date: new Date(Date.now() + (refreshData.expires_in * 1000)).toISOString(),
        })
        .eq('user_id', adminData.id);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour du token: ${updateError.message}`);
      }

      accessToken = refreshData.access_token;
    }

    // Créer l'événement dans Google Calendar
    const createEventResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${tokenData.calendar_id}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: eventData.summary,
        description: eventData.description || '',
        start: eventData.start,
        end: eventData.end,
        location: eventData.location || '',
        colorId: eventData.colorId || '1',
        attendees: eventData.attendees || [],
        reminders: {
          useDefault: true,
        },
      }),
    });

    const responseData = await createEventResponse.json();
    
    if (responseData.error) {
      throw new Error(`Erreur lors de la création de l'événement: ${responseData.error.message}`);
    }

    // Récupérer les informations de réservation de l'événement
    // Extraire les heures du début et de fin des données de l'événement
    const startDateTime = new Date(eventData.start.dateTime);
    const endDateTime = new Date(eventData.end.dateTime);
    
    // Formatage de la date sans décalage de timezone
    const bookingDate = `${startDateTime.getFullYear()}-${String(startDateTime.getMonth() + 1).padStart(2, '0')}-${String(startDateTime.getDate()).padStart(2, '0')}`;
    console.log("Date formatée pour la base de données:", bookingDate);
    
    // Mettre à jour les créneaux de disponibilité
    // Nous allons chercher tous les créneaux de 30 minutes entre l'heure de début et l'heure de fin
    const startHour = startDateTime.getHours();
    const startMin = startDateTime.getMinutes();
    const endHour = endDateTime.getHours();
    const endMin = endDateTime.getMinutes();
    
    const studio_id = "d9c24a0a-d94a-4cbc-b489-fa5cfe73ce08"; // ID fixe du studio Lyon
    
    // Mettre à jour tous les créneaux de 30 minutes concernés
    for (let hour = startHour; hour <= endHour; hour++) {
      // Pour chaque heure complète
      if (hour === startHour) {
        // Si c'est l'heure de début, vérifier les minutes
        if (startMin <= 30) {
          // Mettre à jour le créneau de XX:00 à XX:30
          await updateAvailabilitySlot(supabase, studio_id, bookingDate, 
            `${hour < 10 ? '0' + hour : hour}:00`, 
            `${hour < 10 ? '0' + hour : hour}:30`);
        }
        
        if (hour < endHour || (hour === endHour && endMin > 30)) {
          // Mettre à jour le créneau de XX:30 à XX+1:00
          await updateAvailabilitySlot(supabase, studio_id, bookingDate, 
            `${hour < 10 ? '0' + hour : hour}:30`, 
            `${(hour + 1) < 10 ? '0' + (hour + 1) : (hour + 1)}:00`);
        }
      } else if (hour === endHour) {
        // Si c'est l'heure de fin, vérifier les minutes
        if (endMin > 0) {
          // Mettre à jour le créneau de XX:00 à XX:30
          await updateAvailabilitySlot(supabase, studio_id, bookingDate, 
            `${hour < 10 ? '0' + hour : hour}:00`, 
            `${hour < 10 ? '0' + hour : hour}:30`);
        }
        
        if (endMin > 30) {
          // Mettre à jour le créneau de XX:30 à XX+1:00
          await updateAvailabilitySlot(supabase, studio_id, bookingDate, 
            `${hour < 10 ? '0' + hour : hour}:30`, 
            `${(hour + 1) < 10 ? '0' + (hour + 1) : (hour + 1)}:00`);
        }
      } else {
        // Pour les heures intermédiaires, mettre à jour les deux créneaux
        await updateAvailabilitySlot(supabase, studio_id, bookingDate, 
          `${hour < 10 ? '0' + hour : hour}:00`, 
          `${hour < 10 ? '0' + hour : hour}:30`);
        
        await updateAvailabilitySlot(supabase, studio_id, bookingDate, 
          `${hour < 10 ? '0' + hour : hour}:30`, 
          `${(hour + 1) < 10 ? '0' + (hour + 1) : (hour + 1)}:00`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, event: responseData }),
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

// Fonction pour mettre à jour un créneau de disponibilité
async function updateAvailabilitySlot(supabase: any, studio_id: string, date: string, start_time: string, end_time: string) {
  try {
    // Vérifier si le créneau existe déjà
    const { data, error: selectError } = await supabase
      .from('studio_availability')
      .select('id')
      .eq('studio_id', studio_id)
      .eq('date', date)
      .eq('start_time', start_time)
      .eq('end_time', end_time)
      .maybeSingle();
    
    if (selectError) {
      console.error(`Erreur lors de la vérification du créneau: ${selectError.message}`);
      return;
    }
    
    if (data) {
      // Si le créneau existe, le mettre à jour
      const { error: updateError } = await supabase
        .from('studio_availability')
        .update({ is_available: false })
        .eq('id', data.id);
      
      if (updateError) {
        console.error(`Erreur lors de la mise à jour du créneau: ${updateError.message}`);
      } 
    } else {
      // Si le créneau n'existe pas, le créer
      const { error: insertError } = await supabase
        .from('studio_availability')
        .insert({
          studio_id,
          date,
          start_time,
          end_time,
          is_available: false
        });
      
      if (insertError) {
        console.error(`Erreur lors de la création du créneau: ${insertError.message}`);
      }
    }
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du créneau: ${error.message}`);
  }
}
