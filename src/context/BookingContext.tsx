
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define the booking data structure that matches the Supabase bookings table
export interface BookingData {
  id?: string;
  user_id?: string;
  studio_id: string;
  date: string;
  start_time: string;
  end_time: string;
  number_of_guests: number;
  total_price?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface SelectedService {
  id: string;
  name: string;
  type: 'subscription' | 'hourPackage';
}

interface BookingContextState {
  bookingData: BookingData | null;
  isComplete: boolean;
  selectedService: SelectedService | null;
}

type BookingAction = 
  | { type: 'SET_STUDIO_INFO'; payload: { studio_id: string } }
  | { type: 'SET_DATE_TIME_INFO'; payload: { date: string; start_time: string; end_time: string; number_of_guests: number } }
  | { type: 'SET_PRICE_INFO'; payload: { total_price: number } }
  | { type: 'SET_SERVICE_INFO'; payload: SelectedService }
  | { type: 'RESET_BOOKING' };

const initialState: BookingContextState = {
  bookingData: null,
  isComplete: false,
  selectedService: null
};

const bookingReducer = (state: BookingContextState, action: BookingAction): BookingContextState => {
  switch (action.type) {
    case 'SET_STUDIO_INFO':
      return {
        ...state,
        bookingData: {
          ...state.bookingData as BookingData,
          ...action.payload,
          created_at: state.bookingData?.created_at || new Date().toISOString(),
        }
      };
    case 'SET_DATE_TIME_INFO':
      // Log pour s'assurer que la date est bien reçue
      console.log("Setting date in context:", action.payload.date);
      
      return {
        ...state,
        bookingData: {
          ...state.bookingData as BookingData,
          ...action.payload,
        },
        isComplete: Boolean(state.bookingData?.studio_id && action.payload.date && 
          action.payload.start_time && action.payload.end_time)
      };
    case 'SET_PRICE_INFO':
      return {
        ...state,
        bookingData: {
          ...state.bookingData as BookingData,
          ...action.payload,
        }
      };
    case 'SET_SERVICE_INFO':
      return {
        ...state,
        selectedService: action.payload
      };
    case 'RESET_BOOKING':
      return initialState;
    default:
      return state;
  }
};

// Create the context
interface BookingContextProps {
  state: BookingContextState;
  setStudioInfo: (data: { studio_id: string }) => void;
  setDateTimeInfo: (data: { date: string; start_time: string; end_time: string; number_of_guests: number }) => void;
  setPriceInfo: (data: { total_price: number }) => void;
  setServiceInfo: (data: SelectedService) => void;
  resetBooking: () => void;
  updateStudioAvailability: (bookingData: BookingData) => Promise<void>;
}

const BookingContext = createContext<BookingContextProps | undefined>(undefined);

// Function to update studio availability based on booking data
const updateStudioAvailabilityInDB = async (bookingData: BookingData) => {
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
    const { data: existingSlot, error: fetchError } = await supabase
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
      const { error: updateError } = await supabase
        .from('studio_availability')
        .update({ is_available: false })
        .eq('id', existingSlot.id);
      
      if (updateError) {
        console.error("Error updating slot availability:", updateError);
      }
    } else {
      // Create new slot
      const { error: insertError } = await supabase
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
};

// Create the provider component
export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  
  // Récupérer les données de réservation depuis localStorage au chargement
  useEffect(() => {
    const savedBookingData = localStorage.getItem('pendingBooking');
    if (savedBookingData) {
      const bookingData = JSON.parse(savedBookingData);
      // Rétablir les informations de studio
      if (bookingData.studio_id) {
        dispatch({ 
          type: 'SET_STUDIO_INFO', 
          payload: { studio_id: bookingData.studio_id }
        });
      }
      
      // Rétablir les informations de date et heure
      if (bookingData.date && bookingData.start_time && bookingData.end_time) {
        dispatch({
          type: 'SET_DATE_TIME_INFO',
          payload: {
            date: bookingData.date,
            start_time: bookingData.start_time,
            end_time: bookingData.end_time,
            number_of_guests: bookingData.number_of_guests
          }
        });
      }
      
      // Rétablir les informations de prix si disponibles
      if (bookingData.total_price) {
        dispatch({
          type: 'SET_PRICE_INFO',
          payload: { total_price: bookingData.total_price }
        });
      }
    }
    
    // Récupérer la sélection de service
    const savedServiceData = localStorage.getItem('selectedService');
    if (savedServiceData) {
      const serviceData = JSON.parse(savedServiceData);
      dispatch({
        type: 'SET_SERVICE_INFO',
        payload: serviceData
      });
    }
  }, []);

  const setStudioInfo = (data: { studio_id: string }) => {
    dispatch({ type: 'SET_STUDIO_INFO', payload: data });
  };

  const setDateTimeInfo = (data: { date: string; start_time: string; end_time: string; number_of_guests: number }) => {
    dispatch({ type: 'SET_DATE_TIME_INFO', payload: data });
    
    // Mettre à jour localStorage
    const bookingData = {
      ...state.bookingData,
      ...data
    };
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
  };

  const setPriceInfo = (data: { total_price: number }) => {
    dispatch({ type: 'SET_PRICE_INFO', payload: data });
  };
  
  const setServiceInfo = (data: SelectedService) => {
    dispatch({ type: 'SET_SERVICE_INFO', payload: data });
    localStorage.setItem('selectedService', JSON.stringify(data));
  };

  const resetBooking = () => {
    localStorage.removeItem('pendingBooking');
    localStorage.removeItem('selectedService');
    dispatch({ type: 'RESET_BOOKING' });
  };
  
  // Function to update studio availability
  const updateStudioAvailability = async (bookingData: BookingData) => {
    await updateStudioAvailabilityInDB(bookingData);
  };

  return (
    <BookingContext.Provider value={{ 
      state, 
      setStudioInfo, 
      setDateTimeInfo, 
      setPriceInfo,
      setServiceInfo,
      resetBooking,
      updateStudioAvailability
    }}>
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook to use the booking context
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
