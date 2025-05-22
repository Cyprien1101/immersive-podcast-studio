
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

    // Récupérer le rôle de l'utilisateur
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

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
