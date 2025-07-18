import React from 'react';
import { TransitionElement } from '../animation';

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
}

interface ShippingOptionsProps {
  options: ShippingOption[];
  selectedOption: string;
  onOptionChange: (optionId: string) => void;
  subtotal: number;
  freeShippingThreshold?: number;
}

export const ShippingOptions: React.FC<ShippingOptionsProps> = ({
  options,
  selectedOption,
  onOptionChange,
  subtotal,
  freeShippingThreshold = 50,
}) => {
  const amountToFreeShipping = freeShippingThreshold - subtotal;
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Shipping Method</h3>
      
      {!qualifiesForFreeShipping && amountToFreeShipping > 0 && (
        <TransitionElement>
          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <p className="text-sm text-blue-700">
              Add <span className="font-semibold">${amountToFreeShipping.toFixed(2)}</span> more to your order to qualify for free shipping!
            </p>
          </div>
        </TransitionElement>
      )}

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isFree = qualifiesForFreeShipping && option.id === 'standard';
          
          return (
            <TransitionElement key={option.id}>
              <div
                className={`
                  relative border rounded-md p-4 cursor-pointer transition-all
                  ${isSelected ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
                `}
                onClick={() => onOptionChange(option.id)}
              >
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={`shipping-${option.id}`}
                      name="shipping-option"
                      type="radio"
                      checked={isSelected}
                      onChange={() => onOptionChange(option.id)}
                      className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                  </div>
                  <div className="ml-3 flex-grow">
                    <label htmlFor={`shipping-${option.id}`} className="text-sm font-medium text-gray-900">
                      {option.name}
                      {isFree && <span className="ml-2 text-green-600 font-semibold">(FREE)</span>}
                    </label>
                    <p className="text-sm text-gray-500">{option.description}</p>
                    <p className="text-sm text-gray-500">Estimated delivery: {option.estimatedDelivery}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {isFree ? (
                      <span className="line-through text-gray-400">${option.price.toFixed(2)}</span>
                    ) : (
                      `$${option.price.toFixed(2)}`
                    )}
                  </div>
                </div>
              </div>
            </TransitionElement>
          );
        })}
      </div>
    </div>
  );
};

export default ShippingOptions;