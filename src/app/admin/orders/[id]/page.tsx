import React from 'react';
import AdminOrderDetailClient from './AdminOrderDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  return <AdminOrderDetailClient orderId={id} />;
}