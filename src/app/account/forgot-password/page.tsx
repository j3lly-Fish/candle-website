import React from 'react';
import ForgotPasswordForm from '@/components/user/ForgotPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Custom Candles',
  description: 'Reset your password for your Custom Candles account.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}