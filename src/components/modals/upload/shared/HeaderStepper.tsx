import React from 'react';

interface HeaderStepperProps {
  title: string;
  subtitle: string;
  currentStep: number;
  totalSteps: number;
}

const HeaderStepper: React.FC<HeaderStepperProps> = ({ 
  title, 
  subtitle, 
  currentStep, 
  totalSteps 
}) => {
  return (
    <>
      {/* Header */}
      <div className="text-center space-y-1 sm:space-y-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          {subtitle}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center space-x-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              index + 1 <= currentStep 
                ? 'bg-brand text-white' 
                : 'bg-gray-300 text-gray-600'
            }`}>
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div className={`w-6 sm:w-8 h-0.5 ml-1 ${
                index + 1 < currentStep ? 'bg-brand' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default HeaderStepper;
