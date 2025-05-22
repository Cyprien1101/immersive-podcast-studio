
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

// Cette fonction gère le callback OAuth de Google après l'authentification
serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // Le state contient l'ID de l'utilisateur
    const error = url.searchParams.get('error');

    // Si une erreur est retournée par Google
    if (error) {
      console.error('Erreur Google OAuth:', error);
      return Response.redirect(`${Deno.env.get('FRONTEND_URL')}/admin?error=${encodeURIComponent(error)}`, 302);
    }

    // Si le code est manquant
    if (!code || !state) {
      return Response.redirect(`${Deno.env.get('FRONTEND_URL')}/admin?error=missing_parameters`, 302);
    }

    // Créer le client Supabase avec la clé de service
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Échanger le code contre un token d'accès
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      return Response.redirect(`${Deno.env.get('FRONTEND_URL')}/admin?error=missing_configuration`, 302);
    }

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
      console.error('Erreur lors de l\'échange du code:', tokenData.error);
      return Response.redirect(`${Deno.env.get('FRONTEND_URL')}/admin?error=${encodeURIComponent(tokenData.error)}`, 302);
    }

    // Récupérer la liste des calendriers
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const calendarData = await calendarResponse.json();
      
    if (calendarData.error) {
      console.error('Erreur lors de la récupération des calendriers:', calendarData.error);
      return Response.redirect(`${Deno.env.get('FRONTEND_URL')}/admin?error=calendar_error`, 302);
    }

    // Utiliser le calendrier principal par défaut
    const primaryCalendar = calendarData.items.find((cal: any) => cal.primary) || calendarData.items[0];

    // Stocker le token dans la base de données
    const { error: insertError } = await supabase
      .from('admin_calendar_tokens')
      .upsert({
        user_id: state,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expiry_date: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        calendar_id: primaryCalendar.id,
      });

    if (insertError) {
      console.error('Erreur lors de l\'enregistrement du token:', insertError);
      return Response.redirect(`${Deno.env.get('FRONTEND_URL')}/admin?error=database_error`, 302);
    }

    // Rediriger vers la page d'admin avec un message de succès
    return Response.redirect(`${Deno.env.get('FRONTEND_URL')}/admin?success=true`, 302);
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return Response.redirect(`${Deno.env.get('FRONTEND_URL')}/admin?error=unexpected_error`, 302);
  }
});
