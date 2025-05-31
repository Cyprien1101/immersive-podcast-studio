
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Parse request body
    const { serviceType, serviceId, bookingData } = await req.json();
    logStep("Request parsed", { serviceType, serviceId, hasBookingData: !!bookingData, bookingDuration: bookingData?.duration });

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    // const stripe = new Stripe("sk_test_51LbTkeGQizmCWGZXipjWk9fuYXnpTNHCYShEqceA31VptbD56BJbmAmVnBhNQ3jbZOsRajqeyruHDe9Cx9juDK7g00mWypY6Vp", {
    //   apiVersion: "2023-10-16",
    // });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Get service details from Supabase
    let serviceData = null;
    let lineItems = [];
    let mode = "";

    if (serviceType === "subscription") {
      const { data: planData, error: planError } = await supabaseClient
        .from("subscription_plans")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (planError) throw planError;
      serviceData = planData;
      logStep("Subscription plan data retrieved", serviceData);

      // Use specific product IDs based on the plan name
      let productId;
      if (serviceData.name === "Abonnement Standard") {
        productId = "prod_SLwE1PqtMG2ASq";
        logStep("Using Standard subscription product ID", { productId });
      } else if (serviceData.name === "Abonnement Premium") {
        productId = "prod_SMeTGJtL5Xp06U";
        logStep("Using Premium subscription product ID", { productId });
      } else {
        // Create a product for other subscription types if needed
        const product = await stripe.products.create({
          name: serviceData.name,
          description: serviceData.description || `${serviceData.name} Subscription`,
          metadata: {
            plan_id: serviceData.id
          }
        });
        productId = product.id;
        logStep("New product created for unknown plan type", { productId });
      }

      // Create a price for the product - SET TO 1 EUR FOR TESTING
      const price = await stripe.prices.create({
        product: productId,
        // Use 1 EUR (100 cents) instead of the actual price for testing purposes
        unit_amount: 100, // 1 EUR in cents
        currency: "eur",
        recurring: {
          interval: serviceData.price_interval === "month" ? "month" : "year"
        },
        metadata: {
          plan_id: serviceData.id
        }
      });
      logStep("Price created", { priceId: price.id });

      lineItems = [
        {
          price: price.id,
          quantity: 1
        }
      ];
      mode = "subscription";
    } 
    else if (serviceType === "hourPackage") {
      const { data: packageData, error: packageError } = await supabaseClient
        .from("hour_packages")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (packageError) throw packageError;
      serviceData = packageData;
      logStep("Hour package data retrieved", serviceData);
      
      // Get the booking duration and calculate the total price
      const bookingDuration = bookingData?.duration || 1;
      // For testing purposes, set price to 1 EUR per hour
      const totalAmount = 100 * bookingDuration; // 1 EUR (100 cents) * duration
      
      logStep("Calculated price based on duration", { 
        pricePerHour: 1, // 1 EUR for testing
        duration: bookingDuration,
        totalAmount: totalAmount / 100 // Log in euros for readability
      });

      // For hour packages, create a one-time payment
      lineItems = [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${serviceData.name} - ${bookingDuration}h`,
              description: serviceData.description || `${serviceData.name} Package for ${bookingDuration} hour(s)`,
              metadata: {
                package_id: serviceData.id,
                duration: bookingDuration
              }
            },
            unit_amount: totalAmount, // 1 EUR per hour in cents
          },
          quantity: 1
        }
      ];
      mode = "payment";
    } else {
      throw new Error("Invalid service type");
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
      success_url: `${origin}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/booking`,
      metadata: {
        user_id: user.id,
        service_type: serviceType,
        service_id: serviceId,
        booking_data: bookingData ? JSON.stringify(bookingData) : null
      }
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CREATE-CHECKOUT] ERROR: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
