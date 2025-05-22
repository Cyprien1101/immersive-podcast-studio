
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

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

interface BookingContextState {
  bookingData: BookingData | null;
  isComplete: boolean;
}

type BookingAction = 
  | { type: 'SET_STUDIO_INFO'; payload: { studio_id: string } }
  | { type: 'SET_DATE_TIME_INFO'; payload: { date: string; start_time: string; end_time: string; number_of_guests: number } }
  | { type: 'SET_PRICE_INFO'; payload: { total_price: number } }
  | { type: 'RESET_BOOKING' };

const initialState: BookingContextState = {
  bookingData: null,
  isComplete: false,
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
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextProps | undefined>(undefined);

// Create the provider component
export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const setStudioInfo = (data: { studio_id: string }) => {
    dispatch({ type: 'SET_STUDIO_INFO', payload: data });
  };

  const setDateTimeInfo = (data: { date: string; start_time: string; end_time: string; number_of_guests: number }) => {
    dispatch({ type: 'SET_DATE_TIME_INFO', payload: data });
  };

  const setPriceInfo = (data: { total_price: number }) => {
    dispatch({ type: 'SET_PRICE_INFO', payload: data });
  };

  const resetBooking = () => {
    dispatch({ type: 'RESET_BOOKING' });
  };

  return (
    <BookingContext.Provider value={{ 
      state, 
      setStudioInfo, 
      setDateTimeInfo, 
      setPriceInfo, 
      resetBooking 
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
