import React from 'react';
import RegisterForm from '@/components/user/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | Custom Candles',
  description: 'Create a new account to shop custom candles and manage your orders.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <RegisterForm />
      </div>
    </div>
  );
}