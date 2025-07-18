import React from 'react';
import { TransitionElement } from '../animation';

export type CheckoutStep = 'shipping' | 'payment' | 'review';

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
  allowNavigation?: boolean;
}

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ 
  currentStep, 
  onStepClick,
  allowNavigation = false
}) => {
  const steps: { key: CheckoutStep; label: string }[] = [
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
    { key: 'review', label: 'Review' }
  ];

  const getStepStatus = (step: CheckoutStep) => {
    const stepIndex = steps.findIndex(s => s.key === step);
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const handleStepClick = (step: CheckoutStep) => {
    if (!allowNavigation) return;
    
    const stepIndex = steps.findIndex(s => s.key === step);
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    
    // Only allow clicking on completed steps or the next step
    if (stepIndex <= currentIndex && onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleStepClick(step.key)}
                disabled={!allowNavigation}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${getStepStatus(step.key) === 'completed' 
                    ? 'bg-maroon text-white' 
                    : getStepStatus(step.key) === 'current'
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 text-gray-500'}
                  ${allowNavigation && getStepStatus(step.key) !== 'upcoming' 
                    ? 'cursor-pointer hover:opacity-90' 
                    : ''}
                  transition-all duration-300
                `}
              >
                {getStepStatus(step.key) === 'completed' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>
              
              {/* Step label */}
              <TransitionElement>
                <span 
                  className={`
                    mt-2 text-sm font-medium
                    ${getStepStatus(step.key) === 'current' ? 'text-red-500' : 'text-gray-500'}
                  `}
                >
                  {step.label}
                </span>
              </TransitionElement>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div 
                  className={`
                    h-1 
                    ${getStepStatus(steps[index + 1].key) === 'upcoming' 
                      ? 'bg-gray-200' 
                      : 'bg-maroon'}
                  `}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CheckoutStepper;