import React from 'react';
import Image from 'next/image';
import { TransitionElement } from '../animation';

export interface OrderSummaryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customizations?: {
    scent?: { name: string };
    color?: { name: string };
    size?: { name: string };
  };
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalPrice: number;
  showItemDetails?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  tax,
  shippingCost,
  totalPrice,
  showItemDetails = true,
}) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>

      {showItemDetails && (
        <div className="flow-root">
          <ul className="-my-6 divide-y divide-gray-200">
            {items.map((item) => (
              <TransitionElement key={item.id}>
                <li className="py-6 flex">
                  {/* Item image */}
                  {item.image && (
                    <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-center object-cover"
                      />
                    </div>
                  )}

                  {/* Item details */}
                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-sm font-medium text-gray-900">
                        <h4>{item.name}</h4>
                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Qty {item.quantity}</p>
                    </div>

                    {/* Customizations */}
                    {item.customizations && (
                      <div className="mt-1 text-xs text-gray-500">
                        {item.customizations.scent && (
                          <p>Scent: {item.customizations.scent.name}</p>
                        )}
                        {item.customizations.color && (
                          <p>Color: {item.customizations.color.name}</p>
                        )}
                        {item.customizations.size && (
                          <p>Size: {item.customizations.size.name}</p>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              </TransitionElement>
            ))}
          </ul>
        </div>
      )}

      {/* Order totals */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <p>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</p>
          <p>${subtotal.toFixed(2)}</p>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <p>Shipping</p>
          <p>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</p>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <p>Tax</p>
          <p>${tax.toFixed(2)}</p>
        </div>
        <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t border-gray-200">
          <p>Total</p>
          <p>${totalPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;