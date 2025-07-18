import React from 'react';
import Link from 'next/link';
import { PageTransition } from '@/components/animation';

export default function ProductNotFound() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">
          We couldn't find the product you're looking for. It may have been removed or the URL might be incorrect.
        </p>
        <Link 
          href="/products" 
          className="inline-block bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 transition-colors duration-300"
        >
          Browse All Products
        </Link>
      </div>
    </PageTransition>
  );
}