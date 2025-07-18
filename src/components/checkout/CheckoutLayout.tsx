import React, { ReactNode } from 'react';
import { FadeInSection } from '../animation';

interface CheckoutLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({ children, sidebar }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FadeInSection>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {children}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              {sidebar}
            </div>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};

export default CheckoutLayout;