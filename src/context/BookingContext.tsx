
import React, { createContext, useContext, useState } from 'react';

// Define types
export type BookingData = {
  studio_id: string;
  date: string;
  start_time: string;
  end_time: string;
  number_of_guests: number;
  duration?: number; // Added duration as optional property
};

type ServiceInfo = {
  id: string;
  name: string;
  type: 'subscription' | 'hourPackage';
};

type DateTimeInfo = {
  date: string;
  start_time: string;
  end_time: string;
  number_of_guests: number;
  duration: number;
};

type BookingContextState = {
  bookingData: BookingData | null;
  serviceInfo: ServiceInfo | null;
};

type BookingContextValue = {
  state: BookingContextState;
  setBookingData: (data: BookingData) => void;
  setServiceInfo: (info: ServiceInfo) => void;
  clearBookingData: () => void;
  resetBooking: () => void; // Added missing function
  setDateTimeInfo: (info: DateTimeInfo) => void; // Added missing function
};

// Create context
const BookingContext = createContext<BookingContextValue | undefined>(undefined);

// Provider component
export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<BookingContextState>({
    bookingData: null,
    serviceInfo: null
  });

  const setBookingData = (data: BookingData) => {
    setState(prev => ({
      ...prev,
      bookingData: data
    }));
  };

  const setServiceInfo = (info: ServiceInfo) => {
    setState(prev => ({
      ...prev,
      serviceInfo: info
    }));
  };

  const clearBookingData = () => {
    setState({
      bookingData: null,
      serviceInfo: null
    });
  };

  // Add the missing setDateTimeInfo function
  const setDateTimeInfo = (info: DateTimeInfo) => {
    setState(prev => ({
      ...prev,
      bookingData: {
        ...(prev.bookingData || {}),
        date: info.date,
        start_time: info.start_time,
        end_time: info.end_time,
        number_of_guests: info.number_of_guests,
        duration: info.duration,
        studio_id: prev.bookingData?.studio_id || ''
      } as BookingData
    }));
  };

  // Add resetBooking as an alias for clearBookingData for backward compatibility
  const resetBooking = clearBookingData;

  return (
    <BookingContext.Provider value={{ 
      state, 
      setBookingData, 
      setServiceInfo, 
      clearBookingData, 
      resetBooking, 
      setDateTimeInfo 
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
