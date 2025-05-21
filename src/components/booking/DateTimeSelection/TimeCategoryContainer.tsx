
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import TimeCategory from './TimeCategory';

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface TimeCategory {
  label: string;
  startHour: number;
  endHour: number;
  slots: TimeSlot[];
}

interface TimeCategoryContainerProps {
  loading: boolean;
  timeCategories: TimeCategory[];
  selectedStartTime: string | null;
  availableTimeSlots: TimeSlot[];
  handleSelectTimeSlot: (time: string) => void;
  canSelectTimeSlot: (slotIndex: number) => boolean;
  formatTimeSlot: (time: string) => string;
  handleProceed: () => void;
}

const TimeCategoryContainer: React.FC<TimeCategoryContainerProps> = ({
  loading,
  timeCategories,
  selectedStartTime,
  availableTimeSlots,
  handleSelectTimeSlot,
  canSelectTimeSlot,
  formatTimeSlot,
  handleProceed,
}) => {
  // Traduire les labels des catégories
  const translateTimeCategory = (label: string): string => {
    switch (label) {
      case 'Morning':
        return 'Matin';
      case 'Afternoon':
        return 'Après-midi';
      case 'Evening':
        return 'Soirée';
      case 'Night':
        return 'Nuit';
      default:
        return label;
    }
  };

  // Vérifier si des créneaux existent
  const hasTimeSlots = availableTimeSlots.length > 0;
  
  // Vérifier s'il y a des créneaux disponibles
  const hasAvailableSlots = availableTimeSlots.some(slot => slot.isAvailable);

  return (
    <Card className="mt-8 bg-podcast-dark border-gray-800 text-white">
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Créneaux Horaires Disponibles</h3>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : (
          <>
            {timeCategories.map((category, categoryIndex) => (
              <TimeCategory
                key={categoryIndex}
                label={translateTimeCategory(category.label)}
                slots={category.slots}
                selectedStartTime={selectedStartTime}
                availableTimeSlots={availableTimeSlots}
                handleSelectTimeSlot={handleSelectTimeSlot}
                canSelectTimeSlot={canSelectTimeSlot}
                formatTimeSlot={formatTimeSlot}
              />
            ))}
            
            {!hasTimeSlots && !loading && (
              <p className="text-center text-gray-400 my-6">Aucun créneau horaire trouvé pour cette date.</p>
            )}
            
            {hasTimeSlots && !hasAvailableSlots && !loading && (
              <p className="text-center text-gray-400 my-6">Tous les créneaux sont indisponibles pour cette date.</p>
            )}
            
            <div className="mt-8 flex justify-center">
              <Button 
                className="px-8 bg-black text-white border border-white hover:bg-gray-800"
                disabled={!selectedStartTime}
                onClick={handleProceed}
              >
                Continuer
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeCategoryContainer;
