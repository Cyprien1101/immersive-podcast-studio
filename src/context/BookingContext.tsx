
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
  createBooking: (userId: string) => Promise<{ success: boolean; bookingId?: string; error?: any }>;
  updateStudioAvailability: (booking: BookingData) => Promise<void>;
}

const BookingContext = createContext<BookingContextProps | undefined>(undefined);

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

  // Fonction pour créer une réservation dans Supabase
  const createBooking = async (userId: string) => {
    if (!state.bookingData) {
      return { success: false, error: "No booking data available" };
    }
    
    try {
      // Vérifier si une réservation existe déjà avec les mêmes données
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', userId)
        .eq('studio_id', state.bookingData.studio_id)
        .eq('date', state.bookingData.date)
        .eq('start_time', state.bookingData.start_time)
        .eq('end_time', state.bookingData.end_time);
      
      // Si une réservation identique existe déjà, ne pas en créer une nouvelle
      if (existingBookings && existingBookings.length > 0) {
        console.log("Une réservation identique existe déjà:", existingBookings[0].id);
        return { 
          success: true, 
          bookingId: existingBookings[0].id 
        };
      }
      
      // Si le studio_id n'est pas défini, utilisez l'ID spécifié
      const studioId = state.bookingData.studio_id || "d9c24a0a-d94a-4cbc-b489-fa5cfe73ce08";
      
      // Créer la réservation dans Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          studio_id: studioId,
          date: state.bookingData.date,
          start_time: state.bookingData.start_time,
          end_time: state.bookingData.end_time,
          number_of_guests: state.bookingData.number_of_guests,
          total_price: state.bookingData.total_price || 0,
          status: 'upcoming'
        })
        .select()
        .single();
      
      if (error) {
        console.error("Erreur lors de la création de la réservation:", error);
        return { success: false, error };
      }
      
      // Mettre à jour la disponibilité du studio
      await updateStudioAvailability({
        ...data,
        studio_id: studioId,
      });
      
      return { 
        success: true, 
        bookingId: data.id 
      };
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);
      return { success: false, error };
    }
  };
  
  // Fonction pour mettre à jour la disponibilité du studio
  const updateStudioAvailability = async (booking: BookingData) => {
    try {
      // Utiliser l'URL complète pour la fonction edge
      const functionUrl = `${supabase.functions.url}/update-studio-availability`;
      
      const response = await fetch(
        functionUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({ booking })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur lors de la mise à jour de la disponibilité:", errorData);
      }
    } catch (error) {
      console.error("Erreur lors de l'appel à la fonction Edge:", error);
    }
  };

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

  return (
    <BookingContext.Provider value={{ 
      state, 
      setStudioInfo, 
      setDateTimeInfo, 
      setPriceInfo,
      setServiceInfo,
      resetBooking,
      createBooking,
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
