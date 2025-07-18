import React from 'react';
import ProfileForm from '@/components/user/ProfileForm';
import OrderHistory from '@/components/user/OrderHistory';
import { Metadata } from 'next';
import ProfileTabs from '@/components/user/ProfileTabs';
import { PageTransition } from '@/components/animation';

export const metadata: Metadata = {
  title: 'Your Profile | Custom Candles',
  description: 'Manage your profile, addresses, and view your order history for Custom Candles.',
};

export default function ProfilePage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ProfileTabs />
        </div>
      </div>
    </PageTransition>
  );
}