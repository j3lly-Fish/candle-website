import React from 'react';
import LoginForm from '@/components/user/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Custom Candles',
  description: 'Login to your Custom Candles account to manage your orders and profile.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <LoginForm />
      </div>
    </div>
  );
}