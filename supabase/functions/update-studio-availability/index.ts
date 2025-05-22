
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Configuration CORS pour permettre les appels depuis l'application frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupérer les données de la réservation
    const { booking } = await req.json();
    
    // Vérifier que toutes les informations nécessaires sont présentes
    if (!booking || !booking.studio_id || !booking.date || !booking.start_time || !booking.end_time) {
      return new Response(
        JSON.stringify({ error: "Informations de réservation incomplètes" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Initialiser le client Supabase
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    console.log("Traitement de la réservation:", booking);

    // Convertir les heures en format 24h
    const startTime = booking.start_time;
    const endTime = booking.end_time;
    const bookingDate = booking.date;
    const studioId = booking.studio_id;

    // Générer des créneaux de 30 minutes entre l'heure de début et l'heure de fin
    const slots = generateTimeSlots(startTime, endTime);
    console.log("Créneaux à mettre à jour:", slots);

    // Mise à jour ou insertion des enregistrements de disponibilité
    const updatePromises = slots.map(async (slot) => {
      const { start_time, end_time } = slot;
      
      // Vérifier si l'enregistrement existe déjà
      const { data: existingSlot, error: queryError } = await supabaseAdmin
        .from("studio_availability")
        .select("*")
        .eq("studio_id", studioId)
        .eq("date", bookingDate)
        .eq("start_time", start_time)
        .single();

      if (queryError && queryError.code !== "PGRST116") { // PGRST116 = not found
        console.error("Erreur lors de la vérification du créneau:", queryError);
      }

      if (existingSlot) {
        // Mettre à jour l'enregistrement existant
        const { error: updateError } = await supabaseAdmin
          .from("studio_availability")
          .update({ is_available: false })
          .eq("id", existingSlot.id);

        if (updateError) {
          console.error("Erreur lors de la mise à jour du créneau:", updateError);
          return { success: false, slot, error: updateError };
        }
      } else {
        // Insérer un nouvel enregistrement
        const { error: insertError } = await supabaseAdmin
          .from("studio_availability")
          .insert({
            studio_id: studioId,
            date: bookingDate,
            start_time: start_time,
            end_time: end_time,
            is_available: false
          });

        if (insertError) {
          console.error("Erreur lors de l'insertion du créneau:", insertError);
          return { success: false, slot, error: insertError };
        }
      }

      return { success: true, slot };
    });

    const results = await Promise.all(updatePromises);
    const success = results.every(result => result.success);

    if (success) {
      return new Response(
        JSON.stringify({ success: true, message: "Disponibilité du studio mise à jour avec succès" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      const errors = results.filter(result => !result.success).map(result => result.error);
      return new Response(
        JSON.stringify({ success: false, errors }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la disponibilité:", error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de la mise à jour de la disponibilité" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Fonction pour générer des créneaux de 30 minutes entre deux heures
function generateTimeSlots(startTime: string, endTime: string) {
  const slots = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (
    currentHour < endHour || 
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    const formattedHour = currentHour.toString().padStart(2, "0");
    const formattedMinute = currentMinute.toString().padStart(2, "0");
    const slotStartTime = `${formattedHour}:${formattedMinute}`;
    
    // Déterminer l'heure de fin du créneau (30 minutes plus tard)
    let nextMinute = currentMinute + 30;
    let nextHour = currentHour;
    
    if (nextMinute >= 60) {
      nextMinute = 0;
      nextHour += 1;
    }
    
    const formattedNextHour = nextHour.toString().padStart(2, "0");
    const formattedNextMinute = nextMinute.toString().padStart(2, "0");
    const slotEndTime = `${formattedNextHour}:${formattedNextMinute}`;
    
    slots.push({
      start_time: slotStartTime,
      end_time: slotEndTime
    });
    
    // Avancer de 30 minutes
    currentMinute = nextMinute;
    currentHour = nextHour;
  }
  
  return slots;
}
