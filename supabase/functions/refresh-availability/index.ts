import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// Constants
const STUDIO_ID = 'd9c24a0a-d94a-4cbc-b489-fa5cfe73ce08' // Studio Lyon ID
const DAYS_TO_MAINTAIN = 30

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Initialize Supabase client with the project URL and service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Starting availability refresh...')
    
    // Step 1: Delete past availability slots (before today)
    console.log('Removing past availability slots...')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { error: deleteError, count: deletedCount } = await supabase
      .from('studio_availability')
      .delete()
      .lt('date', today.toISOString().split('T')[0])
    
    if (deleteError) {
      throw new Error(`Failed to delete past slots: ${deleteError.message}`)
    }
    console.log(`Deleted ${deletedCount} past availability slots`)
    
    // Step 2: Find the latest date with availability slots
    console.log('Finding latest date with existing availability...')
    const { data: latestDateData, error: latestDateError } = await supabase
      .from('studio_availability')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
    
    if (latestDateError) {
      throw new Error(`Failed to get latest date: ${latestDateError.message}`)
    }
    
    // Determine the start date for adding new slots
    // If we have existing slots, start from the day after the latest date
    // Otherwise, start from today
    const lastDate = latestDateData && latestDateData.length > 0
      ? new Date(latestDateData[0].date)
      : new Date(today)
    
    // Move to the next day
    lastDate.setDate(lastDate.getDate() + 1)
    
    // Calculate end date (we want to maintain DAYS_TO_MAINTAIN days from today)
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + DAYS_TO_MAINTAIN - 1)
    
    // Step 3: Generate and insert new availability slots if needed
    if (lastDate <= endDate) {
      console.log(`Generating new slots from ${lastDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}...`)
      
      const newSlots = []
      const currentDate = new Date(lastDate)
      
      // Loop through each day from start date to end date
      while (currentDate <= endDate) {
        const formattedDate = currentDate.toISOString().split('T')[0]
        
        // Generate slots for each day (8:00 to 20:00, 30-minute intervals)
        for (let hour = 8; hour < 20; hour++) {
          for (let minute of [0, 30]) {
            // Format times
            const startHour = hour.toString().padStart(2, '0')
            const startMinute = minute.toString().padStart(2, '0')
            const startTime = `${startHour}:${startMinute}`
            
            // Calculate end time
            const endMinute = minute + 30
            const endHour = endMinute === 60 ? hour + 1 : hour
            const formattedEndHour = endHour.toString().padStart(2, '0')
            const formattedEndMinute = (endMinute % 60).toString().padStart(2, '0')
            const endTime = `${formattedEndHour}:${formattedEndMinute}`
            
            // Skip if it would go beyond 20:00
            if (endHour > 19 || (endHour === 19 && endMinute > 30)) continue
            
            newSlots.push({
              studio_id: STUDIO_ID,
              date: formattedDate,
              start_time: startTime,
              end_time: endTime,
              is_available: true
            })
          }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      // Insert the new slots in batches for better performance
      if (newSlots.length > 0) {
        // Using batches of 100 slots at a time to avoid potential DB limits
        const BATCH_SIZE = 100
        for (let i = 0; i < newSlots.length; i += BATCH_SIZE) {
          const batch = newSlots.slice(i, i + BATCH_SIZE)
          const { error: insertError } = await supabase
            .from('studio_availability')
            .insert(batch)
          
          if (insertError) {
            throw new Error(`Failed to insert new slots: ${insertError.message}`)
          }
          console.log(`Inserted batch of ${batch.length} slots`)
        }
        console.log(`Generated ${newSlots.length} new availability slots`)
      } else {
        console.log('No new slots needed to be generated')
      }
    } else {
      console.log('No new availability slots needed')
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Studio availability refreshed successfully',
      stats: {
        deletedCount,
        newSlotsCount: newSlots?.length || 0
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
    
  } catch (error) {
    console.error('Error refreshing availability:', error.message)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
})
