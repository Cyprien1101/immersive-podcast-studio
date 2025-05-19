
import React from 'react';
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';
import DateSelector from './DateSelector';
import SessionDetails from './SessionDetails';
import TimeCategoryContainer from './TimeCategoryContainer';
import { useDateTimeLogic } from './useDateTimeLogic';

interface DateTimeSelectionProps {
  studio: any;
  onProceed: (bookingDetails: {
    date: Date;
    startTime: string;
    duration: number;
    guests: number;
  }) => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({ studio, onProceed }) => {
  const {
    date,
    setDate,
    availableTimeSlots,
    selectedStartTime,
    duration,
    guests,
    loading,
    timeCategories,
    canSelectTimeSlot,
    formatTimeSlot,
    handleDurationChange,
    handleGuestsChange,
    handleSelectTimeSlot,
    handleProceed,
    disabledDays
  } = useDateTimeLogic({ studio, onProceed });
  
  return (
    <ScrollAnimationWrapper animation="fade-up">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Column - Calendar */}
        <DateSelector 
          date={date}
          setDate={setDate}
          disabledDays={disabledDays}
        />
        
        {/* Right Column - Session Details */}
        <SessionDetails
          duration={duration}
          guests={guests}
          handleDurationChange={handleDurationChange}
          handleGuestsChange={handleGuestsChange}
          maxBookingDuration={studio?.max_booking_duration || 3}
          maxGuests={studio?.max_guests || 10}
        />
      </div>
      
      {/* Time Slots Section */}
      <TimeCategoryContainer
        loading={loading}
        timeCategories={timeCategories}
        selectedStartTime={selectedStartTime}
        availableTimeSlots={availableTimeSlots}
        handleSelectTimeSlot={handleSelectTimeSlot}
        canSelectTimeSlot={canSelectTimeSlot}
        formatTimeSlot={formatTimeSlot}
        handleProceed={handleProceed}
      />
    </ScrollAnimationWrapper>
  );
};

export default DateTimeSelection;
