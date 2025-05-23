
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("No session ID provided");
    
    // Create Supabase client with service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'payment_intent']
    });
    logStep("Session retrieved", { 
      status: session.status, 
      customerId: session.customer?.id,
      metadata: session.metadata
    });
    
    if (session.status !== 'complete') {
      return new Response(JSON.stringify({ 
        status: session.status, 
        success: false,
        message: "Payment not completed" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Extract user and service info from metadata
    const userId = session.metadata?.user_id;
    const serviceType = session.metadata?.service_type;
    const serviceId = session.metadata?.service_id;
    const bookingDataStr = session.metadata?.booking_data;
    
    if (!userId || !serviceType || !serviceId) {
      throw new Error("Missing required metadata in session");
    }
    
    logStep("Processing payment", { userId, serviceType, serviceId });
    let bookingId = null;
    let bookingData = null;

    if (bookingDataStr) {
      try {
        bookingData = JSON.parse(bookingDataStr);
        logStep("Parsed booking data", bookingData);
      } catch (parseError) {
        logStep("Error parsing booking data", parseError);
        throw new Error(`Failed to parse booking data: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
    }

    // Different processing logic based on service type
    if (serviceType === 'subscription') {
      // For subscriptions, update our subscription records
      try {
        const subscription = await stripe.subscriptions.list({
          customer: typeof session.customer === 'string' ? session.customer : session.customer?.id,
          status: 'active',
          limit: 1
        });
        
        if (subscription.data.length > 0) {
          const activeSub = subscription.data[0];
          const subscriptionEnd = new Date(activeSub.current_period_end * 1000);
          
          // Get subscription plan details
          const { data: planData } = await supabaseClient
            .from('subscription_plans')
            .select('*')
            .eq('id', serviceId)
            .single();
          
          if (planData) {
            // Create or update subscription record
            await supabaseClient.from('subscriptions').upsert({
              user_id: userId,
              plan_id: serviceId,
              plan_name: planData.name,
              price: planData.price,
              price_interval: planData.price_interval,
              start_date: new Date().toISOString(),
              end_date: subscriptionEnd.toISOString(),
              status: 'active'
            });
            logStep("Subscription record updated");
            
            // Now check if there's a pending booking to finalize from the subscription payment
            if (bookingData && bookingData.pending_booking_id) {
              // Update the existing pending booking to confirmed status
              const { data: updatedBooking, error: updateError } = await supabaseClient
                .from('bookings')
                .update({ 
                  status: 'upcoming',  // Change from pending_payment to upcoming
                  total_price: 0 // Subscription bookings are free
                })
                .eq('id', bookingData.pending_booking_id)
                .select()
                .single();
              
              if (updateError) {
                logStep("Error updating pending booking", updateError);
                // If update fails, try to create a new booking as fallback
                const { data: newBooking, error: createError } = await createNewBookingFromData(supabaseClient, userId, bookingData);
                
                if (createError) {
                  logStep("Error creating fallback booking", createError);
                } else if (newBooking) {
                  bookingId = newBooking.id;
                  logStep("Created fallback booking after subscription payment", { bookingId });
                }
              } else if (updatedBooking) {
                bookingId = updatedBooking.id;
                logStep("Updated pending booking after subscription payment", { bookingId });
                
                // Update studio availability to mark slots as unavailable
                await updateStudioAvailability(supabaseClient, bookingData);
              }
            } else if (bookingData && bookingData.studio_id) {
              // No pending booking ID, but we have booking data - create a new one
              const { data: newBooking, error: createError } = await createNewBookingFromData(supabaseClient, userId, bookingData);
              
              if (createError) {
                logStep("Error creating new booking from subscription data", createError);
              } else if (newBooking) {
                bookingId = newBooking.id;
                logStep("Created new booking after subscription payment", { bookingId });
                
                // Update studio availability to mark slots as unavailable
                await updateStudioAvailability(supabaseClient, bookingData);
              }
            }
          }
        }
      } catch (subError) {
        logStep("Error processing subscription", subError);
        // Continue processing - don't throw error as payment was successful
      }
    } 
    else if (serviceType === 'hourPackage') {
      // For hour packages, create a booking record if booking data exists
      if (bookingData) {
        try {          
          // Get hour package details
          const { data: packageData } = await supabaseClient
            .from('hour_packages')
            .select('*')
            .eq('id', serviceId)
            .single();
          
          if (packageData && bookingData) {
            // Calculate total price based on duration and hourly rate
            const duration = bookingData.duration || 1;
            const totalPrice = packageData.price_per_hour * duration;
            
            // Create booking record AFTER payment is confirmed
            const { data: bookingResult, error: bookingError } = await supabaseClient
              .from('bookings')
              .insert({
                user_id: userId,
                studio_id: bookingData.studio_id,
                date: bookingData.date,
                start_time: bookingData.start_time,
                end_time: bookingData.end_time,
                number_of_guests: bookingData.number_of_guests,
                total_price: totalPrice,
                status: 'upcoming'
              })
              .select()
              .single();
            
            if (bookingError) {
              logStep("Error creating booking", bookingError);
              throw new Error(`Failed to create booking: ${bookingError.message}`);
            }
            
            if (bookingResult) {
              bookingId = bookingResult.id;
              logStep("Booking created successfully after payment", { bookingId });
            }
            
            // Update studio availability to mark slots as unavailable
            await updateStudioAvailability(supabaseClient, bookingData);
            logStep("Studio availability updated after booking creation");
          }
        } catch (parseError) {
          logStep("Error creating booking with hourPackage", parseError);
          throw new Error(`Failed during hourPackage booking: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
      } else {
        logStep("No booking data found in session metadata");
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      status: session.status,
      service_type: serviceType,
      booking_id: bookingId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[VERIFY-PAYMENT] ERROR: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage, success: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Helper function to create a new booking from booking data
async function createNewBookingFromData(supabaseClient, userId, bookingData) {
  if (!bookingData || !bookingData.studio_id) {
    return { data: null, error: new Error("Insufficient booking data") };
  }
  
  try {
    // Create booking record
    return await supabaseClient
      .from('bookings')
      .insert({
        user_id: userId,
        studio_id: bookingData.studio_id,
        date: bookingData.date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        number_of_guests: bookingData.number_of_guests || 1,
        total_price: 0, // Subscription bookings are free
        status: 'upcoming'
      })
      .select()
      .single();
  } catch (error) {
    return { 
      data: null, 
      error: new Error(`Failed to create booking: ${error instanceof Error ? error.message : String(error)}`) 
    };
  }
}

// Function to update studio availability based on booking
async function updateStudioAvailability(supabaseClient, bookingData) {
  try {
    // Parse start and end time
    const [startHour, startMinute] = bookingData.start_time.split(':').map(Number);
    const [endHour, endMinute] = bookingData.end_time.split(':').map(Number);
    
    // Calculate all 30-minute slots between start and end time
    const slots = [];
    
    // Start with the initial time
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    // Continue until we reach the end time
    while (
      currentHour < endHour || 
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      // Format current time slot
      const formattedHour = currentHour.toString().padStart(2, '0');
      const formattedMinute = currentMinute.toString().padStart(2, '0');
      const startTime = `${formattedHour}:${formattedMinute}`;
      
      // Calculate end of 30-minute slot
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
      
      // Format end time of the slot
      const endFormattedHour = currentHour.toString().padStart(2, '0');
      const endFormattedMinute = currentMinute.toString().padStart(2, '0');
      const endTime = `${endFormattedHour}:${endFormattedMinute}`;
      
      // Add slot to the list
      slots.push({
        start_time: startTime,
        end_time: endTime
      });
    }
    
    console.log("Updating availability for these slots:", slots);
    
    // Update each slot in the database
    for (const slot of slots) {
      const { start_time, end_time } = slot;
      
      // Check if slot already exists
      const { data: existingSlot, error: fetchError } = await supabaseClient
        .from('studio_availability')
        .select('*')
        .eq('studio_id', bookingData.studio_id)
        .eq('date', bookingData.date)
        .eq('start_time', start_time)
        .eq('end_time', end_time)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error checking existing slot:", fetchError);
        continue;
      }
      
      if (existingSlot) {
        // Update existing slot
        const { error: updateError } = await supabaseClient
          .from('studio_availability')
          .update({ is_available: false })
          .eq('id', existingSlot.id);
        
        if (updateError) {
          console.error("Error updating slot availability:", updateError);
        }
      } else {
        // Create new slot
        const { error: insertError } = await supabaseClient
          .from('studio_availability')
          .insert({
            studio_id: bookingData.studio_id,
            date: bookingData.date,
            start_time: start_time,
            end_time: end_time,
            is_available: false
          });
        
        if (insertError) {
          console.error("Error inserting new slot:", insertError);
        }
      }
    }
  } catch (error) {
    console.error("Error in updateStudioAvailability:", error);
  }
}
