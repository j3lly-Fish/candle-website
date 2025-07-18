import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product/ProductDetail';
import { PageTransition } from '@/components/animation';

interface ProductPageProps {
  params: {
    id: string;
  };
}

async function getProductById(id: string) {
  try {
    // In a real app, this would be a fetch to your API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductById(params.id);
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }
  
  return {
    title: `${product.name} | Custom Candle Shop`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id);
  
  if (!product) {
    notFound();
  }
  
  return (
    <PageTransition>
      <ProductDetail product={product} />
    </PageTransition>
  );
}