
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from '@/hooks/use-mobile';

interface Step {
  id: string;
  label: string;
}

interface StepperProgressProps {
  steps: Step[];
  currentStep: string;
}

const StepperProgress: React.FC<StepperProgressProps> = ({ steps, currentStep }) => {
  // Calculate progress percentage
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-6">
      {/* Step labels */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
          const isLast = index === steps.length - 1;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div 
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-1 sm:mb-2
                    ${isActive ? 'bg-podcast-accent text-white' : 
                      isCompleted ? 'bg-green-600 text-white' : 
                      'bg-gray-700 text-gray-300'}`}
                >
                  {isCompleted ? (
                    <CheckCircle className={`h-4 w-4 sm:h-6 sm:w-6`} />
                  ) : (
                    <span className={`${isMobile ? 'text-xs sm:text-sm' : 'text-sm'}`}>{index + 1}</span>
                  )}
                </div>
                <span 
                  className={`${isMobile ? 'text-[10px]' : 'text-xs sm:text-sm'} font-medium truncate max-w-[60px] sm:max-w-[80px] text-center
                    ${isActive ? 'text-podcast-accent' : 
                      isCompleted ? 'text-green-600' : 
                      'text-gray-400'}`}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Separator line between steps */}
              {!isLast && (
                <Separator 
                  orientation="horizontal" 
                  className={`h-0.5 flex-1 mx-1 sm:mx-2 bg-gray-700`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepperProgress;
