
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

// Les scopes requis pour l'accès au calendrier Google
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

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

    // Récupérer les données de la requête
    const { action, code } = await req.json();

    // Gérer les différentes actions
    if (action === 'getAuthUrl') {
      // Récupérer les informations du projet
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');

      if (!clientId || !redirectUri) {
        throw new Error('Configuration Google OAuth manquante');
      }

      // Générer l'URL d'authentification
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', SCOPES.join(' '));
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');
      authUrl.searchParams.append('state', user.id);

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'handleCallback' && code) {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
      const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');

      if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('Configuration Google OAuth manquante');
      }

      // Échanger le code d'autorisation contre un token d'accès
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(`Erreur d'authentification Google: ${tokenData.error}`);
      }

      // Récupérer la liste des calendriers de l'utilisateur
      const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const calendarData = await calendarResponse.json();
      
      if (calendarData.error) {
        throw new Error(`Erreur lors de la récupération des calendriers: ${calendarData.error.message}`);
      }

      // Utiliser le calendrier principal par défaut
      const primaryCalendar = calendarData.items.find((cal: any) => cal.primary) || calendarData.items[0];

      // Stocker le token dans la base de données
      const { error: insertError } = await supabase
        .from('admin_calendar_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expiry_date: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
          calendar_id: primaryCalendar.id,
        });

      if (insertError) {
        throw new Error(`Erreur lors de l'enregistrement du token: ${insertError.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Calendrier Google connecté avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Action non supportée');
    }
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
