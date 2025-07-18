import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileForm from './ProfileForm';
import OrderHistory from './OrderHistory';
import { TransitionElement } from '../animation/TransitionElement';

const ProfileTabs: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Access</h2>
        <p className="mb-6">Please log in to view your profile and order history.</p>
        <a 
          href="/account/login" 
          className="bg-maroon text-white py-2 px-6 rounded-md hover:bg-red-700 transition duration-200"
        >
          Log In
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex-1 ${
                activeTab === 'profile'
                  ? 'border-maroon text-maroon'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile & Addresses
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex-1 ${
                activeTab === 'orders'
                  ? 'border-maroon text-maroon'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Order History
            </button>
          </nav>
        </div>

        <div className="p-0">
          <TransitionElement isVisible={activeTab === 'profile'} animation="fade">
            {activeTab === 'profile' && <ProfileForm />}
          </TransitionElement>
          
          <TransitionElement isVisible={activeTab === 'orders'} animation="fade">
            {activeTab === 'orders' && <OrderHistory />}
          </TransitionElement>
        </div>
      </div>
    </div>
  );
};

export default ProfileTabs;