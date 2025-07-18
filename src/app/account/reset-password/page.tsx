import React from 'react';
import ResetPasswordForm from '@/components/user/ResetPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | Custom Candles',
  description: 'Reset your password for your Custom Candles account.',
};

interface ResetPasswordPageProps {
  searchParams: { token?: string };
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = searchParams;

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Invalid Reset Link</h2>
          <p className="text-center text-gray-600">
            The password reset link is invalid or has expired. Please request a new password reset link.
          </p>
          <div className="mt-6 text-center">
            <a
              href="/account/forgot-password"
              className="text-maroon hover:text-red-700 font-medium"
            >
              Request a new reset link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}